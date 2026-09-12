"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Headphones,
  BookOpen,
  PenLine,
  Clock,
  ArrowRight,
  CheckCircle2,
  Volume2,
  AlertCircle,
  FileText,
  MousePointer,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

const INSTRUCTIONS_DATA = {
  listening: {
    title: "IELTS Listening",
    duration: "Approx. 30–32 Minutes",
    parts: "4 Parts",
    questions: "40 Questions",
    badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    accentColor: "#3b82f6",
    icon: Headphones,
    overview: "You will hear four recorded recordings of native English speakers and then answer questions.",
    keyPoints: [
      {
        title: "Audio Plays Once Only",
        description: "The audio will be played ONCE only. You must answer the questions as you listen.",
      },
      {
        title: "4 Sections & 40 Questions",
        description: "There are 4 parts with 10 questions each. Each correct answer earns 1 mark.",
      },
      {
        title: "Reading & Review Time",
        description: "You will have time before each part to read the questions, and time at the end of each part to check your answers.",
      },
      {
        title: "2-Minute Final Checking Time",
        description: "At the end of Section 4, you will have exactly 2 minutes to review all your answers across the entire Listening test.",
      },
      {
        title: "Word & Number Limits",
        description: "Pay strict attention to the instructions for each question (e.g. 'NO MORE THAN TWO WORDS AND/OR A NUMBER'). Exceeding word limits will be marked incorrect.",
      },
      {
        title: "Volume & Navigation",
        description: "You can adjust your headphone volume and use the question navigation bar at the bottom of the screen at any time.",
      },
    ],
    tips: [
      "Keep your headphones on and make sure the sound level is comfortable.",
      "Check spelling carefully; both UK and US spellings are accepted.",
    ],
  },
  reading: {
    title: "IELTS Reading",
    duration: "60 Minutes",
    parts: "3 Passages",
    questions: "40 Questions",
    badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accentColor: "#10b981",
    icon: BookOpen,
    overview: "The Reading test consists of three academic passages with a variety of question types.",
    keyPoints: [
      {
        title: "Strict 60-Minute Time Limit",
        description: "You have 60 minutes to complete all 3 passages. You should aim to spend roughly 20 minutes on each passage.",
      },
      {
        title: "NO Extra Transfer Time",
        description: "Unlike paper IELTS, there is NO transfer time at the end. All answers must be entered directly onto the screen within the 60 minutes.",
      },
      {
        title: "3 Passages & 40 Questions",
        description: "Passage 1 contains 13 questions, Passage 2 contains 13 or 14 questions, and Passage 3 contains 13 or 14 questions (40 questions in total).",
      },
      {
        title: "Interactive Split Screen",
        description: "The reading passage is on the left; the questions are on the right. You can scroll each side independently or resize the panels.",
      },
      {
        title: "Highlighting & Notes Tools",
        description: "Select any text in the passage with your mouse to highlight it or attach a private note.",
      },
      {
        title: "Reviewing & Changing Answers",
        description: "You can move freely between passages and questions, and change any answer at any point before the timer runs out.",
      },
    ],
    tips: [
      "Manage your time carefully. Do not get stuck on a difficult question — move forward and return to it later.",
      "For True / False / Not Given, remember that Not Given means the information is neither confirmed nor contradicted.",
    ],
  },
  writing: {
    title: "IELTS Writing",
    duration: "60 Minutes",
    parts: "2 Tasks",
    questions: "Task 1 & Task 2",
    badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    accentColor: "#a855f7",
    icon: PenLine,
    overview: "You must complete two separate writing tasks within the 60-minute time limit.",
    keyPoints: [
      {
        title: "Two Mandatory Tasks",
        description: "You must complete both Task 1 and Task 2. Both tasks are evaluated for Task Achievement/Response, Coherence & Cohesion, Lexical Resource, and Grammatical Accuracy.",
      },
      {
        title: "Task 1 (Recommended 20 Mins)",
        description: "Summarise, describe, or explain visual information (graphs, tables, charts, or diagrams). You must write AT LEAST 150 words.",
      },
      {
        title: "Task 2 (Recommended 40 Mins)",
        description: "Write a formal academic essay in response to a prompt, problem, or argument. You must write AT LEAST 250 words. Task 2 contributes TWICE as much to your score as Task 1.",
      },
      {
        title: "Automatic Word Counter",
        description: "An automated word counter is displayed below each text area. It updates in real time as you write.",
      },
      {
        title: "Editing & Shortcuts",
        description: "Standard text editing shortcuts (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z) can be used inside your response fields.",
      },
      {
        title: "Switch Between Tasks Freely",
        description: "You can navigate between Task 1 and Task 2 anytime using the tabs or bottom navigator.",
      },
    ],
    tips: [
      "Leave 2–3 minutes at the end of each task to proofread for spelling, punctuation, and grammatical slips.",
      "Keep Task 2 as your top priority since it carries 2/3 of your overall Writing band score.",
    ],
  },
};

export default function SectionInstructions({
  section,
  sectionLabel,
  candidateName,
  onContinue,
}) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onContinue();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onContinue]);

  const data = useMemo(
    () => INSTRUCTIONS_DATA[section] || INSTRUCTIONS_DATA.listening,
    [section]
  );
  const Icon = data.icon;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Progress for the circle: 60s -> 0s
  const strokeDashoffset = 283 - (283 * (60 - timeLeft)) / 60;

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 flex flex-col justify-between select-none antialiased">
      {/* ── Top Bar ────────────────────────────────────────────── */}
      <header className="border-b border-slate-800/80 bg-[#161b22]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white font-black text-sm tracking-wider shadow">
            IELTS
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-white">
              Official Computer-Delivered Test Instructions
            </h1>
            {candidateName && (
              <p className="text-xs text-slate-400">
                Candidate: <span className="text-slate-200 font-medium">{candidateName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Countdown Ring & Digital Time */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-full shadow-inner">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                className="text-slate-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={data.accentColor}
                fill="transparent"
              />
            </svg>
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Reading Time
            </div>
            <div className="font-mono text-base font-bold text-white leading-tight">
              {formattedCountdown}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center">
        {/* Section Header Card */}
        <div className="bg-[#161b22] border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-5">
            <div className="flex items-center gap-4">
              <div
                className="w-13 h-13 rounded-xl flex items-center justify-center p-3 shadow-md"
                style={{ backgroundColor: `${data.accentColor}20`, color: data.accentColor }}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {data.title}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${data.badgeColor}`}
                  >
                    Next Section
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{data.overview}</p>
              </div>
            </div>

            {/* Badges / Metrics */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Duration</span>
                <span className="text-white font-bold">{data.duration}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Structure</span>
                <span className="text-white font-bold">{data.parts}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-center">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total</span>
                <span className="text-white font-bold">{data.questions}</span>
              </div>
            </div>
          </div>

          {/* Instructions Grid */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Instructions to Candidates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
              {data.keyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 flex items-start gap-3 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-slate-300">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      {point.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Advice Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed space-y-1">
              {data.tips.map((tip, idx) => (
                <p key={idx} className="flex items-center gap-1.5">
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-400" />
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ── Bottom Action Bar ──────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#161b22]/95 backdrop-blur-md px-6 py-4 sticky bottom-0 z-30 flex items-center justify-between">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Section will start automatically when the timer reaches 00:00</span>
        </div>

        <button
          onClick={onContinue}
          className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          style={{
            backgroundColor: data.accentColor,
            boxShadow: `0 4px 20px ${data.accentColor}40`,
          }}
        >
          <span>Start {data.title} Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
