import { motion } from "framer-motion";
import { Check } from "lucide-react";

const codeLines = [
  { text: "def assess(candidate):", color: "text-white/70" },
  { text: "  score = run_tasks(candidate)", color: "text-white/50" },
  { text: "  review_portfolio(candidate)", color: "text-white/50" },
  { text: "  # LLM eng · system design", color: "text-white/30" },
  { text: "  return score  # 92/100", color: "text-green-hard" },
];

const tests = ["Coding Task", "System Design", "LLM Eval"];
const skills = ["Python", "LLMs", "System Design"];

export default function AssessmentMockup() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Window chrome */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-hard/70" />
        </div>
        <div className="flex-1 truncate rounded-full bg-white/5 px-3 py-1 text-center font-mono text-[9px] text-white/40 sm:text-[10px]">
          app.trafy.ai/assessment
        </div>
        <span className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-rose sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose" />
          Live
        </span>
      </div>

      {/* Body */}
      <div className="grid min-h-0 flex-1 grid-cols-[1.3fr_1fr]">
        {/* Code panel */}
        <div className="flex flex-col gap-3 border-r border-white/10 p-3 sm:gap-4 sm:p-5">
          <div className="flex flex-col gap-1.5 font-mono text-[9px] leading-relaxed sm:text-[11px]">
            {codeLines.map((line, i) => (
              <motion.div
                key={line.text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                className={line.color}
              >
                {line.text}
              </motion.div>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-2">
            {tests.map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.3 + i * 0.15 }}
                className="flex items-center gap-2"
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-hard/20 text-green-hard">
                  <Check size={9} strokeWidth={3} />
                </span>
                <span className="truncate text-[9px] text-white/50 sm:text-[11px]">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Score panel */}
        <div className="flex flex-col items-center justify-center gap-3 p-3 sm:gap-4 sm:p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose to-green-hard text-[11px] font-bold text-white sm:h-11 sm:w-11">
            AK
          </div>
          <div className="text-center">
            <p className="text-[10px] font-semibold text-white sm:text-xs">Aarav K.</p>
            <p className="text-[9px] text-white/40">AI Engineer</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="flex flex-col items-center gap-0.5 rounded-2xl bg-white/5 px-4 py-2.5"
          >
            <span className="font-display text-xl font-bold text-white sm:text-2xl">92</span>
            <span className="text-[8px] uppercase tracking-widest text-white/35 sm:text-[9px]">Score / 100</span>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-medium text-white/50 sm:text-[9px]"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
