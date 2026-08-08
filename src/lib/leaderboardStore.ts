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

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { id: "seed-1", name: "Aarav K.", score: 98, track: "Core Computer Science", date: "2026-08-07" },
  { id: "seed-2", name: "Priya S.", score: 95, track: "C++ Programming", date: "2026-08-06" },
  { id: "seed-3", name: "Rahul D.", score: 92, track: "Python Programming", date: "2026-08-08" },
  { id: "seed-4", name: "Neha M.", score: 88, track: "Web Development", date: "2026-08-05" },
  { id: "seed-5", name: "Rohan J.", score: 85, track: "AI & Machine Learning", date: "2026-08-08" },
];

const LOCAL_KEY = "trafy_leaderboard_entries";

export function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const customEntries: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    
    // Combine custom user submissions with seed entries
    const combined = [...customEntries, ...SEED_LEADERBOARD];
    
    // Deduplicate by ID
    const uniqueMap = new Map<string, LeaderboardEntry>();
    for (const item of combined) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
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
        return data.map((row: any) => ({
          id: row.id,
          name: row.candidates?.name || "Anonymous",
          score: Math.round(Number(row.percentage) || 0),
          track: TRACK_NAMES[row.assessment_id] || row.assessment_id,
          date: row.completed_at ? new Date(row.completed_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          email: row.candidates?.email
        }));
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
}): Promise<void> {
  const { candidate, assessmentId, score, total, percentage } = params;
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

  // 1. Save to localStorage immediately
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    const existing: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    // Replace if same email & track exists with higher/lower score, or push new
    const updated = [newEntry, ...existing];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("trafy_leaderboard_updated"));
  } catch (e) {
    console.error("Failed to save local result", e);
  }

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      // Insert candidate
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
        // Insert session
        await supabase.from("sessions").insert({
          candidate_id: candidateData.id,
          assessment_id: assessmentId,
          score: score,
          max_score: total,
          percentage: percentage,
          completed_at: new Date().toISOString()
        });

        // Trigger email edge function
        await supabase.functions.invoke("send-score", {
          body: {
            name: candidate.name,
            email: candidate.email,
            score: percentage,
            assessmentTitle: trackName
          }
        });
      }
    } catch (err) {
      console.warn("Supabase record failed:", err);
    }
  }
}
