import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Binary, Coffee, Globe, Brain, Cpu, Clock, ListChecks } from "lucide-react";
import SectionTag from "../components/SectionTag";
import AssessmentMockup from "../components/AssessmentMockup";

const ASSESSMENTS = [
  {
    id: "core-cs",
    title: "Core Computer Science",
    description: "OS, DBMS, Computer Networks, DSA, and OOP concepts.",
    icon: Cpu,
    color: "bg-blue",
    questions: 21,
    time: 30,
    difficulty: 2
  },
  {
    id: "cpp",
    title: "C++ Programming",
    description: "STL, memory management, pointers, templates, and OOP.",
    icon: Binary,
    color: "bg-green-hard",
    questions: 21,
    time: 30,
    difficulty: 3
  },
  {
    id: "java",
    title: "Java Programming",
    description: "Collections, multithreading, JVM architecture, and OOP.",
    icon: Coffee,
    color: "bg-yellow",
    questions: 21,
    time: 30,
    difficulty: 2
  },
  {
    id: "python",
    title: "Python Programming",
    description: "Data structures, decorators, generators, and algorithms.",
    icon: Terminal,
    color: "bg-rose",
    questions: 21,
    time: 30,
    difficulty: 2
  },
  {
    id: "webdev",
    title: "Web Development",
    description: "HTML/CSS/JS, DOM manipulation, APIs, and React basics.",
    icon: Globe,
    color: "bg-[#0ea5e9]", // light blue
    questions: 21,
    time: 30,
    difficulty: 2
  },
  {
    id: "aiml",
    title: "AI & Machine Learning",
    description: "Neural networks, sklearn, NLP, CV basics, and mathematics.",
    icon: Brain,
    color: "bg-[#8b5cf6]", // purple
    questions: 21,
    time: 30,
    difficulty: 3
  }
];

export default function Home() {
  return (
    <div className="pb-24">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <SectionTag>Technical Skills Validation</SectionTag>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
              >
                Prove Your Skills.{" "}
                <span className="relative inline-block rounded-lg bg-green-hard px-2 py-0.5 text-white">
                  Get Hired.
                </span>
                <span className="caret h-[0.85em] translate-y-1" />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="mt-6 max-w-lg text-lg leading-relaxed text-white/65"
              >
                Take our comprehensive technical assessments to validate your knowledge. 
                Scores are shared with top global companies to help you land your next role.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative h-[340px] overflow-hidden rounded-3xl border border-white/10 bg-space sm:h-[420px] lg:h-[460px]"
            >
              <div className="pointer-events-none absolute inset-0 bg-stars" />
              <AssessmentMockup />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-24" id="assessments">
        <div className="mb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">Available Assessments</h2>
          <p className="mt-2 text-white/60">Choose a track to test your skills. Each assessment consists of 20 MCQs and 1 coding challenge.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ASSESSMENTS.map((assessment, i) => (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:bg-white/[0.07]"
            >
              <div className="p-6 flex-1">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${assessment.color} bg-opacity-20 text-white`}>
                  <assessment.icon size={24} className="text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-white">{assessment.title}</h3>
                <p className="mt-2 text-sm text-white/60">{assessment.description}</p>
                
                <div className="mt-6 flex items-center gap-4 text-xs font-medium text-white/40">
                  <div className="flex items-center gap-1.5">
                    <ListChecks size={14} />
                    {assessment.questions} Questions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {assessment.time} mins
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(level => (
                      <div 
                        key={level} 
                        className={`h-1.5 w-1.5 rounded-full ${level <= assessment.difficulty ? 'bg-white/70' : 'bg-white/20'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 p-4">
                <Link 
                  to={`/register/${assessment.id}`}
                  className="flex w-full items-center justify-center rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  Start Assessment →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
