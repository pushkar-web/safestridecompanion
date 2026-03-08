import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocationCoords } from "@/lib/mumbai-coordinates";

export interface EmergencyContact {
  name: string;
  phone: string;
  email: string;
}

interface TripState {
  isActive: boolean;
  sessionId: string;
  routeFrom: string;
  routeTo: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startTime: number;
  risksAverted: number;
  sosTriggered: boolean;
}

interface TripContextType {
  trip: TripState | null;
  startTrip: (from: string, to: string) => void;
  endTrip: () => Promise<void>;
  incrementRisks: () => void;
  triggerSOS: () => Promise<void>;
  sosStatus: "idle" | "sending" | "sent" | "error";
  emergencyContacts: EmergencyContact[];
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
}

const TripContext = createContext<TripContextType | null>(null);

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { name: "Mom", phone: "+919876543210", email: "mom@example.com" },
  { name: "Dad", phone: "+919876543211", email: "dad@example.com" },
];

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<TripState | null>(null);
  const [sosStatus, setSosStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem("safestride_contacts");
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const handleSetContacts = useCallback((contacts: EmergencyContact[]) => {
    setEmergencyContacts(contacts);
    localStorage.setItem("safestride_contacts", JSON.stringify(contacts));
  }, []);

  const startTrip = useCallback((from: string, to: string) => {
    const fromCoords = getLocationCoords(from);
    const toCoords = getLocationCoords(to);

    setTrip({
      isActive: true,
      sessionId: `trip_${Date.now()}`,
      routeFrom: from,
      routeTo: to,
      startLat: fromCoords?.lat ?? 19.1136,
      startLng: fromCoords?.lng ?? 72.8697,
      endLat: toCoords?.lat ?? 19.0596,
      endLng: toCoords?.lng ?? 72.8295,
      startTime: Date.now(),
      risksAverted: 0,
      sosTriggered: false,
    });
    setSosStatus("idle");
  }, []);

  const endTrip = useCallback(async () => {
    if (!trip) return;
    const duration = Math.floor((Date.now() - trip.startTime) / 1000);

    try {
      await supabase.from("trip_history" as any).insert({
        session_id: trip.sessionId,
        start_location: trip.routeFrom,
        end_location: trip.routeTo,
        start_lat: trip.startLat,
        start_lng: trip.startLng,
        end_lat: trip.endLat,
        end_lng: trip.endLng,
        risk_score: 25,
        risks_averted: trip.risksAverted,
        duration_seconds: duration,
      } as any);
    } catch (e) {
      console.error("Failed to save trip:", e);
    }

    setTrip((t) => t ? { ...t, isActive: false } : null);
  }, [trip]);

  const incrementRisks = useCallback(() => {
    setTrip((t) => t ? { ...t, risksAverted: t.risksAverted + 1 } : null);
  }, []);

  const triggerSOS = useCallback(async () => {
    if (!trip) return;
    setSosStatus("sending");
    setTrip((t) => t ? { ...t, sosTriggered: true } : null);

    const currentLat = (trip.startLat + trip.endLat) / 2;
    const currentLng = (trip.startLng + trip.endLng) / 2;
    const mapsLink = `https://maps.google.com/?q=${currentLat},${currentLng}`;
    const locationText = `${trip.routeFrom} → ${trip.routeTo}`;

    try {
      // 1. Call backend SOS function
      const { data, error } = await supabase.functions.invoke("sos-alert", {
        body: {
          session_id: trip.sessionId,
          location: locationText,
          lat: currentLat,
          lng: currentLng,
          contacts: emergencyContacts.map((c) => c.name),
        },
      });

      if (error) throw error;

      // 2. Open native channels for each contact
      const sosMessage = `🚨 SOS EMERGENCY! I need help NOW!\n📍 Location: ${locationText}\n🗺️ Maps: ${mapsLink}\n⏰ Time: ${new Date().toLocaleTimeString()}\nCall police: 100 | Women helpline: 181`;

      // Send SMS to all contacts
      const phoneNumbers = emergencyContacts.map((c) => c.phone).join(",");
      window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(sosMessage)}`, "_blank");

      // Send Email to all contacts
      const emails = emergencyContacts.map((c) => c.email).join(",");
      window.open(
        `mailto:${emails}?subject=${encodeURIComponent("🚨 EMERGENCY SOS - SafeStride Alert")}&body=${encodeURIComponent(sosMessage)}`,
        "_blank"
      );

      // Send WhatsApp to first contact (WhatsApp only supports single contact)
      const firstPhone = emergencyContacts[0]?.phone?.replace(/[^0-9]/g, "");
      if (firstPhone) {
        window.open(
          `https://wa.me/${firstPhone}?text=${encodeURIComponent(sosMessage)}`,
          "_blank"
        );
      }

      setSosStatus("sent");
    } catch (e) {
      console.error("SOS error:", e);
      // Even if backend fails, still try to open native channels
      const sosMessage = `🚨 SOS! I need help! Location: ${locationText}. Maps: ${mapsLink}. Call 100.`;
      const phoneNumbers = emergencyContacts.map((c) => c.phone).join(",");
      window.open(`sms:${phoneNumbers}?body=${encodeURIComponent(sosMessage)}`, "_blank");
      setSosStatus("error");
    }
  }, [trip, emergencyContacts]);

  return (
    <TripContext.Provider
      value={{
        trip,
        startTrip,
        endTrip,
        incrementRisks,
        triggerSOS,
        sosStatus,
        emergencyContacts,
        setEmergencyContacts: handleSetContacts,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
