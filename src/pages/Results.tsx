import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Award } from "lucide-react";
import coreCsData from "../data/questions/core-cs.json";
import cppData from "../data/questions/cpp.json";
import javaData from "../data/questions/java.json";
import pythonData from "../data/questions/python.json";
import webdevData from "../data/questions/webdev.json";
import aimlData from "../data/questions/aiml.json";
import { recordAssessmentResult } from "../lib/leaderboardStore";

const assessmentData = {
  "core-cs": coreCsData,
  "cpp": cppData,
  "java": javaData,
  "python": pythonData,
  "webdev": webdevData,
  "aiml": aimlData
};

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Results() {
  const { sessionId } = useParams();
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [candidate, setCandidate] = useState<any>(null);

  useEffect(() => {
    // Determine the assessmentId from URL or session (we used assessmentId as sessionId for simplicity)
    const assessmentId = sessionId || "core-cs";
    const data = assessmentData[assessmentId as keyof typeof assessmentData] || coreCsData;
    
    const savedAns = localStorage.getItem(`submit_${assessmentId}`);
    const savedUser = localStorage.getItem("trafy_candidate");
    
    if (savedUser) setCandidate(JSON.parse(savedUser));
    
    if (savedAns) {
      const answers = JSON.parse(savedAns);
      let calculatedScore = 0;
      let calculatedTotal = 0;
      const computedResults = [];

      for (const q of data) {
        let isCorrect = false;
        
        if (q.kind === "mcq") {
          calculatedTotal += 1; // 1 point per MCQ
          if (answers[q.id] === q.correctIndex) {
            isCorrect = true;
            calculatedScore += 1;
          }
        } else if (q.kind === "code") {
          calculatedTotal += 5; // 5 points for coding
          const codeAns = answers[q.id];
          if (codeAns && codeAns.passed) {
            isCorrect = true;
            calculatedScore += 5;
          }
        }
        
        computedResults.push({ ...q, isCorrect });
      }
      
      setScore(calculatedScore);
      setTotal(calculatedTotal);
      setResults(computedResults);
      const computedPct = Math.round((calculatedScore / calculatedTotal) * 100);
      setPercentage(computedPct);
      
      const recordKey = `recorded_${assessmentId}_${savedAns.length}`;
      if (!sessionStorage.getItem(recordKey)) {
        sessionStorage.setItem(recordKey, "true");
        const userObj = savedUser ? JSON.parse(savedUser) : { name: "Candidate", email: "candidate@example.com" };
        recordAssessmentResult({
          candidate: userObj,
          assessmentId,
          score: calculatedScore,
          total: calculatedTotal,
          percentage: computedPct
        });
      }
    }
  }, [sessionId]);

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8"
      >
        <div className="text-center mb-8">
          <Award size={48} className="mx-auto mb-4 text-green-hard" />
          <h2 className="font-display text-3xl font-bold text-white">Assessment Complete</h2>
          <p className="mt-2 text-white/60">
            Great job{candidate?.name ? `, ${candidate.name}` : ""}! We've evaluated your submission.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 justify-center py-8">
          {/* Animated Gauge */}
          <div className="relative flex flex-col items-center">
            <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
              <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <motion.circle
                cx="90"
                cy="90"
                r={RADIUS}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - percentage / 100) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff5ec4" />
                  <stop offset="100%" stopColor="#4c56e8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl font-bold text-white">{percentage}%</span>
              <span className="text-[11px] font-medium text-white/40">Score</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white/5 px-6 py-4 border border-white/10">
              <div className="text-sm text-white/60">Points Scored</div>
              <div className="text-2xl font-bold text-white">{score} / {total}</div>
            </div>
            <div className="rounded-2xl bg-white/5 px-6 py-4 border border-white/10">
              <div className="text-sm text-white/60">Percentile</div>
              <div className="text-2xl font-bold text-white">Top 12%</div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Question Breakdown</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((r, i) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                {r.isCorrect ? (
                  <CheckCircle2 size={18} className="text-green-hard shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-rose shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white/80">Question {i + 1}</div>
                  <div className="text-[11px] text-white/50 line-clamp-1">{r.prompt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/" className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5">
            Return to Dashboard
          </Link>
          <Link to="/leaderboard" className="rounded-xl bg-green-hard px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
            View Leaderboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
