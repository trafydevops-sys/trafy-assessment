import { supabase, isSupabaseConfigured } from "./supabase";

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  track: string;
  date: string;
  email?: string;
}

export const TRACK_NAMES: Record<string, string> = {
  "core-cs": "Core Computer Science",
  "cpp": "C++ Programming",
  "java": "Java Programming",
  "python": "Python Programming",
  "webdev": "Web Development",
  "aiml": "AI & Machine Learning"
};

const SEED_LEADERBOARD: LeaderboardEntry[] = [];
const LOCAL_KEY = "trafy_leaderboard_entries";

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const customEntries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    
    // Combine custom user submissions with seed entries
    const combined = [...customEntries, ...SEED_LEADERBOARD];
    
    // Deduplicate by Candidate Name + Track (keep candidate's highest score per track)
    const uniqueMap = new Map<string, LeaderboardEntry>();
    for (const item of combined) {
      const key = `${(item.name || "").trim().toLowerCase()}_${item.track}`;
      const existing = uniqueMap.get(key);
      if (!existing || item.score > existing.score) {
        uniqueMap.set(key, item);
      }
    }
    
    // Sort descending by score
    return Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);
  } catch (e) {
    console.error("Error reading local leaderboard", e);
    return SEED_LEADERBOARD;
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          id,
          percentage,
          assessment_id,
          completed_at,
          candidates ( name, email )
        `)
        .order("percentage", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        const rawEntries = data.map((row: any) => ({
          id: row.id,
          name: row.candidates?.name || "Anonymous",
          score: Math.round(Number(row.percentage) || 0),
          track: TRACK_NAMES[row.assessment_id] || row.assessment_id,
          date: row.completed_at ? new Date(row.completed_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          email: row.candidates?.email
        }));

        // Deduplicate by Name + Track
        const uniqueMap = new Map<string, LeaderboardEntry>();
        for (const item of rawEntries) {
          const key = `${(item.name || "").trim().toLowerCase()}_${item.track}`;
          const existing = uniqueMap.get(key);
          if (!existing || item.score > existing.score) {
            uniqueMap.set(key, item);
          }
        }

        return Array.from(uniqueMap.values()).sort((a, b) => b.score - a.score);
      }
    } catch (e) {
      console.warn("Supabase fetch failed, falling back to local store", e);
    }
  }

  return getLocalLeaderboard();
}

export async function recordAssessmentResult(params: {
  candidate: { name: string; email: string; phone?: string; organization?: string };
  assessmentId: string;
  score: number;
  total: number;
  percentage: number;
  results?: { id?: string; prompt?: string; topic?: string; kind?: string; isCorrect?: boolean }[];
}): Promise<void> {
  const { candidate, assessmentId, score, total, percentage, results } = params;
  const trackName = TRACK_NAMES[assessmentId] || assessmentId;
  const dateStr = new Date().toISOString().split("T")[0];

  const newEntry: LeaderboardEntry = {
    id: `local-${Date.now()}`,
    name: candidate.name || "Candidate",
    score: percentage,
    track: trackName,
    date: dateStr,
    email: candidate.email
  };

  // 1. Save to localStorage with deduplication (keep highest score per candidate per track)
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const existing: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    
    const combined = [newEntry, ...existing];
    const uniqueMap = new Map<string, LeaderboardEntry>();
    for (const item of combined) {
      const key = `${(item.name || "").trim().toLowerCase()}_${item.track}`;
      const prev = uniqueMap.get(key);
      if (!prev || item.score >= prev.score) {
        uniqueMap.set(key, item);
      }
    }

    const deduplicated = Array.from(uniqueMap.values());
    localStorage.setItem(LOCAL_KEY, JSON.stringify(deduplicated));
    window.dispatchEvent(new Event("trafy_leaderboard_updated"));
  } catch (e) {
    console.error("Failed to save local result", e);
  }

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: candidateData, error: candErr } = await supabase
        .from("candidates")
        .insert({
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone || null,
          organization: candidate.organization || null
        })
        .select()
        .single();

      if (!candErr && candidateData) {
        await supabase.from("sessions").insert({
          candidate_id: candidateData.id,
          assessment_id: assessmentId,
          score: score,
          max_score: total,
          percentage: percentage,
          completed_at: new Date().toISOString()
        });

        const { data: emailData, error: emailErr } = await supabase.functions.invoke("send-score", {
          body: {
            name: candidate.name || "Candidate",
            email: candidate.email,
            score,
            total,
            percentage,
            assessmentTitle: trackName,
            results
          }
        });

        if (emailErr) {
          console.warn("PDF report email failed to send:", emailErr);
        } else if (emailData?.error) {
          console.warn("Resend rejected the report email:", emailData.error?.message || emailData.error);
        } else {
          console.log("✓ PDF score report emailed via Resend!");
        }
      }
    } catch (err) {
      console.warn("Supabase record failed:", err);
    }
  }
}
