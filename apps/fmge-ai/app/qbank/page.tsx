"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/dashboard/SidebarLayout";
import { BookOpen, Sparkles, Filter, ChevronRight, Zap, AlertTriangle, Layers, Play } from "lucide-react";
import { fetchSubjectTaxonomy, SubjectTaxonomy } from "@/services/fmge_qbank";

export default function QBankExplorerPage() {
  const [subjectsList, setSubjectsList] = useState<SubjectTaxonomy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchSubjectTaxonomy()
      .then((tax) => {
        if (tax) {
          setSubjectsList(tax);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.warn("Failed to load backend taxonomy:", e);
        setLoading(false);
      });
  }, []);

  const filteredSubjects = selectedCategory === "All"
    ? subjectsList
    : subjectsList.filter((s) => s.category === selectedCategory);

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-7xl">
        
        {/* Header Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-teal-200 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-300 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              15,000+ NBE Pattern MCQs
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            AI Adaptive <span className="text-teal-400">Question Bank</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Practice NBE-pattern clinical vignettes, image-based questions (IBQs), and distractor analyses across all 19 medical subjects.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/qbank/session"
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Adaptive MCQ Practice</span>
            </Link>

            <Link
              href="/qbank/rapid"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>50-Q Rapid High-Yield Revision</span>
            </Link>
          </div>
        </div>

        {/* Practice Modes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Weak Topic Focus</h3>
            <p className="text-xs text-slate-500">Automatically builds a practice set focusing on your lowest accuracy subjects (Pharmacology & PSM).</p>
            <Link href="/qbank/session?mode=weak" className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:underline pt-1">
              <span>Start Weak Area Practice</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Incorrect Questions Review</h3>
            <p className="text-xs text-slate-500">Re-attempt 340 questions you previously answered incorrectly across Grand Tests.</p>
            <Link href="/qbank/session?mode=incorrect" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:underline pt-1">
              <span>Review Incorrect MCQs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Image-Based Questions (IBQs)</h3>
            <p className="text-xs text-slate-500">Dedicated practice set for 4,500+ Radiology X-rays, CT/MRI scans, and Pathology slides.</p>
            <Link href="/qbank/session?mode=ibq" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1">
              <span>Practice IBQ Bank</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 19 Subject Selection Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Subject-wise Practice Directory</h2>
              <p className="text-xs text-slate-500">Select any subject to launch a customized topic practice session.</p>
            </div>

            <div className="flex gap-2">
              {["All", "Pre-Clinical", "Para-Clinical", "Clinical"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/qbank/session?subject=${sub.id}`}
                className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                      {sub.name}
                    </h3>
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border">
                      {sub.total_qs} Qs
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">{sub.category}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Completion:</span>
                    <span className="text-teal-600">{sub.completion ?? 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${sub.completion ?? 0}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
