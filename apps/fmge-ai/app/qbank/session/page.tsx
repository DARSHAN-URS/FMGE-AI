"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/dashboard/SidebarLayout";
import { ImageZoomModal } from "@/components/qbank/ImageZoomModal";
import {
  Clock, Bookmark, Flag, Sparkles, CheckCircle2, XCircle, Maximize2,
  Strikethrough, ChevronRight, ArrowLeft
} from "lucide-react";
import { fetchQuestionList, submitQuestionAttempt, toggleQuestionBookmark, Question } from "@/services/fmge_qbank";
import { useAuth } from "@/components/common/AuthContext";

export default function QBankSessionPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [strikethroughs, setStrikethroughs] = useState<Record<number, boolean>>({});
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    fetchQuestionList()
      .then((data) => {
        if (data) {
          setQuestions(data);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.warn("Failed to load questions from backend:", e);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const currentQ = questions[currentIndex];

  const toggleStrikethrough = (optId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrikethroughs((prev) => ({ ...prev, [optId]: !prev[optId] }));
  };

  const handleSubmitAnswer = async () => {
    if (selectedOpt === null) return;
    setSubmitted(true);

    if (user?.id) {
      try {
        await submitQuestionAttempt({
          user_id: user.id,
          question_id: currentQ.id,
          selected_option: selectedOpt,
          time_taken_seconds: 60 - secondsRemaining,
        });
      } catch (err) {
        console.warn("Could not save attempt to server:", err);
      }
    }
  };

  const handleBookmarkToggle = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (user?.id) {
      try {
        await toggleQuestionBookmark(user.id, currentQ.id);
      } catch (err) {
        console.warn("Failed to update bookmark:", err);
      }
    }
  };

  const handleNextQuestion = () => {
    setSubmitted(false);
    setSelectedOpt(null);
    setStrikethroughs({});
    setSecondsRemaining(60);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  if (loading || !currentQ) {
    return (
      <SidebarLayout>
        <div className="p-16 text-center text-xs font-bold text-slate-500 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800">
          Loading live NBE question stream from AI Question Bank...
        </div>
      </SidebarLayout>
    );
  }

  const isCorrect = selectedOpt === currentQ.correct_option;

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-6xl">
        
        {/* Top Controls Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <Link
            href="/qbank"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Session</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded border border-teal-200">
              <Clock className="w-3.5 h-3.5" />
              <span>00:{secondsRemaining.toString().padStart(2, "0")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 ${
                isBookmarked
                  ? "bg-teal-50 text-teal-600 border-teal-300"
                  : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-teal-600" : ""}`} />
              <span className="hidden sm:inline">Bookmark</span>
            </button>
          </div>
        </div>

        {/* Question Solver Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Vignette & Options */}
          <div className={submitted ? "lg:col-span-6 space-y-6" : "lg:col-span-12 space-y-6"}>
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
              
              {/* Question Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800">
                    {currentQ.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{currentQ.topic}</span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* IBQ Image Slide */}
              {currentQ.is_ibq && currentQ.image_url && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 group">
                  <img
                    src={currentQ.image_url}
                    alt="Clinical Vignette Case"
                    className="w-full h-48 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform"
                  />
                  <button
                    onClick={() => setShowImageZoom(true)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 text-xs flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Zoom Image</span>
                  </button>
                </div>
              )}

              {/* Question Stem */}
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentQ.question_stem}
              </p>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isStruck = strikethroughs[opt.id];
                  const isChosen = selectedOpt === opt.id;
                  const isRight = opt.id === currentQ.correct_option;

                  let optClass = "border-slate-200 dark:border-slate-800 hover:border-teal-500 bg-white dark:bg-slate-900";
                  if (isChosen && !submitted) {
                    optClass = "border-teal-600 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 ring-2 ring-teal-500";
                  } else if (submitted) {
                    if (isRight) {
                      optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                    } else if (isChosen && !isRight) {
                      optClass = "border-rose-500 bg-rose-50 text-rose-900";
                    }
                  }

                  return (
                    <div
                      key={opt.id}
                      onClick={() => !submitted && setSelectedOpt(opt.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${optClass} ${
                        isStruck ? "opacity-40 line-through" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center font-bold text-xs">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs font-semibold">{opt.text}</span>
                      </div>

                      {!submitted && (
                        <button
                          onClick={(e) => toggleStrikethrough(opt.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          title="Strike-through eliminate option"
                        >
                          <Strikethrough className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!submitted && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOpt === null}
                    className="px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-teal-600/20"
                  >
                    Submit Answer & View AI Rationale
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Split-Panel AI Explanation Engine */}
          {submitted && (
            <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-teal-200 dark:border-slate-800 space-y-5 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>FMGE AI Explanation Engine</span>
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded ${
                  isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                </span>
              </div>

              {/* Rationale Breakdown */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Core Clinical Rationale:</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                    {currentQ.explanation?.correct_rationale || "Inferior leads (II, III, aVF) reflect the Right Coronary Artery."}
                  </p>
                </div>

                {/* Distractor Analysis */}
                {currentQ.explanation?.distractor_analysis && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <h5 className="font-bold text-slate-900 dark:text-white">Option Distractor Breakdown:</h5>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                      {Object.entries(currentQ.explanation.distractor_analysis).map(([letter, desc]) => (
                        <li key={letter}>• <strong>{letter}:</strong> {desc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* High Yield Mnemonic */}
                {currentQ.explanation?.high_yield_pearl && (
                  <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 text-teal-900 dark:text-teal-200 font-medium">
                    <span className="font-bold block text-teal-800 dark:text-teal-300 mb-0.5">High-Yield Memory Mnemonic:</span>
                    {currentQ.explanation.high_yield_pearl}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
                >
                  Next Question →
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Medical Image Zoom Modal */}
      {showImageZoom && currentQ.image_url && (
        <ImageZoomModal
          imageUrl={currentQ.image_url}
          title="Clinical Vignette Image Slide"
          onClose={() => setShowImageZoom(false)}
        />
      )}
    </SidebarLayout>
  );
}
