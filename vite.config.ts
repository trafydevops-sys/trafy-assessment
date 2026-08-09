import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      react(),
      {
        name: 'resend-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/send-score-email', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', async () => {
              try {
                const { name, email, score, assessmentTitle } = JSON.parse(body || '{}');
                const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;

                if (!apiKey) {
                  console.warn('[Resend Dev Server] RESEND_API_KEY missing in .env');
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'RESEND_API_KEY is missing in .env' }));
                  return;
                }

                // Call Resend REST API server-side (Node environment)
                const resendResponse = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    from: 'Trafy Assessments <onboarding@resend.dev>',
                    to: [email || 'build.trafy@gmail.com'],
                    subject: `Trafy Assessment Report: ${assessmentTitle} - ${score}%`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0b28; color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <div style="display: inline-block; background: #4c56e8; color: #ffffff; width: 36px; height: 36px; line-height: 36px; border-radius: 8px; font-weight: bold; font-size: 20px;">T</div>
                          <h2 style="margin: 12px 0 0; color: #ffffff; font-size: 22px;">Trafy Assessment Report</h2>
                        </div>
                        
                        <div style="padding: 24px 0;">
                          <p style="font-size: 16px; color: rgba(255,255,255,0.9); margin-top: 0;">Hi <strong>${name || 'Candidate'}</strong>,</p>
                          <p style="font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.6;">
                            Your evaluation report for the <strong>${assessmentTitle}</strong> assessment is complete. Below is your official performance summary.
                          </p>

                          <!-- Score Card -->
                          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 28px; text-align: center; margin: 24px 0;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.5); font-weight: 600;">Overall Score</div>
                            <div style="font-size: 56px; font-weight: 800; color: #ff5ec4; margin: 8px 0; font-family: sans-serif;">${score}%</div>
                            <div style="display: inline-block; background: #4c56e8; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                              ${Number(score) >= 95 ? "Top 1%" : Number(score) >= 90 ? "Top 5%" : Number(score) >= 80 ? "Top 12%" : Number(score) >= 70 ? "Top 20%" : Number(score) >= 60 ? "Top 35%" : "Top 50%"} Percentile Candidate
                            </div>
                          </div>

                          <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                              <tr>
                                <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Assessment Track:</td>
                                <td style="padding: 8px 0; color: #ffffff; text-align: right; font-weight: 600;">${assessmentTitle}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Completion Status:</td>
                                <td style="padding: 8px 0; color: #4c56e8; text-align: right; font-weight: 600;">Verified & Evaluated</td>
                              </tr>
                            </table>
                          </div>

                          <p style="font-size: 13px; color: rgba(255,255,255,0.5); text-align: center; margin-top: 32px;">
                            This report has been logged to your Trafy Profile and indexed for matching with vetted global companies.
                          </p>
                        </div>

                        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; text-align: center; font-size: 12px; color: rgba(255,255,255,0.4);">
                          © ${new Date().getFullYear()} Trafy Inc. All rights reserved.
                        </div>
                      </div>
                    `,
                  }),
                });

                const data = await resendResponse.json();
                res.statusCode = resendResponse.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err: any) {
                console.error('[Resend Dev Server Error]:', err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
