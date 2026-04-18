import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/contexts/AuthContext";

interface RiskZone {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  description: string;
  location_name: string | null;
}

const distanceKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

/**
 * Watches user location and fires alerts when entering a high-risk zone
 * or at risky times of day. Also stores frequent locations.
 */
export function useGeofence(enabled: boolean = true) {
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const triggered = useRef<Set<string>>(new Set());
  const lastTimeAlert = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;
    let zones: RiskZone[] = [];
    let watchId: number | null = null;

    (async () => {
      const { data } = await supabase
        .from("safety_reports")
        .select("id, latitude, longitude, severity, description, location_name")
        .in("severity", ["high", "critical"])
        .limit(150);
      if (data) {
        zones = data.map((z: any) => ({
          id: z.id,
          lat: z.latitude,
          lng: z.longitude,
          severity: z.severity,
          description: z.description,
          location_name: z.location_name,
        }));
      }

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];

          // Geofence check
          for (const z of zones) {
            if (triggered.current.has(z.id)) continue;
            const d = distanceKm(here, [z.lat, z.lng]);
            if (d < 0.4) {
              triggered.current.add(z.id);
              addNotification({
                type: "safety",
                title: "⚠️ High-risk zone nearby",
                message: `You're near ${z.location_name || "a flagged area"}: ${z.description.slice(0, 100)}. Stay alert.`,
                icon: "⚠️",
              });
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            }
          }

          // Time-based alert (after 8pm, once per session)
          const hr = new Date().getHours();
          if ((hr >= 20 || hr < 5) && Date.now() - lastTimeAlert.current > 30 * 60 * 1000) {
            lastTimeAlert.current = Date.now();
            addNotification({
              type: "safety",
              title: "🌙 It's getting late",
              message: "Consider sharing your live location with a trusted contact.",
              icon: "🌙",
            });
          }
        },
        (err) => console.warn("Geolocation:", err.message),
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 }
      );
    })();

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [enabled, addNotification, user]);
}
