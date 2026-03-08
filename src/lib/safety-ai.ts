import { supabase } from "@/integrations/supabase/client";

export interface RiskAssessment {
  risk_score: number;
  risk_label: string;
  insights: Array<{ text: string; type: "warning" | "safe" | "info" }>;
  nearby_resources: Array<{ name: string; type: string; phone?: string }>;
  tips: string[];
  rag_sources: Array<{ title: string; category: string }>;
}

export interface BadgeData {
  badge_title: string;
  badge_description: string;
  achievement_message: string;
  safety_tip: string;
  know_your_rights: { section: string; description: string };
  rag_sources: Array<{ title: string; category: string }>;
}

export async function assessRouteRisk(
  routeFrom: string,
  routeTo: string,
  timeOfDay: string = "evening"
): Promise<RiskAssessment> {
  const { data, error } = await supabase.functions.invoke("safety-ai", {
    body: {
      route_from: routeFrom,
      route_to: routeTo,
      time_of_day: timeOfDay,
      context_type: "risk_assessment",
    },
  });

  if (error) throw error;
  return data as RiskAssessment;
}

export async function generateBadge(
  routeFrom: string,
  routeTo: string,
  risksAverted: number
): Promise<BadgeData> {
  const { data, error } = await supabase.functions.invoke("safety-ai", {
    body: {
      route_from: routeFrom,
      route_to: routeTo,
      query: String(risksAverted),
      context_type: "badge_generation",
    },
  });

  if (error) throw error;
  return data as BadgeData;
}
