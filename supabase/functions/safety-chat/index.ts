import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages } = await req.json();
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";

    // Fetch relevant safety docs for RAG context
    const { data: docs } = await supabase
      .from("safety_documents")
      .select("title, content, category, location_name")
      .or(`content.ilike.%${lastUserMsg.split(" ").slice(0, 3).join("%")}%,location_name.ilike.%${lastUserMsg.split(" ")[0]}%`)
      .limit(8);

    const { data: emergencyDocs } = await supabase
      .from("safety_documents")
      .select("title, content, category")
      .in("category", ["emergency", "helpline", "ipc_law"])
      .limit(5);

    // Fetch recent community reports for context
    const { data: recentReports } = await supabase
      .from("safety_reports")
      .select("category, description, location_name, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    const ragContext = [
      ...(docs || []),
      ...(emergencyDocs || []),
    ].map(d => `[${d.category}] ${d.title}: ${d.content}`).join("\n");

    const reportsContext = (recentReports || [])
      .map(r => `[${r.severity}] ${r.category} at ${r.location_name}: ${r.description}`)
      .join("\n");

    const systemPrompt = `You are SafeStride AI, a friendly and empowering women's safety assistant for Mumbai, India. You help women navigate the city safely with practical, actionable advice.

LOCAL SAFETY DATA:
${ragContext || "No specific data available."}

RECENT COMMUNITY REPORTS:
${reportsContext || "No recent reports."}

GUIDELINES:
- Be warm, supportive, and concise (2-4 paragraphs max)
- Reference specific Mumbai locations, landmarks, and transport options
- Include emergency numbers when relevant (Women Helpline: 181, Police: 100, Ambulance: 108)
- Mention relevant IPC sections for legal awareness when appropriate
- Use community report data to give current, real-time safety insights
- Suggest safe alternatives and practical tips
- If asked about a specific area, give time-of-day specific advice
- Use emoji sparingly for warmth 🛡️`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("safety-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
