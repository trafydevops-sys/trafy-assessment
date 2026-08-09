// Setup: supabase secrets set RESEND_API_KEY=your_key
// Deploy: supabase functions deploy send-score --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuestionResult {
  id?: string;
  prompt?: string;
  topic?: string;
  kind?: string;
  isCorrect?: boolean;
}

interface ReportPayload {
  name: string;
  email: string;
  score: number;
  total?: number;
  percentage: number;
  assessmentTitle: string;
  results?: QuestionResult[];
}

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 50;

async function buildReportPdf(payload: ReportPayload): Promise<Uint8Array> {
  const { name, email, score, total, percentage, assessmentTitle, results = [] } = payload;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const ink = rgb(0.05, 0.04, 0.16);
  const accent = rgb(0.298, 0.337, 0.910); // #4c56e8
  const rose = rgb(1, 0.369, 0.769); // #ff5ec4
  const gray = rgb(0.45, 0.45, 0.48);
  const green = rgb(0.13, 0.7, 0.4);
  const red = rgb(0.85, 0.25, 0.25);

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawText = (
    text: string,
    opts: { size?: number; f?: typeof font; color?: ReturnType<typeof rgb>; x?: number } = {}
  ) => {
    const { size = 11, f = font, color = ink, x = MARGIN } = opts;
    ensureSpace(size + 6);
    page.drawText(text, { x, y, size, font: f, color });
    y -= size + 6;
  };

  // Header
  page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 90, width: PAGE_WIDTH, height: 90, color: ink });
  page.drawText("Trafy Assessment Report", { x: MARGIN, y: PAGE_HEIGHT - 45, size: 22, font: bold, color: rgb(1, 1, 1) });
  page.drawText(assessmentTitle, { x: MARGIN, y: PAGE_HEIGHT - 68, size: 12, font, color: rgb(0.8, 0.8, 0.9) });
  y = PAGE_HEIGHT - 120;

  drawText(`Candidate: ${name}`, { size: 12, f: bold });
  drawText(`Email: ${email}`, { size: 11, color: gray });
  drawText(`Date: ${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}`, {
    size: 11,
    color: gray,
  });
  y -= 6;

  // Score summary box
  ensureSpace(90);
  const boxTop = y;
  page.drawRectangle({
    x: MARGIN,
    y: boxTop - 80,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 80,
    color: rgb(0.96, 0.96, 0.98),
    borderColor: accent,
    borderWidth: 1,
  });
  page.drawText("SCORE", { x: MARGIN + 20, y: boxTop - 25, size: 10, font: bold, color: gray });
  page.drawText(`${percentage}%`, { x: MARGIN + 20, y: boxTop - 60, size: 30, font: bold, color: rose });
  if (typeof total === "number") {
    page.drawText(`${score} / ${total} points`, { x: MARGIN + 160, y: boxTop - 45, size: 13, font, color: ink });
  }
  y = boxTop - 100;

  // Topic-wise breakdown
  if (results.length > 0) {
    const topicMap = new Map<string, { correct: number; total: number }>();
    for (const r of results) {
      const topic = r.topic || "General";
      const entry = topicMap.get(topic) || { correct: 0, total: 0 };
      entry.total += 1;
      if (r.isCorrect) entry.correct += 1;
      topicMap.set(topic, entry);
    }

    drawText("Topic-wise Performance", { size: 14, f: bold });
    y -= 2;
    for (const [topic, stat] of topicMap) {
      const pct = Math.round((stat.correct / stat.total) * 100);
      ensureSpace(16);
      drawText(`${topic}: ${stat.correct}/${stat.total} correct (${pct}%)`, { size: 11 });
    }
    y -= 10;

    // Question breakdown
    ensureSpace(20);
    drawText("Question-by-Question Breakdown", { size: 14, f: bold });
    y -= 2;

    results.forEach((r, i) => {
      ensureSpace(30);
      const status = r.isCorrect ? "PASS" : "FAIL";
      const color = r.isCorrect ? green : red;
      page.drawText(`${i + 1}.`, { x: MARGIN, y, size: 10, font: bold, color: ink });
      page.drawText(status, { x: MARGIN + 20, y, size: 10, font: bold, color });
      const promptText = (r.prompt || "").slice(0, 95);
      page.drawText(promptText, { x: MARGIN + 70, y, size: 10, font, color: ink });
      y -= 18;
    });
  }

  // Footer
  ensureSpace(40);
  y -= 10;
  page.drawText("Generated automatically by Trafy Assessments. Keep building!", {
    x: MARGIN,
    y,
    size: 9,
    font,
    color: gray,
  });

  return await doc.save();
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: ReportPayload = await req.json();
    const { name, email, score, percentage, assessmentTitle } = payload;

    const pdfBytes = await buildReportPdf(payload);
    const pdfBase64 = uint8ToBase64(pdfBytes);

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
              <div style="background: #4c56e8; color: white; display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${Number(score) >= 95 ? "Top 1%" : Number(score) >= 90 ? "Top 5%" : Number(score) >= 80 ? "Top 12%" : Number(score) >= 70 ? "Top 20%" : Number(score) >= 60 ? "Top 35%" : "Top 50%"} Percentile Candidate
              </div>
            </div>

            <p>Your full question-by-question analysis is attached as a PDF report.</p>
            <p>Your score has been recorded and will be shared with top global employers on the Trafy platform.</p>
            <p>Keep building,<br>The Trafy Team</p>
          </div>
        `,
        attachments: [
          {
            filename: `Trafy-${assessmentTitle.replace(/\s+/g, "-")}-Report.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: res.status,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
