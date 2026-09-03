"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Stethoscope, Lock, Mail, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Russia");
  const [medicalCollege, setMedicalCollege] = useState("");
  const [graduationYear, setGraduationYear] = useState("2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Live password strength calculator
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        setError("Supabase Auth is not configured. Please configure your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to register accounts.");
        setLoading(false);
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            country,
            medical_college: medicalCollege,
            graduation_year: graduationYear,
            role: "fmge_candidate",
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      router.push("/verify-email");
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-teal-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-xl w-full glass-panel p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Your <span className="gradient-text">FMGE AI Account</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join 14,000+ foreign medical graduates preparing for NBE FMGE & NMC NExT
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Rahul Verma"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Password & Live Strength Meter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters with numbers & symbols"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Password Strength:</span>
                  <span className={strength >= 75 ? "text-emerald-500" : strength >= 50 ? "text-amber-500" : "text-rose-500"}>
                    {strength >= 75 ? "Strong" : strength >= 50 ? "Medium" : "Weak"}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength >= 75 ? "bg-emerald-500" : strength >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${strength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mobile & Country of Graduation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Country of Study</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="Russia">Russia</option>
                <option value="Georgia">Georgia</option>
                <option value="Philippines">Philippines</option>
                <option value="Uzbekistan">Uzbekistan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Ukraine">Ukraine</option>
                <option value="China">China</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Medical College & Graduation Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Medical College</label>
              <input
                type="text"
                required
                value={medicalCollege}
                onChange={(e) => setMedicalCollege(e.target.value)}
                placeholder="e.g. Kursk State Medical University"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
              <select
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>{loading ? "Creating Account..." : "Create Account & Verify Email"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
