"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductSwitcher } from "@healthcare-suite/ui";
import {
  Stethoscope, LayoutDashboard, Calendar, BookOpen, Clock, Bot,
  Stethoscope as CaseIcon, Layers, TrendingUp, Bookmark, FileText,
  Award, CreditCard, Settings, HelpCircle, Menu, X, Search, Bell,
  User, Sun, Moon, LogOut
} from "lucide-react";
import { useAuth } from "@/components/common/AuthContext";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Dr. Rahul Sharma");
  const initials = displayName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "RS";
  const userPlan = profile?.subscription_plan || "Pro Clinical Pass";

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Study Planner", href: "/planner", icon: <Calendar className="w-4 h-4" /> },
    { label: "Question Bank", href: "/qbank", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Mock Tests", href: "/mocks", icon: <Clock className="w-4 h-4" /> },
    { label: "AI Tutor", href: "/ai-tutor", icon: <Bot className="w-4 h-4" /> },
    { label: "Clinical Cases", href: "/clinical-cases", icon: <CaseIcon className="w-4 h-4" /> },
    { label: "Revision Center", href: "/revision", icon: <Layers className="w-4 h-4" /> },
    { label: "Performance Analytics", href: "/analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Bookmarks", href: "/bookmarks", icon: <Bookmark className="w-4 h-4" /> },
    { label: "Personal Notes", href: "/notes", icon: <FileText className="w-4 h-4" /> },
    { label: "Achievements", href: "/achievements", icon: <Award className="w-4 h-4" /> },
    { label: "Subscription", href: "/dashboard/subscription", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Settings", href: "/profile", icon: <Settings className="w-4 h-4" /> },
    { label: "Help & Support", href: "/contact", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row antialiased">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed top-0 bottom-0 left-0 z-40">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                FMGE <span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Learning Workspace</span>
            </div>
          </Link>
        </div>

        {/* Product Switcher */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <React.Suspense fallback={null}>
            <ProductSwitcher currentProduct="FMGE" />
          </React.Suspense>
        </div>

        {/* Nav Links List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <Link href="/profile" className="flex items-center gap-3 flex-1 overflow-hidden group">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] text-teal-600 font-semibold">{userPlan}</span>
            </div>
          </Link>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Top App Header */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Left: Mobile Drawer Button & Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-48 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global search (MCQs, notes, topics)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <Link href="/notifications" className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center relative" title="Notifications & Inbox">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5" />
              </Link>
            </div>

            <Link href="/profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex">
          <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">FMGE AI</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <React.Suspense fallback={null}>
                <ProductSwitcher currentProduct="FMGE" />
              </React.Suspense>

              <nav className="space-y-1 overflow-y-auto max-h-[70vh]">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-600"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
