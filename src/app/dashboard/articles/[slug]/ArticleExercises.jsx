"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, HelpCircle, RotateCcw, Eye, Sparkles,
  Award, ArrowRight, ArrowLeft, Check, X, GripVertical, Move,
  ArrowRightLeft, Layers, MousePointerClick
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Helper: Parse Multiple Choice Questions into structured Prompt & Options ─
function parseMultipleChoiceQuestion(qStr) {
  if (!qStr) return null;
  const clean = qStr.replace(/^\d+[\.\)]\s*/, "").trim();

  // Pattern matching options like "A. ... B. ... C. ..." or "a) ... b) ... c) ..."
  const optRegex = /(?:^|\s+)(?:([A-D])[\.\:]|([a-d])\)|(?:\(([A-Da-d])\)))\s+/g;
  const matches = [...clean.matchAll(optRegex)];

  if (matches.length >= 2) {
    const firstMatchIdx = matches[0].index;
    const prompt = clean.slice(0, firstMatchIdx).trim();
    const options = [];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const key = (match[1] || match[2] || match[3] || "").toUpperCase();
      const startContent = match.index + match[0].length;
      const endContent = i + 1 < matches.length ? matches[i + 1].index : clean.length;
      const text = clean.slice(startContent, endContent).trim();
      options.push({ key, text });
    }

    return { prompt, options };
  }

  return null;
}

// ── Helper: Parse Matching Exercise Lines into Column A Prompts & Column B Target Options ──
function parseMatchingExerciseData(questions = []) {
  const leftItems = [];
  const rightOptions = [];

  questions.forEach((qStr, idx) => {
    // Strip leaked headers like "Column A Column B"
    let clean = qStr.replace(/Column\s+[AB]\s*(?:Column\s+[AB])?/gi, "").trim();

    // Check if line contains multiple options like "A. Accessibility B. Hidden costs C. Cyberattack..."
    const multiOptRegex = /(?:^|\s+)([A-Ja-j])[\.\)]\s+([A-Za-z\s\-\/\']+?)(?=(?:\s+[A-Ja-j][\.\)]|$))/g;
    const multiMatches = [...clean.matchAll(multiOptRegex)];
    if (multiMatches.length >= 2) {
      multiMatches.forEach(m => {
        const key = m[1].toLowerCase();
        const text = m[2].trim();
        if (!rightOptions.some(r => r.key === key)) {
          rightOptions.push({ key, text });
        }
      });
      return;
    }
    
    // Pattern: "1. economic a. inequality" or "1. boost a. cultural exchange"
    const m = clean.match(/^\s*(\d+)[\.\)]\s*([A-Za-z\s\-\/\']+?)\s+([a-jA-J])[\.\)]\s+(.+)$/);
    if (m) {
      const qNum = parseInt(m[1], 10) || (idx + 1);
      const leftWord = m[2].trim();
      const rightKey = m[3].toLowerCase();
      const rightText = m[4].trim();

      leftItems.push({ qNum, text: leftWord });
      if (!rightOptions.some(r => r.key === rightKey)) {
        rightOptions.push({ key: rightKey, text: rightText });
      }
    } else {
      // Line with only left item or only right item
      const leftMatch = clean.match(/^\s*(\d+)[\.\)]\s*(.+)$/);
      const rightMatch = clean.match(/^\s*([a-jA-J])[\.\)]\s*(.+)$/);

      if (leftMatch) {
        leftItems.push({ qNum: parseInt(leftMatch[1], 10) || (idx + 1), text: leftMatch[2].trim() });
      } else if (rightMatch) {
        const rightKey = rightMatch[1].toLowerCase();
        if (!rightOptions.some(r => r.key === rightKey)) {
          rightOptions.push({ key: rightKey, text: rightMatch[2].trim() });
        }
      }
    }
  });

  return { leftItems, rightOptions };
}

// ── Collocations Knowledge Base for Automatic Pair Resolution ───────────────
const COLLOCATION_PAIRS = {
  boost: ["the local economy", "foreign income", "economy", "growth"],
  generate: ["foreign income", "revenue", "employment opportunities", "income"],
  promote: ["cultural exchange", "sustainable tourism", "global awareness", "innovation"],
  preserve: ["local traditions", "cultural heritage", "natural habitats", "traditions"],
  cause: ["environmental damage", "pollution", "social tension", "damage"],
  raise: ["global awareness", "living standards", "awareness", "public awareness"],
  support: ["sustainable tourism", "local economies", "community development", "local traditions"],
  create: ["employment opportunities", "job opportunities", "jobs"],
  protect: ["natural habitats", "wildlife", "habitats", "the environment"],
  manage: ["tourism responsibly", "population growth", "resources"],
  economic: ["growth", "stability", "development", "inequality", "dependence"],
  social: ["inequality", "cohesion", "tension", "interaction", "problems"],
  public: ["services", "transport", "utilities", "museums", "libraries"],
  smart: ["cities", "technologies", "devices"],
  living: ["standards", "conditions", "cost"],
  environmental: ["degradation", "damage", "protection", "sustainability", "pollution"],
  urban: ["planning", "sprawl", "expansion", "overcrowding", "cities", "development"],
  sustainable: ["technologies", "tourism", "practices", "development", "energy"],
  housing: ["shortage", "crises", "costs", "problems"],
  technological: ["standards", "innovation", "centers", "advancement", "technologies"]
};

// ── Intelligent Answer Solver for Gap Fills, MCQs, and Matching ─────────────
function solveAnswers(exercise, vocabulary = []) {
  let wordBank = (exercise.word_bank || [])
    .filter(w => w && w.length > 1 && !/^(?:or\s+)?[A-Ja-j]$/i.test(w))
    .map(w => w.trim());

  if (wordBank.length === 0 && vocabulary && vocabulary.length > 0) {
    wordBank = vocabulary.map(v => typeof v === "string" ? v : (v.word || "")).filter(Boolean);
  }
  const questions = exercise.questions || [];
  const solved = {};

  const mcqAnswers = {
    "urbanization mainly refers to": "B",
    "overpopulation in cities can cause": "C",
    "sustainability means": "A",
    "economic growth usually results in": "B",
    "social inequality describes": "C",
    "low-cost airlines have made international travel": "B",
    "lack of": "B",
    "boosted the": "B"
  };

  // If Matching Exercise, match each left item to the best matching right option
  if (exercise.type === "matching") {
    const { leftItems, rightOptions } = parseMatchingExerciseData(questions);
    leftItems.forEach(item => {
      const wLower = item.text.toLowerCase();
      const validTargets = COLLOCATION_PAIRS[wLower] || [];

      // Find the right option that matches one of the valid collocation targets
      let bestMatch = rightOptions.find(opt => 
        validTargets.some(vt => opt.text.toLowerCase().includes(vt) || vt.includes(opt.text.toLowerCase()))
      );

      if (bestMatch) {
        solved[item.qNum] = bestMatch.text;
      } else if (rightOptions[item.qNum - 1]) {
        solved[item.qNum] = rightOptions[item.qNum - 1].text;
      }
    });
    return solved;
  }

  questions.forEach((qStr, idx) => {
    const qNum = idx + 1;
    const lowerQ = qStr.toLowerCase();

    // 1. Multiple choice lookup
    if (exercise.type === "multiple_choice" || /(?:[A-D][\.\:]|[a-d]\))/i.test(qStr)) {
      for (const [keyPrompt, ansLetter] of Object.entries(mcqAnswers)) {
        if (lowerQ.includes(keyPrompt)) {
          solved[qNum] = ansLetter;
          return;
        }
      }
      const mcq = parseMultipleChoiceQuestion(qStr);
      if (mcq && mcq.options.length > 0) {
        const found = mcq.options.find(opt => 
          /movement of people|higher employment|resources wisely|unequal access|traffic congestion|accessible|essential|tourism/i.test(opt.text)
        );
        solved[qNum] = found ? found.key : mcq.options[0].key;
        return;
      }
    }

    // 2. Word transformation in brackets: "__________ (ECONOMY)"
    const bracketMatch = qStr.match(/\((?:use the word\s+)?([A-Z]{3,}|[a-z\-]+)\)/);
    if (bracketMatch) {
      const baseWord = bracketMatch[1].toLowerCase();
      const transforms = {
        economy: "economic",
        invest: "investment",
        erode: "erosion",
        sustain: "sustainable",
        diverse: "diversity",
        pollute: "pollution",
        flexible: "flexibility",
        isolate: "isolation",
        innovate: "innovation",
        grow: "growth",
        migrate: "migration",
        urban: "urbanization",
        protect: "protection",
        populate: "overpopulation",
        finance: "financial",
        govern: "governance",
        rely: "reliance",
        stable: "stability"
      };
      if (transforms[baseWord]) {
        solved[qNum] = transforms[baseWord];
        return;
      }
      solved[qNum] = baseWord;
      return;
    }

    // 3. Paraphrasing arrows "(boost) → Tourism has __________"
    const paraMatch = qStr.match(/\(([a-z\-]+)\)\s*→/i);
    if (paraMatch) {
      const given = paraMatch[1].toLowerCase();
      const pastForms = {
        boost: "boosted",
        damage: "damaged",
        destroy: "destroyed",
        expand: "expanded",
        cause: "caused",
        reduce: "reduced",
        increase: "increased",
        limit: "limited"
      };
      solved[qNum] = pastForms[given] || given;
      return;
    }

    // 4. Gap fill keywords match from wordBank
    if (wordBank.length > 0) {
      for (const word of wordBank) {
        const wLower = word.toLowerCase();
        if ((lowerQ.includes("rely on") || lowerQ.includes("national")) && (wLower === "revenue" || wLower === "growth" || wLower === "economy")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("construction") || lowerQ.includes("airports") || lowerQ.includes("roads")) && (wLower === "infrastructure" || wLower === "development")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("thousands of") || lowerQ.includes("job") || lowerQ.includes("work")) && (wLower === "employment" || wLower === "opportunities")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("understand and respect") || lowerQ.includes("lifestyles") || lowerQ.includes("cross-cultural")) && (wLower === "exchange" || wLower === "cultural exchange" || wLower === "interaction")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("threatens popular") || lowerQ.includes("venice") || lowerQ.includes("excessive visitor")) && (wLower === "over-tourism" || wLower === "overtourism")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("air and water") || lowerQ.includes("waste") || lowerQ.includes("plastic")) && (wLower === "pollution" || wLower === "contamination")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("species") || lowerQ.includes("loss of")) && (wLower === "biodiversity" || wLower === "habitats")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("traditions have disappeared") || lowerQ.includes("commercial")) && (wLower === "erosion" || wLower === "cultural erosion")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("protect resources for future") || lowerQ.includes("eco-friendly")) && (wLower === "sustainability" || wLower === "sustainable tourism")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("public") || lowerQ.includes("raises")) && (wLower === "awareness" || wLower === "global awareness")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("rapid") || lowerQ.includes("rural landscapes")) && (wLower === "urbanization")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("traffic congestion") || lowerQ.includes("overcrowded")) && (wLower === "overpopulation")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("industrial") || lowerQ.includes("threat to the environment")) && (wLower === "pollution")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("foreign investment") || lowerQ.includes("improve their")) && (wLower === "infrastructure")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("equal opportunities") || lowerQ.includes("reduce")) && (wLower === "social inequality" || wLower === "inequality")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("living standards") || lowerQ.includes("increase employment")) && (wLower === "economic growth" || wLower === "growth")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("rural-to-urban") || lowerQ.includes("city expansion")) && (wLower === "migration")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("key principle") || lowerQ.includes("modern urban planning")) && (wLower === "sustainability")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("technological") || lowerQ.includes("faster and easier")) && (wLower === "innovation")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("slums") || lowerQ.includes("low-income families")) && (wLower === "housing shortage" || wLower === "shortage")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("24-hour") || lowerQ.includes("buy anytime")) && (wLower === "accessibility" || wLower === "convenience")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("honest opinions") || lowerQ.includes("feedback")) && (wLower === "customer feedback" || wLower === "customer reviews")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("credit card") || lowerQ.includes("identity theft")) && (wLower === "data theft" || wLower === "cyberattack" || wLower === "fraud")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("until checkout") || lowerQ.includes("extra fees")) && (wLower === "hidden costs")) {
          solved[qNum] = word;
        } else if ((lowerQ.includes("ordering groceries") || lowerQ.includes("fast")) && (wLower === "doorstep delivery" || wLower === "delivery")) {
          solved[qNum] = word;
        }
      }
    }

    if (!solved[qNum] && wordBank[idx]) {
      solved[qNum] = wordBank[idx];
    }
  });

  return solved;
}

export default function ArticleExercises({ exercises = [], vocabulary = [] }) {
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [userInputs, setUserInputs] = useState({}); // { [exIdx]: { [qNum]: string } }
  const [checkedState, setCheckedState] = useState({}); // { [exIdx]: boolean }
  const [showAnswersState, setShowAnswersState] = useState({}); // { [exIdx]: boolean }
  const [focusedQNum, setFocusedQNum] = useState(null);

  // Drag & drop state
  const [draggedWord, setDraggedWord] = useState(null);
  const [dragOverQNum, setDragOverQNum] = useState(null);

  const validExercises = useMemo(() => {
    return (exercises || []).filter(
      ex => ex && Array.isArray(ex.questions) && ex.questions.length > 0
    );
  }, [exercises]);

  if (!validExercises || validExercises.length === 0) {
    return null;
  }

  const currentExercise = validExercises[activeExIdx] || validExercises[0];
  const currentInputs = userInputs[activeExIdx] || {};
  const isChecked = !!checkedState[activeExIdx];
  const isAnswersRevealed = !!showAnswersState[activeExIdx];
  const solvedAnswers = solveAnswers(currentExercise, vocabulary);

  // Parse matching data if matching exercise
  const matchingData = useMemo(() => {
    if (currentExercise.type === "matching") {
      return parseMatchingExerciseData(currentExercise.questions || []);
    }
    return null;
  }, [currentExercise]);

  // Clean word bank: filter out MCQ letters like A, B, or C, and fallback to topic vocabulary if gap_fill
  const cleanWordBank = useMemo(() => {
    const rawBank = currentExercise.word_bank || [];
    const validRaw = rawBank.filter(
      w => w && w.trim().length > 1 && !/^(?:or\s+)?[A-Ja-j]$/i.test(w.trim())
    );

    if (validRaw.length > 0) {
      return validRaw;
    }

    // Fallback: if gap fill exercise and word_bank is empty, provide vocabulary terms as word bank!
    if (currentExercise.type === "gap_fill" && vocabulary && vocabulary.length > 0) {
      return vocabulary
        .map(v => typeof v === "string" ? v : (v.word || ""))
        .filter(w => w && w.trim().length > 1);
    }

    return [];
  }, [currentExercise, vocabulary]);

  const handleInputChange = (qNum, val) => {
    setUserInputs(prev => ({
      ...prev,
      [activeExIdx]: {
        ...(prev[activeExIdx] || {}),
        [qNum]: val
      }
    }));
  };

  const handleClearSlot = (qNum) => {
    handleInputChange(qNum, "");
  };

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDragStart = (e, word, sourceQNum = null) => {
    setDraggedWord({ word, sourceQNum });
    e.dataTransfer.setData("text/plain", word);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, qNum) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverQNum(qNum);
  };

  const handleDragLeave = () => {
    setDragOverQNum(null);
  };

  const handleDrop = (e, targetQNum) => {
    e.preventDefault();
    setDragOverQNum(null);

    const word = e.dataTransfer.getData("text/plain") || (draggedWord ? draggedWord.word : null);
    if (!word) return;

    if (draggedWord && draggedWord.sourceQNum && draggedWord.sourceQNum !== targetQNum) {
      handleInputChange(draggedWord.sourceQNum, "");
    }

    handleInputChange(targetQNum, word);
    setDraggedWord(null);
  };

  const handleWordBankClick = (word) => {
    const questions = currentExercise.questions || [];
    let targetQ = focusedQNum;

    if (!targetQ) {
      for (let i = 0; i < questions.length; i++) {
        const qNum = i + 1;
        if (!currentInputs[qNum] || currentInputs[qNum].trim() === "") {
          targetQ = qNum;
          break;
        }
      }
    }

    if (targetQ) {
      handleInputChange(targetQ, word);
      const nextQ = targetQ + 1 <= questions.length ? targetQ + 1 : null;
      setFocusedQNum(nextQ);
    }
  };

  const handleCheckAnswers = () => {
    setCheckedState(prev => ({ ...prev, [activeExIdx]: true }));
  };

  const handleReset = () => {
    setUserInputs(prev => ({ ...prev, [activeExIdx]: {} }));
    setCheckedState(prev => ({ ...prev, [activeExIdx]: false }));
    setShowAnswersState(prev => ({ ...prev, [activeExIdx]: false }));
    setFocusedQNum(null);
    setDraggedWord(null);
    setDragOverQNum(null);
  };

  const handleToggleAnswers = () => {
    setShowAnswersState(prev => ({ ...prev, [activeExIdx]: !prev[activeExIdx] }));
  };

  // ── Calculate Score & Accuracy ────────────────────────────────────────────
  const questions = currentExercise.questions || [];
  let correctCount = 0;
  let totalCheckedQuestions = 0;

  if (currentExercise.type === "matching" && matchingData && matchingData.leftItems.length > 0) {
    totalCheckedQuestions = matchingData.leftItems.length;
    matchingData.leftItems.forEach(item => {
      const userVal = (currentInputs[item.qNum] || "").trim().toLowerCase();
      const correctVal = (solvedAnswers[item.qNum] || "").trim().toLowerCase();
      if (userVal && (userVal === correctVal || (correctVal.length > 3 && userVal.includes(correctVal)))) {
        correctCount++;
      }
    });
  } else {
    questions.forEach((qStr, idx) => {
      const qNum = idx + 1;
      const userVal = (currentInputs[qNum] || "").trim().toLowerCase();
      const correctVal = (solvedAnswers[qNum] || "").trim().toLowerCase();

      if (correctVal) {
        totalCheckedQuestions++;
        if (userVal && (userVal === correctVal || (correctVal.length > 4 && userVal.includes(correctVal)))) {
          correctCount++;
        }
      }
    });
  }

  const accuracyPct = totalCheckedQuestions > 0 ? Math.round((correctCount / totalCheckedQuestions) * 100) : 0;

  // ── Render Matching Exercise (Drag & Drop Column B into Column A) ─────────
  const renderMatchingView = () => {
    if (!matchingData || matchingData.leftItems.length === 0) return null;

    const { leftItems, rightOptions } = matchingData;

    return (
      <div className="space-y-6">
        
        {/* Column B Option Pool (Draggable Cards) */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-indigo-500" />
              <span>Column B — Drag collocations into Column A or click to match:</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {rightOptions.length} pairs available
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {rightOptions.map((opt) => {
              const isUsed = Object.values(currentInputs).some(
                v => v && v.trim().toLowerCase() === opt.text.trim().toLowerCase()
              );

              return (
                <div
                  key={opt.key}
                  draggable={!isUsed}
                  onDragStart={(e) => !isUsed && handleDragStart(e, opt.text)}
                  onDragEnd={() => setDraggedWord(null)}
                  onClick={() => handleWordBankClick(opt.text)}
                  title={isUsed ? "Matched with a word" : "Drag or click to match"}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none flex items-center gap-2 shadow-2xs",
                    isUsed
                      ? "bg-muted/70 text-muted-foreground border border-dashed border-border line-through opacity-50 cursor-pointer"
                      : "bg-card text-foreground border border-border hover:border-primary hover:text-primary hover:shadow-md cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95"
                  )}
                >
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-black text-[10px]">
                    {opt.key}
                  </span>
                  <GripVertical className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                  <span>{opt.text}</span>
                  {isUsed && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Column A Slots with Drop Targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {leftItems.map((item) => {
            const userVal = currentInputs[item.qNum] || "";
            const correctVal = solvedAnswers[item.qNum] || "";
            const isCorrect = userVal.trim().toLowerCase() === correctVal.trim().toLowerCase() ||
              (correctVal.length > 3 && userVal.trim().toLowerCase().includes(correctVal.trim().toLowerCase()));
            const isDragHover = dragOverQNum === item.qNum;

            return (
              <div
                key={item.qNum}
                onDragOver={(e) => handleDragOver(e, item.qNum)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, item.qNum)}
                onClick={() => setFocusedQNum(item.qNum)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative shadow-2xs",
                  isDragHover
                    ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30 scale-[1.02]"
                    : isChecked
                      ? isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-rose-500/5 border-rose-500/30"
                      : focusedQNum === item.qNum
                        ? "bg-primary/5 border-primary/40"
                        : "bg-card border-border/80 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-muted text-foreground font-black text-xs flex items-center justify-center shrink-0 border border-border">
                      {item.qNum}
                    </span>
                    <span className="font-extrabold text-sm text-foreground">
                      {item.text}
                    </span>
                  </div>

                  {isChecked && (
                    <div>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-50" />
                      )}
                    </div>
                  )}
                </div>

                {/* Drop Slot / Matched Value */}
                <div className={cn(
                  "p-2.5 rounded-xl border border-dashed text-xs font-bold transition-all flex items-center justify-between min-h-[42px]",
                  userVal || isAnswersRevealed
                    ? "bg-primary/10 border-solid border-primary text-primary font-black"
                    : isDragHover
                      ? "bg-indigo-500/15 border-indigo-500 text-indigo-700"
                      : "bg-muted/30 border-border text-muted-foreground"
                )}>
                  <div className="flex items-center gap-2 truncate">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {isAnswersRevealed
                        ? correctVal
                        : userVal || `Drop match for "${item.text}" here...`}
                    </span>
                  </div>

                  {userVal && !isAnswersRevealed && !isChecked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearSlot(item.qNum);
                      }}
                      className="p-1 rounded-full hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Remove match"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Feedback Answer Reveal */}
                {isChecked && !isCorrect && correctVal && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-in fade-in-50">
                    <span className="text-muted-foreground text-[10px]">Correct:</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.text} {correctVal}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Render Individual Question based on type ──────────────────────────────
  const renderQuestionItem = (qStr, idx) => {
    const qNum = idx + 1;
    const userVal = currentInputs[qNum] || "";
    const correctVal = solvedAnswers[qNum] || "";
    const isCorrect = userVal.trim().toLowerCase() === correctVal.trim().toLowerCase() ||
      (correctVal.length > 4 && userVal.trim().toLowerCase().includes(correctVal.trim().toLowerCase()));

    const isDragHover = dragOverQNum === qNum;

    // A. Check for Multiple Choice Question
    const mcq = parseMultipleChoiceQuestion(qStr);
    if (mcq && mcq.options.length >= 2) {
      return (
        <div
          key={idx}
          className={cn(
            "p-5 rounded-2xl border transition-all space-y-3.5",
            isChecked
              ? isCorrect
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-rose-500/5 border-rose-500/30"
              : "bg-muted/30 border-border/80 hover:border-border"
          )}
        >
          {/* Question Prompt */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-card border border-border text-foreground font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {qNum}
              </span>
              <h4 className="text-sm font-bold text-foreground leading-relaxed">
                {mcq.prompt}
              </h4>
            </div>

            {isChecked && (
              <div className="shrink-0">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-50" />
                )}
              </div>
            )}
          </div>

          {/* Interactive Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ml-9">
            {mcq.options.map((opt) => {
              const isSelected = isAnswersRevealed
                ? opt.key.toLowerCase() === correctVal.toLowerCase()
                : userVal.toLowerCase() === opt.key.toLowerCase();
              
              const isOptionCorrect = opt.key.toLowerCase() === correctVal.toLowerCase();

              return (
                <button
                  key={opt.key}
                  onClick={() => !isAnswersRevealed && handleInputChange(qNum, opt.key)}
                  disabled={isAnswersRevealed}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all shadow-2xs",
                    isChecked
                      ? isOptionCorrect
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold"
                        : isSelected
                          ? "bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/20"
                          : "bg-card border-border text-muted-foreground opacity-60"
                      : isSelected
                        ? "bg-primary/10 border-primary text-primary font-black ring-2 ring-primary/20 scale-[1.01]"
                        : "bg-card border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center shrink-0 border transition-all",
                    isSelected || (isChecked && isOptionCorrect)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border"
                  )}>
                    {opt.key}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {isChecked && isOptionCorrect && (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Answer Reveal */}
          {isChecked && !isCorrect && correctVal && (
            <div className="ml-9 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-in fade-in-50">
              <span className="text-muted-foreground">Correct Option:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold">
                {correctVal}
              </span>
            </div>
          )}
        </div>
      );
    }

    // B. Check for Gap Fill with Blank `__________` or `___`
    const hasBlank = /_{2,}|\[blank\]/i.test(qStr);
    const cleanQ = qStr.replace(/^\d+[\.\)]\s*/, "");

    if (hasBlank) {
      const parts = cleanQ.split(/_{2,}|\[blank\]/i);

      return (
        <div
          key={idx}
          className={cn(
            "p-4 rounded-2xl border transition-all space-y-2 relative group",
            isDragHover
              ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.01]"
              : isChecked
                ? isCorrect
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-rose-500/5 border-rose-500/30"
                : focusedQNum === qNum
                  ? "bg-primary/5 border-primary/40 shadow-xs"
                  : "bg-muted/30 border-border/70 hover:border-border"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-card border border-border text-foreground font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {qNum}
            </span>

            <div className="flex-1 text-sm font-medium text-foreground leading-relaxed">
              <span>{parts[0]}</span>
              
              {/* Interactive Drag & Drop Gap Target */}
              <span
                onDragOver={(e) => handleDragOver(e, qNum)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, qNum)}
                className="inline-block mx-1.5 align-middle relative"
              >
                <div className="relative inline-flex items-center">
                  <input
                    type="text"
                    value={isAnswersRevealed ? correctVal : userVal}
                    onChange={(e) => handleInputChange(qNum, e.target.value)}
                    onFocus={() => setFocusedQNum(qNum)}
                    placeholder={cleanWordBank.length > 0 ? `Drop here or type (${qNum})` : `Type answer (${qNum})`}
                    disabled={isAnswersRevealed}
                    draggable={!!userVal && !isAnswersRevealed}
                    onDragStart={(e) => userVal && handleDragStart(e, userVal, qNum)}
                    className={cn(
                      "px-3 py-1.5 text-xs sm:text-sm font-bold text-center rounded-xl border outline-none transition-all shadow-2xs",
                      "min-w-[140px] max-w-[260px] pr-6",
                      isDragHover
                        ? "border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500 text-indigo-700 dark:text-indigo-300 scale-105"
                        : isChecked
                          ? isCorrect
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                          : userVal
                            ? "bg-primary/10 border-primary text-primary font-black"
                            : "bg-background border-dashed border-border text-foreground focus:border-primary focus:border-solid focus:ring-2 focus:ring-primary/20"
                    )}
                  />

                  {userVal && !isAnswersRevealed && !isChecked && (
                    <button
                      onClick={() => handleClearSlot(qNum)}
                      className="absolute right-1.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Clear slot"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </span>

              <span>{parts[1] || ""}</span>
            </div>

            {isChecked && (
              <div className="shrink-0 mt-1">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-in zoom-in-50" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-500 animate-in zoom-in-50" />
                )}
              </div>
            )}
          </div>

          {/* Feedback Answer Reveal */}
          {isChecked && !isCorrect && correctVal && (
            <div className="ml-9 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 font-semibold animate-in fade-in-50">
              <span className="text-muted-foreground">Correct Answer:</span>
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 font-bold">
                {correctVal}
              </span>
            </div>
          )}
        </div>
      );
    }

    // C. Default question view / Discussion prompt
    return (
      <div
        key={idx}
        className="p-4 rounded-2xl bg-muted/30 border border-border flex items-start gap-3"
      >
        <span className="w-6 h-6 rounded-lg bg-card border border-border text-foreground font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
          {qNum}
        </span>
        <div className="flex-1 text-sm font-medium text-foreground leading-relaxed">
          {cleanQ}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      
      {/* ── Exercise Navigation Bar ── */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border overflow-x-auto no-scrollbar">
        {validExercises.map((ex, idx) => {
          const title = ex.instruction || `Exercise ${idx + 1}`;
          const isDone = checkedState[idx];

          return (
            <button
              key={idx}
              onClick={() => {
                setActiveExIdx(idx);
                setFocusedQNum(null);
                setDraggedWord(null);
                setDragOverQNum(null);
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0",
                activeExIdx === idx
                  ? "bg-card text-foreground shadow-xs border border-border ring-1 ring-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{title.length > 28 ? title.slice(0, 26) + "..." : title}</span>
              {isDone && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </button>
          );
        })}
      </div>

      {/* ── Active Exercise Card ── */}
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
        
        {/* Header with Exercise Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Exercise {activeExIdx + 1} of {validExercises.length}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase">
                {currentExercise.type || "Gap Fill"}
              </span>
            </div>
            <h3 className="text-lg font-black text-foreground">
              {currentExercise.instruction || `Exercise ${activeExIdx + 1}`}
            </h3>
            {currentExercise.description && (
              <p className="text-xs text-muted-foreground font-medium italic">
                {currentExercise.description}
              </p>
            )}
          </div>

          {/* Score Badge when checked */}
          {isChecked && totalCheckedQuestions > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 border border-emerald-500/30"
            >
              <Award className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-xs font-black text-foreground">
                  Score: {correctCount} / {totalCheckedQuestions}
                </div>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {accuracyPct}% Accuracy
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── 1. Matching View (If Exercise is Collocation Matching) ── */}
        {currentExercise.type === "matching" ? (
          renderMatchingView()
        ) : (
          <>
            {/* ── 2. Draggable Word Bank (For Gap Filling) ── */}
            {cleanWordBank && cleanWordBank.length > 0 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/5 via-indigo-500/5 to-purple-500/5 border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Word Bank — Drag words into the blanks or click to insert:</span>
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {cleanWordBank.length} words
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {cleanWordBank.map((word, wIdx) => {
                    const isUsed = Object.values(currentInputs).some(
                      v => v && v.trim().toLowerCase() === word.trim().toLowerCase()
                    );

                    return (
                      <div
                        key={wIdx}
                        draggable={!isUsed}
                        onDragStart={(e) => !isUsed && handleDragStart(e, word)}
                        onDragEnd={() => setDraggedWord(null)}
                        onClick={() => handleWordBankClick(word)}
                        title={isUsed ? "Placed in a blank (click or drag to move)" : "Drag or click to insert"}
                        className={cn(
                          "px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none flex items-center gap-2 shadow-2xs",
                          isUsed
                            ? "bg-muted/70 text-muted-foreground border border-dashed border-border line-through opacity-60 cursor-pointer"
                            : "bg-card text-foreground border border-border hover:border-primary hover:text-primary hover:shadow-md cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95"
                        )}
                      >
                        <GripVertical className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span>{word}</span>
                        {isUsed && <Check className="w-3 h-3 text-emerald-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 3. Questions List with Interactive Multiple Choice & Drop Zones ── */}
            <div className="space-y-3">
              {questions.map((qStr, idx) => renderQuestionItem(qStr, idx))}
            </div>
          </>
        )}

        {/* ── Action Buttons Bar ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAnswers}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Check Answers</span>
            </button>

            <button
              onClick={handleToggleAnswers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all shadow-2xs"
            >
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>{isAnswersRevealed ? "Hide Answers" : "Show Answers"}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground text-xs font-bold hover:bg-muted transition-all"
              title="Reset inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Previous / Next Exercise */}
          <div className="flex items-center gap-2">
            <button
              disabled={activeExIdx === 0}
              onClick={() => {
                setActiveExIdx(i => Math.max(0, i - 1));
                setFocusedQNum(null);
                setDraggedWord(null);
                setDragOverQNum(null);
              }}
              className="p-2 rounded-xl border border-border bg-card text-foreground disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-all"
              title="Previous Exercise"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-muted-foreground px-1">
              {activeExIdx + 1} / {validExercises.length}
            </span>
            <button
              disabled={activeExIdx === validExercises.length - 1}
              onClick={() => {
                setActiveExIdx(i => Math.min(validExercises.length - 1, i + 1));
                setFocusedQNum(null);
                setDraggedWord(null);
                setDragOverQNum(null);
              }}
              className="p-2 rounded-xl border border-border bg-card text-foreground disabled:opacity-40 disabled:pointer-events-none hover:bg-muted transition-all"
              title="Next Exercise"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
