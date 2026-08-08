import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Play, Code2, Check, X } from "lucide-react";
import Editor from "@monaco-editor/react";
import coreCsData from "../data/questions/core-cs.json";
import cppData from "../data/questions/cpp.json";
import javaData from "../data/questions/java.json";
import pythonData from "../data/questions/python.json";
import webdevData from "../data/questions/webdev.json";
import aimlData from "../data/questions/aiml.json";

const assessmentData = {
  "core-cs": coreCsData,
  "cpp": cppData,
  "java": javaData,
  "python": pythonData,
  "webdev": webdevData,
  "aiml": aimlData
};

export default function Assessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  // Separate plain-string store for code editor values
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [codeOutput, setCodeOutput] = useState<any[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real app, fetch from Supabase
    const data = assessmentData[assessmentId as keyof typeof assessmentData] || coreCsData;
    setQuestions(data);
    
    // Initialize answers from local storage if exists
    const saved = localStorage.getItem(`draft_${assessmentId}`);
    if (saved) setAnswers(JSON.parse(saved));
  }, [assessmentId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (val: any) => {
    const updated = { ...answers, [questions[currentIdx].id]: val };
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  // Called when Monaco editor content changes — stores raw code string
  const handleCodeChange = (q: any, val: string | undefined) => {
    const code = val ?? "";
    setCodeMap(prev => ({ ...prev, [q.id]: code }));
    // Also mark question as answered
    const updated = { ...answers, [q.id]: { attempted: true } };
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  const runCode = () => {
    const q = questions[currentIdx];
    // Always read from codeMap (plain string), fall back to starter code
    const code: string = codeMap[q.id] ?? q.starterCode ?? "";
    setRunError(null);
    setCodeOutput([]);

    if (!code.trim()) {
      setRunError("Please write some code before running.");
      return;
    }

    const results: any[] = [];

    for (const test of q.testCases) {
      try {
        // Extract function name from code
        const match = code.match(/function\s+([a-zA-Z0-9_]+)/);
        if (!match) throw new Error("No function found in code. Make sure you define a function.");
        const fnName = match[1];

        // Build and run executor safely
        // eslint-disable-next-line no-new-func
        const executor = new Function(`
          "use strict";
          ${code}
          return ${fnName}(${test.input});
        `);
        const result = executor();
        const actual = JSON.stringify(result);
        const passed = actual === test.expectedOutput;
        results.push({ passed, input: test.input, expected: test.expectedOutput, actual });
      } catch (err: any) {
        results.push({ passed: false, input: test.input, expected: test.expectedOutput, actual: `Error: ${err.message}` });
      }
    }

    setCodeOutput(results);

    // Save coding answer with pass status
    const passedCount = results.filter(r => r.passed).length;
    const updated = { ...answers, [q.id]: { attempted: true, passedCount, total: results.length } };
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    // Save final answers and generate score
    localStorage.setItem(`submit_${assessmentId}`, JSON.stringify(answers));
    navigate(`/results/${assessmentId}`);
  };

  if (questions.length === 0) return <div>Loading...</div>;

  const currentQ = questions[currentIdx];
  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-white/10 bg-white/5 p-4 overflow-y-auto">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Questions</h3>
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  currentIdx === i
                    ? "border-2 border-green-hard bg-green-hard/20 text-white"
                    : isAnswered
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between border-b border-white/10 bg-white/5 px-6">
          <div className="text-sm font-medium text-white/60">
            Question {currentIdx + 1} of {questions.length}
          </div>
          <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${timeLeft < 300 ? "bg-rose/20 text-rose animate-pulse" : "bg-white/10 text-white"}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} className="rounded-lg bg-green-hard px-4 py-1.5 text-sm font-semibold text-white hover:brightness-110">
            Submit Assessment
          </button>
        </div>

        {/* Question Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-green-hard">
              {currentQ.topic}
            </span>
            <h2 className="font-display text-xl font-medium text-white leading-relaxed">
              {currentQ.prompt}
            </h2>

            {currentQ.kind === "mcq" && (
              <div className="mt-8 flex flex-col gap-3">
                {currentQ.options.map((opt: string, i: number) => {
                  const isSelected = answers[currentQ.id] === i;
                  return (
                    <label 
                      key={i} 
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                        isSelected ? "border-green-hard bg-green-hard/10" : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`q-${currentQ.id}`} 
                        className="hidden"
                        checked={isSelected}
                        onChange={() => handleAnswer(i)}
                      />
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-green-hard bg-green-hard" : "border-white/30"}`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm text-white/90">{opt}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {currentQ.kind === "code" && (
              <div className="mt-6 flex h-[500px] gap-4">
                <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-[#1e1e1e] flex flex-col">
                  <div className="flex h-10 items-center justify-between border-b border-white/10 px-4 bg-black/20">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Code2 size={14} /> main.js
                    </div>
                    <button onClick={runCode} className="flex items-center gap-1.5 rounded-lg bg-green-hard px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all">
                      <Play size={12} fill="currentColor" /> ▶ Run Code
                    </button>
                  </div>
                  <Editor
                    height="100%"
                    language={currentQ.language ?? "javascript"}
                    theme="vs-dark"
                    defaultValue={currentQ.starterCode}
                    value={codeMap[currentQ.id] ?? currentQ.starterCode}
                    onChange={(val) => handleCodeChange(currentQ, val)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                    }}
                  />
                </div>
                
                <div className="w-80 rounded-xl border border-white/10 bg-white/5 flex flex-col">
                  <div className="flex h-10 items-center border-b border-white/10 px-4 text-xs font-semibold text-white/60">
                    Test Cases
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                    {runError && (
                      <div className="rounded-lg border border-rose/30 bg-rose/10 p-3 text-xs text-rose font-mono">
                        ⚠ {runError}
                      </div>
                    )}
                    {codeOutput.length > 0 ? codeOutput.map((res, i) => (
                      <div key={i} className={`rounded-lg border p-3 ${res.passed ? 'border-green-hard/30 bg-green-hard/10' : 'border-rose/30 bg-rose/10'}`}>
                        <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                          {res.passed ? <Check size={14} className="text-green-hard" /> : <X size={14} className="text-rose" />}
                          <span className={res.passed ? 'text-green-hard' : 'text-rose'}>Test {i + 1}</span>
                        </div>
                        <div className="text-[10px] text-white/60 font-mono space-y-1">
                          <div>Input: {res.input}</div>
                          <div>Expected: {res.expected}</div>
                          <div>Actual: {res.actual}</div>
                        </div>
                      </div>
                    )) : currentQ.testCases.map((tc: any, i: number) => (
                      <div key={i} className="rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="text-xs font-medium text-white/80 mb-2">Test Case {i + 1}</div>
                        <div className="font-mono text-[10px] text-white/50 space-y-1">
                          <div>Input: {tc.input}</div>
                          <div>Expected: {tc.expectedOutput}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mx-auto max-w-4xl mt-8 flex justify-between">
            <button 
              onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
              disabled={currentIdx === 0}
              className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30"
            >
              Previous
            </button>
            <button 
              onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}
              disabled={currentIdx === questions.length - 1}
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-ink hover:bg-white/90 disabled:opacity-30"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
