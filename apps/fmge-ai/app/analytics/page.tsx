"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/dashboard/SidebarLayout";
import {
  TrendingUp, Sparkles, CheckCircle2, ShieldCheck, Download, Sliders,
  Zap, Award, AlertCircle, ArrowRight, BarChart3, Users
} from "lucide-react";
import { fetchAnalyticsOverview, fetchSubjectMatrix, SubjectAnalyticsItem, AnalyticsOverview } from "@/services/fmge_analytics";

const defaultMatrix: SubjectAnalyticsItem[] = [
  { subject: "General Medicine", category: "Clinical", completion: 74, accuracy: 81.8, speed: "44s", status: "Strong" },
  { subject: "General Surgery", category: "Clinical", completion: 68, accuracy: 78.1, speed: "46s", status: "Good" },
  { subject: "Obstetrics & Gynecology", category: "Clinical", completion: 82, accuracy: 86.6, speed: "42s", status: "Strong" },
  { subject: "Pharmacology", category: "Para-Clinical", completion: 52, accuracy: 61.5, speed: "52s", status: "Needs Revision" },
  { subject: "Pathology", category: "Para-Clinical", completion: 61, accuracy: 72.4, speed: "48s", status: "Good" },
  { subject: "Community Medicine (PSM)", category: "Para-Clinical", completion: 45, accuracy: 58.0, speed: "55s", status: "Priority Weak Spot" }
];

export default function AnalyticsDashboardPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [subjectMatrix, setSubjectMatrix] = useState<SubjectAnalyticsItem[]>(defaultMatrix);
  const [extraWeeks, setExtraWeeks] = useState(0);
  const [extraMocks, setExtraMocks] = useState(0);
  const [pharmaBoost, setPharmaBoost] = useState(false);

  useEffect(() => {
    fetchAnalyticsOverview()
      .then((data) => {
        if (data && data.readiness) setOverview(data);
      })
      .catch((e) => console.warn("Analytics overview fetch error:", e));

    fetchSubjectMatrix()
      .then((mat) => {
        if (mat && mat.length > 0) setSubjectMatrix(mat);
      })
      .catch((e) => console.warn("Subject matrix fetch error:", e));
  }, []);

  // Simulated score boost calculations
  const baseScore = overview ? parseInt(overview.readiness.estimated_marks) || 194 : 194;
  const baseProb = overview ? overview.pass_prediction.probability_pct : 89.4;
  const scoreBoost = (extraWeeks * 3) + (extraMocks * 2.5) + (pharmaBoost ? 10 : 0);
  const simulatedScore = Math.min(Math.round(baseScore + scoreBoost), 285);
  const simulatedProb = Math.min(Math.round((baseProb + (scoreBoost * 0.4)) * 10) / 10, 99.5);

  const recommendations = [
    {
      id: "rec-1",
      priority: "HIGH",
      title: "Revise Autonomic Pharmacology & Antimicrobial Mechanisms",
      reason: "Accuracy in Pharmacology is 61.5% (15% below clinical average).",
      expectedGain: "+8 Marks in FMGE",
      estimatedMins: 45,
      url: "/qbank?subject=pharmacology"
    },
    {
      id: "rec-2",
      priority: "HIGH",
      title: "Attempt NBE Grand Test #2",
      reason: "Increasing mock frequency from 1 to 2 per month improves time management speed by 12s/MCQ.",
      expectedGain: "+12 Marks in FMGE",
      estimatedMins: 300,
      url: "/mocks"
    },
    {
      id: "rec-3",
      priority: "MEDIUM",
      title: "Review PSM Vaccine Schedule & Biostatistics",
      reason: "PSM completion is 45.0%. Target completion is 70% before Aug 15.",
      expectedGain: "+6 Marks in FMGE",
      estimatedMins: 30,
      url: "/planner"
    }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-8 max-w-7xl">
        
        {/* Header Banner */}
        <div className="glass-panel p-8 rounded-3xl border border-teal-200 dark:border-slate-800 bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-300 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
                AI Predictive Intelligence Engine
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PASSED (150 Cutoff Met)</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              FMGE Performance & <span className="text-teal-400">Exam Readiness</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Continuous predictive modeling based on QBank accuracy, mock tests, clinical reasoning, and study streak.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">Predicted Pass Probability</span>
            <div className="text-3xl font-black text-emerald-400 mt-1">{simulatedProb}%</div>
            <div className="text-xs text-teal-300 font-bold mt-1">Est. {simulatedScore} / 300 Marks</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3">
          <Link
            href="/analytics/reports"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Download PDF Reports</span>
          </Link>

          <Link
            href="/analytics/faculty"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Users className="w-4 h-4 text-teal-400" />
            <span>Faculty Cohort View</span>
          </Link>
        </div>

        {/* Interactive "What-If" Exam Simulator Card */}
        <div className="glass-panel p-6 rounded-3xl border border-teal-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal-600" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Interactive "What-If" Exam Readiness Simulator</h3>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded border">
              Live Simulation Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Controls */}
            <div className="lg:col-span-8 space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Simulate Extra Study Time (+3 Wks = +9 Marks):</span>
                  <span className="text-teal-600">+{extraWeeks} Weeks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={extraWeeks}
                  onChange={(e) => setExtraWeeks(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span>Simulate Extra NBE Mock Tests (+1 Mock = +2.5 Marks):</span>
                  <span className="text-teal-600">+{extraMocks} Mocks</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={extraMocks}
                  onChange={(e) => setExtraMocks(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pharmaBoost}
                  onChange={(e) => setPharmaBoost(e.target.checked)}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="font-bold">Simulate Mastering Pharmacology Weak Spots (+10 Marks Boost)</span>
              </label>
            </div>

            {/* Right Simulation Outcome Result */}
            <div className="lg:col-span-4 p-6 rounded-2xl bg-teal-950 text-white text-center space-y-2 border border-teal-800 shadow-xl">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300">Simulated Outcome</span>
              <div className="text-4xl font-black text-emerald-400">{simulatedScore} / 300</div>
              <div className="text-xs font-bold text-teal-200">
                Pass Probability: <span className="text-emerald-400">{simulatedProb}%</span>
              </div>
              <div className="text-[11px] font-bold text-teal-300 pt-1">
                Score Gain: +{Math.round(scoreBoost)} Marks
              </div>
            </div>

          </div>
        </div>

        {/* 19-Subject Performance Matrix Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">19-Subject Performance Matrix</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Completion %</th>
                  <th className="p-3">Accuracy %</th>
                  <th className="p-3">Avg Speed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subjectMatrix.map((sub) => (
                  <tr key={sub.subject} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.subject}</td>
                    <td className="p-3 text-slate-500">{sub.category}</td>
                    <td className="p-3 font-bold text-teal-600">{sub.completion}%</td>
                    <td className="p-3 font-bold text-emerald-600">{sub.accuracy}%</td>
                    <td className="p-3 text-slate-500">{sub.speed}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sub.status === "Strong"
                          ? "bg-emerald-100 text-emerald-800"
                          : sub.status === "Good"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionable AI Intervention Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Intervention Recommendations</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">
                      {rec.priority} PRIORITY
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{rec.expectedGain}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{rec.title}</h4>
                  <p className="text-xs text-slate-500">{rec.reason}</p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={rec.url}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow"
                  >
                    <span>Execute Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
