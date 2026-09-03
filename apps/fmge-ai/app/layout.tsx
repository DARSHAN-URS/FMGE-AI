import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { AuthProvider } from "@/components/common/AuthContext";

export const metadata: Metadata = {
  title: "FMGE AI — Foreign Medical Graduate Examination Prep Platform",
  description: "Pass FMGE & NExT on your first attempt. 15,000+ NBE-pattern MCQs, 300-Q CBT mock test simulator, AI clinical tutor, and adaptive 19-subject study planner.",
  keywords: [
    "FMGE Preparation",
    "FMGE AI",
    "FMGE Question Bank",
    "FMGE Mock Test",
    "NBE CBT Exam",
    "NMC Licensing Exam",
    "Foreign Medical Graduate",
    "Medical AI Tutor",
    "NEXT Exam Prep"
  ],
  openGraph: {
    title: "FMGE AI — Clear FMGE & NExT on First Attempt",
    description: "The AI-powered medical licensing preparation platform for foreign medical graduates.",
    url: "https://fmge.ai",
    siteName: "FMGE AI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FMGE AI — Foreign Medical Graduate Exam AI Engine",
    description: "Master 19 medical subjects with AI adaptive question bank and CBT test simulator.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
