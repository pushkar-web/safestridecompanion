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

    const { session_id, location, lat, lng, contacts } = await req.json();

    // Use AI to generate the SOS alert message
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an emergency SOS system. Generate a concise, urgent emergency alert message for trusted contacts. Include the location and a call to action."
          },
          {
            role: "user",
            content: `Generate an SOS alert: User is at ${location} (${lat}, ${lng}). They triggered an emergency alert. Contacts: ${contacts?.join(", ")}. Return JSON: { subject, body, sms_text }`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "send_sos",
            description: "Format SOS alert for emergency contacts",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string", description: "Email subject line" },
                body: { type: "string", description: "Email body with location details and instructions" },
                sms_text: { type: "string", description: "Short SMS text under 160 chars" }
              },
              required: ["subject", "body", "sms_text"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "send_sos" } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let sosMessage: any;
    
    if (toolCall) {
      sosMessage = JSON.parse(toolCall.function.arguments);
    } else {
      sosMessage = {
        subject: "🚨 EMERGENCY SOS - SafeStride Alert",
        body: `Emergency alert triggered at ${location}. GPS: ${lat}, ${lng}. Please call immediately or contact local police at 100.`,
        sms_text: `SOS! Emergency at ${location}. Contact police: 100`
      };
    }

    // Log SOS event to database
    await supabase.from("trip_history").update({
      feedback: `SOS_TRIGGERED: ${JSON.stringify(sosMessage)}`
    }).eq("session_id", session_id);

    // Return the SOS details (in production, this would also send actual emails/SMS)
    return new Response(JSON.stringify({
      success: true,
      sos_id: `sos_${Date.now()}`,
      message: sosMessage,
      contacts_notified: contacts || [],
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: location },
      google_maps_link: `https://maps.google.com/?q=${lat},${lng}`,
      emergency_numbers: {
        police: "100",
        women_helpline: "181",
        mumbai_women: "103",
        ambulance: "108"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("SOS error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "SOS failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
