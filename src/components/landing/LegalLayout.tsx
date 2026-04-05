import { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  badge: string;
  children: ReactNode;
}

export function LegalLayout({ title, subtitle, lastUpdated, badge, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-5">
      <Navbar forceOpaque />

      {/* Hero */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Ink bleed */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10 bg-blue-600 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50 px-4 py-1.5 rounded-full mb-6">
            {badge}
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-5">
            {title}
          </h1>
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {subtitle}
          </p>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}