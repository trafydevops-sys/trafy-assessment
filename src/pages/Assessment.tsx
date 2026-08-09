import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Play, Code2, Check, X, Flag, RotateCcw, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 mins
  const [codeOutput, setCodeOutput] = useState<any[]>([]);
  const [runError, setRunError] = useState<string | null>(null);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  
  useEffect(() => {
    const data = assessmentData[assessmentId as keyof typeof assessmentData] || coreCsData;
    setQuestions(data);
    
    // Restore draft answers & marked reviews
    const savedAns = localStorage.getItem(`draft_${assessmentId}`);
    if (savedAns) setAnswers(JSON.parse(savedAns));

    const savedRev = localStorage.getItem(`review_${assessmentId}`);
    if (savedRev) setMarkedForReview(JSON.parse(savedRev));
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

  const handleClearResponse = () => {
    const qId = questions[currentIdx].id;
    const updated = { ...answers };
    delete updated[qId];
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  const toggleMarkForReview = () => {
    const qId = questions[currentIdx].id;
    const updated = { ...markedForReview, [qId]: !markedForReview[qId] };
    setMarkedForReview(updated);
    localStorage.setItem(`review_${assessmentId}`, JSON.stringify(updated));
  };

  const handleCodeChange = (q: any, val: string | undefined) => {
    const code = val ?? "";
    setCodeMap(prev => ({ ...prev, [q.id]: code }));
    const updated = { ...answers, [q.id]: { attempted: true } };
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  const runCode = () => {
    const q = questions[currentIdx];
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
        const match = code.match(/function\s+([a-zA-Z0-9_]+)/);
        if (!match) throw new Error("No function found in code. Make sure you define a function.");
        const fnName = match[1];

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

    const passedCount = results.filter(r => r.passed).length;
    const updated = { ...answers, [q.id]: { attempted: true, passedCount, total: results.length } };
    setAnswers(updated);
    localStorage.setItem(`draft_${assessmentId}`, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    localStorage.setItem(`submit_${assessmentId}`, JSON.stringify(answers));
    navigate(`/results/${assessmentId}`);
  };

  if (questions.length === 0) return <div className="flex h-screen items-center justify-center text-white">Loading questions...</div>;

  const currentQ = questions[currentIdx];
  const isCurrentMarked = Boolean(markedForReview[currentQ.id]);
  const isCurrentAnswered = answers[currentQ.id] !== undefined;

  const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  const getQuestionStyle = (qId: string, idx: number) => {
    const isAns = answers[qId] !== undefined;
    const isRev = Boolean(markedForReview[qId]);
    const isCurrent = currentIdx === idx;

    let base = "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-xs sm:text-sm font-semibold transition-all relative ";

    if (isCurrent) {
      base += "ring-2 ring-white ring-offset-2 ring-offset-ink scale-105 z-10 ";
    }

    if (isAns && isRev) {
      return base + "bg-rose text-white";
    }
    if (isRev) {
      return base + "bg-yellow text-ink font-bold";
    }
    if (isAns) {
      return base + "bg-green-hard text-white";
    }
    return base + "bg-white/10 text-white/60 hover:bg-white/20";
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-73px)] overflow-hidden">
      
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/5 p-4 overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">Question Palette</h3>
          <span className="text-xs text-white/60 font-medium">{Object.keys(answers).length}/{questions.length} Answered</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={getQuestionStyle(q.id, i)}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 border-t border-white/10 pt-4 space-y-2 text-[11px]">
          <div className="flex items-center gap-2 text-white/70">
            <div className="h-3 w-3 rounded-md bg-green-hard shrink-0" /> Answered
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <div className="h-3 w-3 rounded-md bg-yellow shrink-0" /> Marked for Review
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <div className="h-3 w-3 rounded-md bg-rose shrink-0" /> Answered & Marked
          </div>
          <div className="flex items-center gap-2 text-white/40">
            <div className="h-3 w-3 rounded-md bg-white/10 shrink-0" /> Unanswered
          </div>
        </div>
      </div>

      {/* Mobile Question Palette Modal Overlay */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-xl p-6 md:hidden overflow-y-auto">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <h3 className="font-display text-lg font-bold text-white">Question Palette</h3>
            <button onClick={() => setShowMobilePalette(false)} className="rounded-lg p-2 text-white/70 hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIdx(i);
                  setShowMobilePalette(false);
                }}
                className={getQuestionStyle(q.id, i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white/70">
              <div className="h-3 w-3 rounded bg-green-hard shrink-0" /> Answered
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="h-3 w-3 rounded bg-yellow shrink-0" /> Marked for Review
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <div className="h-3 w-3 rounded bg-rose shrink-0" /> Answered & Marked
            </div>
            <div className="flex items-center gap-2 text-white/40">
              <div className="h-3 w-3 rounded bg-white/10 shrink-0" /> Unanswered
            </div>
          </div>

          <button
            onClick={() => setShowMobilePalette(false)}
            className="mt-8 w-full rounded-xl bg-green-hard py-3 text-sm font-semibold text-white"
          >
            Close Palette
          </button>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Responsive Top Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 gap-2">
          <div className="flex items-center gap-2">
            {/* Mobile palette trigger */}
            <button
              onClick={() => setShowMobilePalette(true)}
              className="flex md:hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
            >
              <LayoutGrid size={14} /> Palette ({currentIdx + 1}/{questions.length})
            </button>
            
            <div className="hidden md:block text-xs sm:text-sm font-medium text-white/60">
              Question {currentIdx + 1} of {questions.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold ${timeLeft < 300 ? "bg-rose/20 text-rose animate-pulse" : "bg-white/10 text-white"}`}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>

            <button
              onClick={handleSubmit}
              className="rounded-lg bg-green-hard px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white hover:brightness-110"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Scrollable Question Content Area */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-green-hard">
                {currentQ.topic}
              </span>
              {isCurrentMarked && (
                <span className="flex items-center gap-1 rounded-full bg-yellow/20 px-2.5 py-0.5 text-[11px] font-semibold text-yellow">
                  <Flag size={12} /> Marked for Review
                </span>
              )}
            </div>

            <h2 className="font-display text-lg sm:text-xl font-medium text-white leading-relaxed">
              {currentQ.prompt}
            </h2>

            {/* MCQ View */}
            {currentQ.kind === "mcq" && (
              <div className="mt-6 sm:mt-8 flex flex-col gap-3">
                {currentQ.options.map((opt: string, i: number) => {
                  const isSelected = answers[currentQ.id] === i;
                  return (
                    <label 
                      key={i} 
                      className={`flex cursor-pointer items-center gap-3 sm:gap-4 rounded-xl border p-3.5 sm:p-4 transition-all ${
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
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${isSelected ? "border-green-hard bg-green-hard" : "border-white/30"}`}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs sm:text-sm text-white/90 leading-normal">{opt}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {/* Coding Challenge View (Responsive Split) */}
            {currentQ.kind === "code" && (
              <div className="mt-6 flex flex-col lg:flex-row h-auto lg:h-[500px] gap-4">
                <div className="flex-1 rounded-xl border border-white/10 overflow-hidden bg-[#1e1e1e] flex flex-col h-[320px] sm:h-[400px] lg:h-full">
                  <div className="flex h-10 items-center justify-between border-b border-white/10 px-4 bg-black/20 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Code2 size={14} /> main.js
                    </div>
                    <button onClick={runCode} className="flex items-center gap-1.5 rounded-lg bg-green-hard px-3 py-1 text-xs font-semibold text-white hover:brightness-110 transition-all">
                      <Play size={12} fill="currentColor" /> ▶ Run Code
                    </button>
                  </div>
                  <div className="flex-1 relative">
                    <Editor
                      height="100%"
                      language={currentQ.language ?? "javascript"}
                      theme="vs-dark"
                      defaultValue={currentQ.starterCode}
                      value={codeMap[currentQ.id] ?? currentQ.starterCode}
                      onChange={(val) => handleCodeChange(currentQ, val)}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
                
                <div className="w-full lg:w-80 rounded-xl border border-white/10 bg-white/5 flex flex-col h-[200px] lg:h-full shrink-0">
                  <div className="flex h-10 items-center border-b border-white/10 px-4 text-xs font-semibold text-white/60 shrink-0">
                    Test Cases
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {runError && (
                      <div className="rounded-lg border border-rose/30 bg-rose/10 p-3 text-xs text-rose font-mono">
                        ⚠ {runError}
                      </div>
                    )}
                    {codeOutput.length > 0 ? codeOutput.map((res, i) => (
                      <div key={i} className={`rounded-lg border p-3 ${res.passed ? 'border-green-hard/30 bg-green-hard/10' : 'border-rose/30 bg-rose/10'}`}>
                        <div className="flex items-center gap-2 mb-1.5 font-mono text-xs">
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
                        <div className="text-xs font-medium text-white/80 mb-1.5">Test Case {i + 1}</div>
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
          
          {/* Action Toolbar (Previous, Clear, Mark for Review, Next) */}
          <div className="mx-auto max-w-4xl mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentIdx(p => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1 rounded-xl border border-white/10 px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentQ.kind === "mcq" && isCurrentAnswered && (
                <button
                  onClick={handleClearResponse}
                  className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5"
                  title="Clear selected option"
                >
                  <RotateCcw size={14} /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                  isCurrentMarked 
                    ? "border-yellow bg-yellow text-ink font-bold" 
                    : "border-white/10 text-white/80 hover:bg-white/5 hover:border-yellow/50"
                }`}
              >
                <Flag size={14} fill={isCurrentMarked ? "currentColor" : "none"} />
                {isCurrentMarked ? "Marked for Review" : "Mark for Review"}
              </button>

              <button 
                onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}
                disabled={currentIdx === questions.length - 1}
                className="flex items-center gap-1 rounded-xl bg-white px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold text-ink hover:bg-white/90 disabled:opacity-30"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
