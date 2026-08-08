import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Radio } from "lucide-react";
import { fetchLeaderboard, type LeaderboardEntry } from "../lib/leaderboardStore";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const entries = await fetchLeaderboard();
    setData(entries);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Listen for local submission updates
    const handleUpdate = () => loadData();
    window.addEventListener("trafy_leaderboard_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // If Supabase is connected, subscribe to real-time database changes
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel("realtime-sessions")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "sessions" },
          () => {
            loadData();
          }
        )
        .subscribe();
    }

    return () => {
      window.removeEventListener("trafy_leaderboard_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-24">
      <div className="mb-12 text-center relative">
        <Trophy size={48} className="mx-auto mb-4 text-yellow" />
        <h2 className="font-display text-4xl font-bold tracking-tight text-white">Global Leaderboard</h2>
        <p className="mt-4 text-white/60">Real-time rankings across all Trafy Assessments</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-hard/30 bg-green-hard/10 px-3 py-1 text-xs font-semibold text-green-hard">
          <Radio size={14} className="animate-pulse text-green-hard" />
          Live Real-Time Updates Active
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 gap-4 border-b border-white/10 bg-black/20 px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white/40">
          <div className="col-span-2">Rank</div>
          <div className="col-span-4">Candidate</div>
          <div className="col-span-3">Track</div>
          <div className="col-span-3 text-right">Score</div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-white/40">Loading live rankings...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/40">No assessment scores recorded yet. Be the first!</div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence>
              {data.map((entry, i) => {
                const rank = i + 1;
                return (
                  <motion.div
                    key={entry.id || i}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`grid grid-cols-12 items-center gap-4 px-6 py-4 transition-colors hover:bg-white/5 ${
                      i !== data.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-2 font-display text-lg font-bold">
                      {rank === 1 && <Trophy size={18} className="text-yellow shrink-0" />}
                      {rank === 2 && <Medal size={18} className="text-white/80 shrink-0" />}
                      {rank === 3 && <Medal size={18} className="text-[#b45309] shrink-0" />}
                      <span className={rank <= 3 ? "text-white" : "text-white/40"}>#{rank}</span>
                    </div>
                    <div className="col-span-4 font-semibold text-white truncate">
                      {entry.name}
                    </div>
                    <div className="col-span-3 text-sm text-white/60 truncate">
                      {entry.track}
                    </div>
                    <div className="col-span-3 flex items-center justify-end gap-1.5 font-display text-xl font-bold text-green-hard">
                      {entry.score}%
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
