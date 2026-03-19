import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Agent definitions with specialized system prompts
const AGENTS: Record<string, { name: string; emoji: string; systemPrompt: string; ragCategories: string[] }> = {
  safety_analyst: {
    name: "Safety Analyst",
    emoji: "🛡️",
    systemPrompt: `You are the Safety Analyst Agent of SafeStride, specializing in route risk assessment and crime data analysis for Mumbai. 
You analyze locations, routes, and timing to provide detailed safety scores and risk breakdowns.
- Provide specific risk factors (lighting, crowd density, crime history, police presence)
- Give time-of-day specific analysis
- Suggest safer alternatives when risk is high
- Reference specific Mumbai landmarks and areas
- Use data from safety documents and community reports
Be precise, data-driven, and actionable.`,
    ragCategories: ["safety_zone", "crime_data", "route_safety", "area_profile"],
  },
  legal_advisor: {
    name: "Legal Advisor",
    emoji: "⚖️",
    systemPrompt: `You are the Legal Advisor Agent of SafeStride, specializing in Indian Penal Code (IPC) sections, women's rights, and legal guidance for safety situations in Mumbai.
- Cite specific IPC sections relevant to the situation
- Explain legal rights in simple language
- Provide step-by-step guidance for filing complaints
- Reference relevant helplines and legal aid services
- Explain Protection of Women from Domestic Violence Act, Sexual Harassment at Workplace Act, etc.
Be empowering, clear, and legally accurate.`,
    ragCategories: ["ipc_law", "legal_rights", "helpline"],
  },
  emergency_coordinator: {
    name: "Emergency Coordinator",
    emoji: "🚨",
    systemPrompt: `You are the Emergency Coordinator Agent of SafeStride, specializing in crisis management and emergency response in Mumbai.
- Provide immediate actionable steps for emergencies
- List nearest police stations, hospitals, safe shelters with contact info
- Guide through SOS procedures
- Suggest escape routes and safe havens
- Emergency numbers: Women Helpline 181, Police 100, Ambulance 108, Women Commission 7738299899
Be calm, direct, and life-saving in your responses.`,
    ragCategories: ["emergency", "helpline", "police_station", "hospital"],
  },
  community_intelligence: {
    name: "Community Intelligence",
    emoji: "👥",
    systemPrompt: `You are the Community Intelligence Agent of SafeStride, specializing in aggregating and analyzing community safety reports and trends in Mumbai.
- Summarize recent community reports for specific areas
- Identify safety trends and patterns
- Highlight areas with increasing/decreasing safety concerns
- Provide crowd-sourced safety insights
- Recommend community safety initiatives
Be insightful, data-aware, and community-focused.`,
    ragCategories: ["community_report", "area_profile"],
  },
  companion: {
    name: "Safety Companion",
    emoji: "💜",
    systemPrompt: `You are the Companion Agent of SafeStride, providing empathetic support, mental wellness tips, and de-escalation guidance for women in Mumbai.
- Be warm, supportive, and non-judgmental
- Provide de-escalation techniques for threatening situations
- Share confidence-building safety tips
- Offer mental health resources and helplines
- Help users feel empowered and less anxious about safety
- Use emoji sparingly for warmth
Be a trusted friend who genuinely cares about the user's wellbeing.`,
    ragCategories: ["safety_tips", "mental_health", "self_defense"],
  },
};

// Router: classify intent using a fast model call
async function routeIntent(message: string, apiKey: string): Promise<string> {
  const routerPrompt = `Classify the user's intent into exactly ONE of these agent types. Reply with ONLY the agent type, nothing else.

Agent types:
- safety_analyst: Route safety, area risk, crime data, "is X safe?", safe routes, time-of-day safety
- legal_advisor: Laws, IPC sections, rights, filing complaints, legal help, harassment laws
- emergency_coordinator: Emergency help, SOS, nearest hospital/police, crisis situations, immediate danger
- community_intelligence: Community reports, safety trends, area comparisons, what others report
- companion: Emotional support, anxiety about safety, de-escalation, confidence tips, general chat, wellness

User message: "${message}"

Agent type:`;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: routerPrompt }],
        max_tokens: 20,
      }),
    });
    if (!resp.ok) return "companion";
    const data = await resp.json();
    const agentType = (data.choices?.[0]?.message?.content || "").trim().toLowerCase();
    return AGENTS[agentType] ? agentType : "companion";
  } catch {
    return "companion";
  }
}

// Hash function for CAG
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { messages, force_agent } = await req.json();
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";

    // Step 1: Route to the correct agent
    const agentType = force_agent && AGENTS[force_agent] 
      ? force_agent 
      : await routeIntent(lastUserMsg, LOVABLE_API_KEY);
    const agent = AGENTS[agentType];

    // Step 2: Check CAG cache
    const queryHash = simpleHash(lastUserMsg.toLowerCase().trim());
    const { data: cached } = await supabase
      .from("ai_cache")
      .select("response, id, created_at, ttl_seconds")
      .eq("query_hash", queryHash)
      .eq("agent_type", agentType)
      .limit(1)
      .maybeSingle();

    if (cached) {
      const age = (Date.now() - new Date(cached.created_at).getTime()) / 1000;
      if (age < (cached.ttl_seconds || 3600)) {
        // Cache hit — update hit count and return cached response
        await supabase.from("ai_cache").update({ hit_count: (cached.response as any).hit_count ? (cached.response as any).hit_count + 1 : 1 }).eq("id", cached.id);
        
        const cachedContent = (cached.response as any).content || "";
        // Return as SSE stream for consistency
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const chunk = JSON.stringify({ choices: [{ delta: { content: cachedContent }, finish_reason: null }], agent_type: agentType, agent_name: agent.name, agent_emoji: agent.emoji, cached: true });
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
    }

    // Step 3: Fetch RAG context based on agent's categories
    const { data: docs } = await supabase
      .from("safety_documents")
      .select("title, content, category, location_name")
      .or(`content.ilike.%${lastUserMsg.split(" ").slice(0, 3).join("%")}%,location_name.ilike.%${lastUserMsg.split(" ")[0]}%`)
      .limit(8);

    const { data: categoryDocs } = await supabase
      .from("safety_documents")
      .select("title, content, category")
      .in("category", agent.ragCategories)
      .limit(5);

    const { data: recentReports } = await supabase
      .from("safety_reports")
      .select("category, description, location_name, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    const ragContext = [...(docs || []), ...(categoryDocs || [])]
      .map(d => `[${d.category}] ${d.title}: ${d.content}`).join("\n");

    const reportsContext = (recentReports || [])
      .map(r => `[${r.severity}] ${r.category} at ${r.location_name}: ${r.description}`).join("\n");

    const fullSystemPrompt = `${agent.systemPrompt}

LOCAL SAFETY DATA:
${ragContext || "No specific data available."}

RECENT COMMUNITY REPORTS:
${reportsContext || "No recent reports."}

IMPORTANT: Start your response with exactly "[${agent.name}]" on the first line so the user knows which specialist is helping them.`;

    // Step 4: Call AI with agent-specific prompt (streaming)
    const contextHash = simpleHash(ragContext + reportsContext);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
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

    // Step 5: Transform the stream to inject agent metadata in the first chunk, and collect response for caching
    const reader = response.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let firstChunk = true;

    const transformedStream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          // Cache the full response for CAG
          if (fullResponse.length > 20) {
            try {
              await supabase.from("ai_cache").upsert({
                query_hash: queryHash,
                context_hash: contextHash,
                response: { content: fullResponse },
                agent_type: agentType,
                ttl_seconds: 3600,
                hit_count: 0,
              }, { onConflict: "query_hash,context_hash" });
            } catch (e) { console.error("Cache write error:", e); }
          }
          controller.close();
          return;
        }

        const text = decoder.decode(value, { stream: true });
        
        // Collect full response text from SSE data
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullResponse += content;
          } catch {}
        }

        if (firstChunk) {
          // Inject agent metadata as the first SSE event
          const meta = JSON.stringify({ agent_type: agentType, agent_name: agent.name, agent_emoji: agent.emoji });
          controller.enqueue(encoder.encode(`data: {"agent_meta":${meta}}\n\n`));
          firstChunk = false;
        }

        controller.enqueue(value);
      },
    });

    return new Response(transformedStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (e) {
    console.error("multi-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
