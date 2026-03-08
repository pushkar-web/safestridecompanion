import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TripState {
  isActive: boolean;
  sessionId: string;
  routeFrom: string;
  routeTo: string;
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
}

const TripContext = createContext<TripContextType | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<TripState | null>(null);
  const [sosStatus, setSosStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const startTrip = useCallback((from: string, to: string) => {
    setTrip({
      isActive: true,
      sessionId: `trip_${Date.now()}`,
      routeFrom: from,
      routeTo: to,
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
        start_lat: 19.1136,
        start_lng: 72.8697,
        end_lat: 19.0596,
        end_lng: 72.8295,
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

    try {
      const { data, error } = await supabase.functions.invoke("sos-alert", {
        body: {
          session_id: trip.sessionId,
          location: trip.routeFrom + " → " + trip.routeTo,
          lat: 19.0860,
          lng: 72.8400,
          contacts: ["Contact 1", "Contact 2"],
        },
      });

      if (error) throw error;
      setSosStatus("sent");
    } catch (e) {
      console.error("SOS error:", e);
      setSosStatus("error");
    }
  }, [trip]);

  return (
    <TripContext.Provider value={{ trip, startTrip, endTrip, incrementRisks, triggerSOS, sosStatus }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
