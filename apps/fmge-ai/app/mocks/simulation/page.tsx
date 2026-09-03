"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock, Bookmark, Flag, CheckCircle2, AlertTriangle, ShieldCheck,
  Maximize2, ChevronLeft, ChevronRight, Save, LogOut, Check
} from "lucide-react";

const sampleQuestions = [
  {
    id: 101,
    part: "Part A",
    subject: "General Medicine",
    topic: "Cardiology",
    stem: "A 45-year-old male presents with sudden onset retrosternal crushing pain radiating to left jaw. ECG shows ST elevation in II, III, aVF. What coronary artery is acutely occluded?",
    options: [
      { id: 0, text: "Left Anterior Descending Artery (LAD)" },
      { id: 1, text: "Right Coronary Artery (RCA)" },
      { id: 2, text: "Left Circumflex Artery (LCx)" },
      { id: 3, text: "Left Main Coronary Artery (LMCA)" }
    ]
  },
  {
    id: 102,
    part: "Part A",
    subject: "Pharmacology",
    topic: "Antimicrobials",
    stem: "Which of the following anti-hypertensive drugs is contraindicated in pregnant women due to risk of fetal renal dysgenesis?",
    options: [
      { id: 0, text: "Labetalol" },
      { id: 1, text: "Methyldopa" },
      { id: 2, text: "Enalapril (ACE Inhibitor)" },
      { id: 3, text: "Nifedipine" }
    ]
  },
  {
    id: 103,
    part: "Part B",
    subject: "Obstetrics & Gynecology",
    topic: "Pre-eclampsia",
    stem: "A 28-year-old primigravida at 34 weeks presents with BP 165/110 mmHg, 3+ proteinuria, and severe headache. What is the drug of choice for seizure prophylaxis?",
    options: [
      { id: 0, text: "Phenytoin" },
      { id: 1, text: "Magnesium Sulfate (MgSO4)" },
      { id: 2, text: "Diazepam" },
      { id: 3, text: "Sodium Nitroprusside" }
    ]
  }
];

import { fetchMockQuestions, autoSaveMockAnswers, submitMockTest, MockQuestion } from "@/services/fmge_mocks";
import { useAuth } from "@/components/common/AuthContext";

export default function ExamSimulationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<MockQuestion[]>(sampleQuestions);
  const [currentPart, setCurrentPart] = useState<"Part A" | "Part B">("Part A");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("Auto-saved");

  useEffect(() => {
    fetchMockQuestions("gt-01")
      .then((qs) => {
        if (qs && qs.length > 0) setQuestions(qs);
      })
      .catch((e) => console.warn("Could not load mock questions:", e));
  }, []);

  const currentQ = questions[currentIndex] || sampleQuestions[0];

  const handleSelectOption = (optId: number) => {
    const updated = { ...answers, [currentQ.id]: optId };
    setAnswers(updated);
    setAutoSaveStatus("Saving...");
    
    if (user?.id) {
      const stringAnswers: Record<string, number> = {};
      Object.entries(updated).forEach(([k, v]) => {
        stringAnswers[k] = v;
      });
      autoSaveMockAnswers({
        user_id: user.id,
        test_id: "gt-01",
        answers: stringAnswers,
        time_remaining_seconds: 7200,
      }).then(() => setAutoSaveStatus("Auto-saved"))
        .catch(() => setAutoSaveStatus("Auto-saved (local)"));
    } else {
      setTimeout(() => setAutoSaveStatus("Auto-saved"), 300);
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleFinalSubmit = async () => {
    if (user?.id) {
      try {
        const stringAnswers: Record<string, number> = {};
        Object.entries(answers).forEach(([k, v]) => {
          stringAnswers[k] = v;
        });
        await submitMockTest({
          user_id: user.id,
          test_id: "gt-01",
          answers: stringAnswers,
          time_taken_seconds: 3600,
        });
      } catch (err) {
        console.warn("Submit test error:", err);
      }
    }
    router.push("/mocks/results/gt-01");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col antialiased">
      
      {/* Top Official Examination Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 font-bold flex items-center justify-center">
            NBE
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-white">NBE FMGE Official Examination Simulator</h1>
            <p className="text-[10px] text-slate-400">National Board of Examinations in Medical Sciences (NBEMS)</p>
          </div>
        </div>

        {/* Center Session Tabs */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentPart("Part A")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentPart === "Part A" ? "bg-teal-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Part A (150 Qs • Morning)
          </button>

          <button
            onClick={() => setCurrentPart("Part B")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentPart === "Part B" ? "bg-teal-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Part B (150 Qs • Afternoon)
          </button>
        </div>

        {/* Right Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950 border border-teal-800 text-teal-300 text-xs font-mono font-bold">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>02:14:30</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow"
          >
            Finish & Submit Exam
          </button>
        </div>
      </header>

      {/* Main Exam Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Question Workspace */}
        <main className="lg:col-span-8 p-6 sm:p-8 space-y-6 flex flex-col justify-between border-r border-slate-800">
          
          <div className="space-y-6">
            {/* Meta header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-teal-400 bg-teal-950 px-3 py-1 rounded border border-teal-800">
                Question {currentIndex + 1} of {sampleQuestions.length} • {currentQ.subject}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{autoSaveStatus}</span>
              </span>
            </div>

            {/* Question Stem */}
            <p className="text-base font-semibold text-slate-100 leading-relaxed">
              {currentQ.stem}
            </p>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt) => {
                const selected = answers[currentQ.id] === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selected
                        ? "bg-teal-950 border-teal-500 text-teal-200 font-bold ring-2 ring-teal-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                      selected ? "bg-teal-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {String.fromCharCode(65 + opt.id)}
                    </span>
                    <span className="text-xs">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Nav Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkForReview}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  markedForReview[currentQ.id]
                    ? "bg-purple-950 text-purple-300 border-purple-700"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{markedForReview[currentQ.id] ? "Marked for Review" : "Mark for Review"}</span>
              </button>

              <button
                onClick={() => {
                  const updated = { ...answers };
                  delete updated[currentQ.id];
                  setAnswers(updated);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={currentIndex === sampleQuestions.length - 1}
                onClick={() => setCurrentIndex((i) => Math.min(i + 1, sampleQuestions.length - 1))}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </main>

        {/* Right Question Palette Drawer */}
        <aside className="lg:col-span-4 p-6 space-y-6 bg-slate-900/60">
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-white">NBE Question Palette ({currentPart})</h3>
            <p className="text-[11px] text-slate-400">Click any grid cell to navigate directly to that MCQ.</p>
          </div>

          {/* Palette Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500 shrink-0" />
              <span>Answered ({Object.keys(answers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-purple-600 shrink-0" />
              <span>Marked Review ({Object.keys(markedForReview).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-slate-700 shrink-0" />
              <span>Unvisited ({sampleQuestions.length - Object.keys(answers).length})</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2.5 pt-2">
            {sampleQuestions.map((q, idx) => {
              const isAns = answers[q.id] !== undefined;
              const isMarked = markedForReview[q.id];
              const isCurrent = idx === currentIndex;

              let cellStyle = "bg-slate-800 text-slate-400 border-slate-700";
              if (isAns) cellStyle = "bg-emerald-600 text-white border-emerald-500 font-bold";
              if (isMarked) cellStyle = "bg-purple-600 text-white border-purple-500 font-bold";
              if (isCurrent) cellStyle += " ring-2 ring-teal-400";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${cellStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>

      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center mx-auto ring-4 ring-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Submit NBE Examination?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to finish and submit your exam? Your responses will be locked and sent for AI evaluation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white">300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered:</span>
                <span className="font-bold text-emerald-400">{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Marked for Review:</span>
                <span className="font-bold text-purple-400">{Object.keys(markedForReview).length}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow"
              >
                Confirm Submission & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
