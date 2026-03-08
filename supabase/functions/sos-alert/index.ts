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

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { session_id, location, lat, lng, contacts } = await req.json();
    // contacts is now an array of { name, phone, email } objects
    const contactList: Array<{ name: string; phone: string; email: string }> = contacts || [];

    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const timestamp = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" });

    // Generate SOS message using AI
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
            content: "You are an emergency SOS system. Generate a concise, urgent emergency alert message."
          },
          {
            role: "user",
            content: `Generate an SOS alert: User is at ${location} (${lat}, ${lng}). Maps: ${mapsLink}. Time: ${timestamp}. Return JSON: { subject, body, sms_text }`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "send_sos",
            description: "Format SOS alert",
            parameters: {
              type: "object",
              properties: {
                subject: { type: "string" },
                body: { type: "string" },
                sms_text: { type: "string", description: "Under 160 chars" }
              },
              required: ["subject", "body", "sms_text"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "send_sos" } }
      }),
    });

    let sosMessage: { subject: string; body: string; sms_text: string };

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall) {
        sosMessage = JSON.parse(toolCall.function.arguments);
      } else {
        sosMessage = {
          subject: "🚨 EMERGENCY SOS - SafeStride Alert",
          body: `Emergency alert triggered at ${location}.\nGPS: ${lat}, ${lng}\nMaps: ${mapsLink}\nTime: ${timestamp}\nPlease call immediately or contact police at 100.`,
          sms_text: `SOS! Emergency at ${location}. Maps: ${mapsLink}. Call 100.`
        };
      }
    } else {
      sosMessage = {
        subject: "🚨 EMERGENCY SOS - SafeStride Alert",
        body: `Emergency alert triggered at ${location}.\nGPS: ${lat}, ${lng}\nMaps: ${mapsLink}\nTime: ${timestamp}\nPlease call immediately or contact police at 100.`,
        sms_text: `SOS! Emergency at ${location}. Maps: ${mapsLink}. Call 100.`
      };
    }

    const results = { emails_sent: [] as string[], sms_sent: [] as string[], errors: [] as string[] };

    // --- SEND EMAILS via Resend ---
    const emailRecipients = contactList.filter(c => c.email).map(c => c.email);
    if (emailRecipients.length > 0) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "SafeStride SOS <onboarding@resend.dev>",
            to: emailRecipients,
            subject: sosMessage.subject,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <div style="background:#dc2626;color:white;padding:16px;border-radius:8px 8px 0 0;text-align:center;">
                  <h1 style="margin:0;font-size:24px;">🚨 EMERGENCY SOS ALERT</h1>
                </div>
                <div style="background:#fff;border:1px solid #e5e7eb;padding:20px;border-radius:0 0 8px 8px;">
                  <p style="font-size:16px;color:#111;margin-bottom:16px;">${sosMessage.body.replace(/\n/g, '<br>')}</p>
                  <a href="${mapsLink}" style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">📍 View Live Location</a>
                  <hr style="margin:20px 0;border:none;border-top:1px solid #e5e7eb;">
                  <p style="font-size:14px;color:#666;">Emergency Numbers:<br>Police: 100 | Women Helpline: 181 | Mumbai Women: 103 | Ambulance: 108</p>
                </div>
              </div>
            `,
          }),
        });
        const emailData = await emailRes.json();
        if (emailRes.ok) {
          results.emails_sent = emailRecipients;
          console.log("Emails sent successfully:", emailData);
        } else {
          results.errors.push(`Email error: ${JSON.stringify(emailData)}`);
          console.error("Resend error:", emailData);
        }
      } catch (e) {
        results.errors.push(`Email exception: ${e instanceof Error ? e.message : String(e)}`);
        console.error("Email send error:", e);
      }
    }

    // --- SEND SMS via Twilio ---
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const phoneRecipients = contactList.filter(c => c.phone).map(c => c.phone);
      for (const phone of phoneRecipients) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
          const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
          
          const smsBody = new URLSearchParams({
            To: phone,
            From: TWILIO_PHONE_NUMBER,
            Body: sosMessage.sms_text + ` ${mapsLink}`,
          });

          const smsRes = await fetch(twilioUrl, {
            method: "POST",
            headers: {
              Authorization: `Basic ${authHeader}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: smsBody.toString(),
          });
          const smsData = await smsRes.json();
          if (smsRes.ok || smsRes.status === 201) {
            results.sms_sent.push(phone);
            console.log("SMS sent to:", phone, smsData.sid);
          } else {
            results.errors.push(`SMS to ${phone}: ${JSON.stringify(smsData)}`);
            console.error("Twilio error for", phone, ":", smsData);
          }
        } catch (e) {
          results.errors.push(`SMS exception for ${phone}: ${e instanceof Error ? e.message : String(e)}`);
          console.error("SMS send error:", e);
        }
      }
    } else {
      results.errors.push("Twilio credentials not fully configured - SMS not sent");
    }

    // Log SOS event
    await supabase.from("trip_history").update({
      feedback: `SOS_TRIGGERED: emails=${results.emails_sent.join(",")}, sms=${results.sms_sent.join(",")}`
    }).eq("session_id", session_id);

    return new Response(JSON.stringify({
      success: true,
      sos_id: `sos_${Date.now()}`,
      message: sosMessage,
      results,
      timestamp: new Date().toISOString(),
      location: { lat, lng, name: location },
      google_maps_link: mapsLink,
      emergency_numbers: { police: "100", women_helpline: "181", mumbai_women: "103", ambulance: "108" }
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
