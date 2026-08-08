// Setup: supabase secrets set RESEND_API_KEY=your_key
// Deploy: supabase functions deploy send-score --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, score, assessmentTitle } = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Trafy Assessments <assessments@trafy.ai>",
        to: [email],
        subject: `Your Score: ${assessmentTitle} - Trafy Assessments`,
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background: #0d0b28; color: #fff; padding: 40px; border-radius: 12px;">
            <h1 style="color: #4c56e8;">Assessment Complete</h1>
            <p>Hi ${name},</p>
            <p>You have successfully completed the <strong>${assessmentTitle}</strong> assessment.</p>
            
            <div style="background: #14123a; padding: 24px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <div style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Your Score</div>
              <div style="font-size: 48px; font-weight: bold; margin: 10px 0; color: #ff5ec4;">${score}%</div>
              <div style="background: #4c56e8; color: white; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Top 12% Percentile</div>
            </div>

            <p>Your score has been recorded and will be shared with top global employers on the Trafy platform.</p>
            <p>Keep building,<br>The Trafy Team</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
