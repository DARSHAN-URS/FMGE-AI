"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { authenticatedFetch } from "@/lib/api";

interface FMGEProfile {
  id?: string;
  full_name?: string;
  role?: string;
  target_exam?: string;
  medical_college?: string;
  country?: string;
  subscription_plan?: string;
  onboarding_completed?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: FMGEProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FMGEProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const syncBackendProfile = async () => {
    try {
      const res = await authenticatedFetch("/api/fmge/auth/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile || data.data || null);
      }
    } catch (e) {
      console.warn("Could not sync FMGE profile from backend:", e);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase credentials not configured in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (typeof document !== "undefined") {
          if (session) {
            document.cookie = "fmge_auth=1; path=/; max-age=2592000; SameSite=Lax";
          } else {
            document.cookie = "fmge_auth=; path=/; max-age=0; SameSite=Lax";
          }
        }
        if (session) {
          await syncBackendProfile();
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Supabase auth session fetch error:", err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (typeof document !== "undefined") {
        if (session) {
          document.cookie = "fmge_auth=1; path=/; max-age=2592000; SameSite=Lax";
        } else {
          document.cookie = "fmge_auth=; path=/; max-age=0; SameSite=Lax";
        }
      }
      if (session) {
        await syncBackendProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Supabase signOut error:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      if (typeof document !== "undefined") {
        document.cookie = "fmge_auth=; path=/; max-age=0; SameSite=Lax";
      }
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!user,
        signOut: handleSignOut,
        logout: handleSignOut,
        refreshProfile: syncBackendProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
