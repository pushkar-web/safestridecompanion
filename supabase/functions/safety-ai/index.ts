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

    const { query, route_from, route_to, time_of_day, context_type } = await req.json();

    // Fetch relevant safety documents from DB (text search since we don't have embeddings yet)
    let safetyDocs: any[] = [];
    
    const searchTerms = [query, route_from, route_to].filter(Boolean).join(" ");
    
    // Search by category and location
    const { data: docs } = await supabase
      .from("safety_documents")
      .select("*")
      .or(`content.ilike.%${route_from || query}%,content.ilike.%${route_to || query}%,location_name.ilike.%${route_from || ""}%,location_name.ilike.%${route_to || ""}%,category.eq.${context_type || "safe_route"}`)
      .limit(10);

    safetyDocs = docs || [];

    // Also fetch IPC laws and emergency info
    const { data: lawDocs } = await supabase
      .from("safety_documents")
      .select("*")
      .in("category", ["ipc_law", "emergency", "helpline"])
      .limit(5);

    safetyDocs = [...safetyDocs, ...(lawDocs || [])];

    // Build RAG context
    const ragContext = safetyDocs.map(d => `[${d.category}] ${d.title}: ${d.content}`).join("\n\n");

    const systemPrompt = `You are SafeStride AI, a women's safety assistant for Mumbai, India. You analyze routes and provide safety assessments.

You have access to local safety data:
${ragContext}

Based on this data, provide:
1. A risk score (0-100, where 0 is safest)
2. Specific safety insights for the route
3. Nearby resources (police stations, shelters, helplines)
4. Relevant legal information (IPC sections)
5. Actionable safety tips

Always be empowering, practical, and specific to Mumbai. Reference actual locations, police stations, and laws from the data provided.`;

    let userMessage = "";
    if (context_type === "risk_assessment") {
      userMessage = `Assess the safety of traveling from ${route_from} to ${route_to} at ${time_of_day || "evening"}. Provide a JSON response with: risk_score (number 0-100), risk_label (string), insights (array of {text, type: "warning"|"safe"|"info"}), nearby_resources (array of {name, type, phone?}), legal_info (array of {section, description}), tips (array of strings).`;
    } else if (context_type === "badge_generation") {
      userMessage = `Generate a creative safety badge for a traveler who just completed a trip from ${route_from} to ${route_to}, averting ${query} risks. Respond with JSON: badge_title (creative 2-3 word title), badge_description (one sentence description), achievement_message (encouraging message), safety_tip (one relevant tip for future trips), know_your_rights ({section, description} about a relevant IPC law).`;
    } else {
      userMessage = query || "Provide general safety tips for traveling in Mumbai tonight.";
    }

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        tools: context_type === "badge_generation" ? [
          {
            type: "function",
            function: {
              name: "generate_badge",
              description: "Generate a safety achievement badge after trip completion",
              parameters: {
                type: "object",
                properties: {
                  badge_title: { type: "string", description: "Creative 2-3 word badge title" },
                  badge_description: { type: "string", description: "One sentence badge description" },
                  achievement_message: { type: "string", description: "Encouraging completion message" },
                  safety_tip: { type: "string", description: "One safety tip for future" },
                  know_your_rights: {
                    type: "object",
                    properties: {
                      section: { type: "string" },
                      description: { type: "string" }
                    },
                    required: ["section", "description"]
                  }
                },
                required: ["badge_title", "badge_description", "achievement_message", "safety_tip", "know_your_rights"]
              }
            }
          }
        ] : context_type === "risk_assessment" ? [
          {
            type: "function",
            function: {
              name: "assess_risk",
              description: "Provide structured route risk assessment",
              parameters: {
                type: "object",
                properties: {
                  risk_score: { type: "number", description: "0-100 risk score" },
                  risk_label: { type: "string", enum: ["Low", "Moderate", "High", "Critical"] },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        type: { type: "string", enum: ["warning", "safe", "info"] }
                      },
                      required: ["text", "type"]
                    }
                  },
                  nearby_resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                        phone: { type: "string" }
                      },
                      required: ["name", "type"]
                    }
                  },
                  tips: { type: "array", items: { type: "string" } }
                },
                required: ["risk_score", "risk_label", "insights", "tips"]
              }
            }
          }
        ] : undefined,
        tool_choice: context_type === "badge_generation" 
          ? { type: "function", function: { name: "generate_badge" } }
          : context_type === "risk_assessment"
          ? { type: "function", function: { name: "assess_risk" } }
          : undefined,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    let result: any;
    
    // Extract from tool call response
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      result = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      try {
        result = JSON.parse(content);
      } catch {
        result = { message: content };
      }
    }

    // Include RAG sources
    result.rag_sources = safetyDocs.map(d => ({ title: d.title, category: d.category }));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("safety-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
