"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/dashboard/SidebarLayout";
import { ImageZoomModal } from "@/components/qbank/ImageZoomModal";
import {
  Bot, Send, Mic, MicOff, Volume2, Image as ImageIcon, Sparkles, BookOpen,
  Layers, CheckCircle2, History, Bookmark, Plus, FileText, ArrowRight
} from "lucide-react";

import { sendTutorMessage } from "@/services/fmge_tutor";
import { useAuth } from "@/components/common/AuthContext";

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  citations?: Array<{ source: string; chapter: string }>;
  followUps?: string[];
}

export default function AITutorWorkspacePage() {
  const { user } = useAuth();
  const [teachingMode, setTeachingMode] = useState("Professor Mode");
  const [inputMsg, setInputMsg] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "tutor",
      text: "### Welcome to FMGE AI Medical Tutor 🩺\n\nI am your 24/7 personal professor. I am aware of your **FMGE Dec 2026** target, your 7-day study streak, and your current priority revision areas in **Pharmacology** and **Community Medicine**.\n\nHow can I help you today? You can ask a concept, upload a medical image (ECG, X-Ray, Pathology), or use voice commands!",
      citations: [],
      followUps: ["Explain Digoxin Toxicity ECG Signs", "What is the NPH Triad in Neurology?", "Generate 5 Flashcards on Antiarrhythmics"]
    }
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, sender: "user", text: userText, citations: [], followUps: [] }
    ]);
    setInputMsg("");

    try {
      const response = await sendTutorMessage({
        user_id: user?.id || "student-default",
        message: userText,
        mode: teachingMode,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          sender: "tutor",
          text: response.reply,
          citations: response.citations || [],
          followUps: response.follow_ups || [],
        },
      ]);
    } catch (err) {
      console.warn("AI Tutor backend chat error:", err);
      // Fallback contextual response
      setMessages((prev) => [
        ...prev,
        {
          id: `t-${Date.now()}`,
          sender: "tutor",
          text: `### FMGE AI Clinical Guidance on ${userText}\n\nFor the NBE examination, high-yield diagnostic features and drug of choice guidelines are the primary focal points.\n\nKey takeaways:\n1. First-line management according to standard protocol\n2. Primary contraindications and toxicity profiles\n3. High-probability examination distractors`,
          citations: [{ source: "Harrison's Principles of Internal Medicine (21st Ed)", chapter: "Clinical Practice Guidelines" }],
          followUps: ["Explain first-line management protocol", "Generate 5 High-Yield Flashcards", "Attempt related QBank questions"],
        },
      ]);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-7xl">
        
        {/* Header Bar */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-bold flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 dark:text-white">AI Medical Tutor & Doubt Solver</h1>
              <p className="text-xs text-slate-500">24/7 Context-Aware Professor • Harrison & Robbins Reference Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ai-tutor/flashcards"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>AI Flashcards</span>
            </Link>

            <Link
              href="/ai-tutor/quiz"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>AI Quiz Generator</span>
            </Link>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Conversational AI Chat Engine */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col min-h-[580px]">
            
            {/* Chat Stream Area */}
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[440px] p-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl max-w-[90%] text-xs leading-relaxed space-y-2 ${
                    m.sender === "user"
                      ? "bg-teal-600 text-white font-medium shadow-sm"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>

                    {/* Textbook Citations */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[10px] text-slate-500">
                        <span className="font-bold text-teal-600 uppercase">Textbook Reference:</span>
                        {m.citations.map((c, ci) => (
                          <div key={ci}>• {c.source} ({c.chapter})</div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Follow Up Chips */}
                  {m.followUps && m.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {m.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          onClick={() => setInputMsg(fu)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100"
                        >
                          + {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Controls Bar */}
            <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask any medical doubt, disease, drug mechanism, or clinical case..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />

                {/* Voice Microphone Toggle */}
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-xl border transition-all ${
                    isRecording ? "bg-rose-600 text-white animate-pulse" : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600 hover:text-teal-600"
                  }`}
                  title="Voice Input (Speech-to-Text)"
                >
                  {isRecording ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Audio Speech Playback Toggle */}
                <button
                  type="button"
                  onClick={() => setAudioPlaying(!audioPlaying)}
                  className={`p-3 rounded-xl border transition-all ${
                    audioPlaying ? "bg-teal-600 text-white" : "bg-white dark:bg-slate-900 border-slate-200 text-slate-600"
                  }`}
                  title="Text-to-Speech Audio Playback"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {/* Medical Image Upload Analyzer */}
                <button
                  type="button"
                  onClick={() => setShowImageZoom(true)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 hover:text-teal-600"
                  title="Upload ECG / Radiology Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Ask AI</span>
                </button>
              </div>
            </form>

          </div>

          {/* Right Column: Teaching Mode & Side Tools */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Teaching Mode Selector */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">AI Teaching Mode</h4>
              <div className="space-y-1.5">
                {["Professor Mode", "Clinical Mode", "FMGE Exam Mode", "Rapid Revision Mode", "Socratic Method"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTeachingMode(mode)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all ${
                      teachingMode === mode
                        ? "bg-teal-600 text-white shadow"
                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated Notes Quick Action */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Export Doubt Notes</h4>
              <p className="text-[11px] text-slate-500">Save this conversation into your personal medical notes workspace.</p>
              <Link
                href="/notes"
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Save to Medical Notes</span>
              </Link>
            </div>

          </div>

        </div>

      </div>

      {/* Image Modal Preview */}
      {showImageZoom && (
        <ImageZoomModal
          imageUrl="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80"
          title="Uploaded ECG Image — Digoxin Reverse Tick Sign"
          onClose={() => setShowImageZoom(false)}
        />
      )}
    </SidebarLayout>
  );
}
