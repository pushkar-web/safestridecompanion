import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type PointAction =
  | "trip_completed"
  | "report_submitted"
  | "badge_earned"
  | "daily_checkin"
  | "sos_triggered"
  | "route_planned"
  | "chat_question"
  | "challenge_completed"
  | "live_share"
  | "high_risk_avoided";

const DEFAULT_POINTS: Record<PointAction, number> = {
  trip_completed: 50,
  report_submitted: 30,
  badge_earned: 20,
  daily_checkin: 10,
  sos_triggered: 0,
  route_planned: 5,
  chat_question: 2,
  challenge_completed: 100,
  live_share: 8,
  high_risk_avoided: 25,
};

const ACTION_LABELS: Record<PointAction, string> = {
  trip_completed: "Safe trip completed",
  report_submitted: "Community report submitted",
  badge_earned: "Badge earned",
  daily_checkin: "Daily check-in",
  sos_triggered: "Emergency triggered",
  route_planned: "Route planned",
  chat_question: "AI consultation",
  challenge_completed: "Challenge completed",
  live_share: "Live location shared",
  high_risk_avoided: "High-risk zone avoided",
};

/**
 * Hook to award points to the current user. Calls the SECURITY DEFINER
 * `award_points` RPC which logs an event and updates the user_points row.
 */
export function useAwardPoints() {
  const { user } = useAuth();

  const award = useCallback(
    async (action: PointAction, customAmount?: number, metadata?: Record<string, unknown>) => {
      if (!user) return null;
      const amount = customAmount ?? DEFAULT_POINTS[action];
      if (amount <= 0) return null;
      try {
        const { data, error } = await (supabase as any).rpc("award_points", {
          _action: action,
          _amount: amount,
          _metadata: metadata || {},
        });
        if (error) {
          console.warn("award_points failed:", error.message);
          return null;
        }
        toast.success(`+${amount} points`, {
          description: ACTION_LABELS[action],
          duration: 2200,
        });
        return data;
      } catch (e) {
        console.warn("award_points threw:", e);
        return null;
      }
    },
    [user]
  );

  return { award };
}
