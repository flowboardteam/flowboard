import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/talent/Sidebar";
import DashboardHeader from "@/components/talent/DashboardHeader";
import MobileSidebar from "@/components/talent/MobileSidebar";

export default function DashboardLayout() {
  const [theme, setTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync with Database
  useEffect(() => {
    const syncTheme = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("theme_preference")
          .eq("id", user.id)
          .single();
        if (data?.theme_preference) setTheme(data.theme_preference);
      }
    };
    syncTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ theme_preference: newTheme })
        .eq("id", user.id);
    }
  };

  const themeStyles = theme === "light"
  ? {
      "--bg-main": "#F8FAFC",
      "--sidebar-bg": "#FFFFFF",
      "--text-main": "#0F172A",
      "--border-color": "#E2E8F0",
      "--card-bg": "#FFFFFF",
      "--brand-primary": "#3b82f6", // Electric Blue from Landing
    }
  : {
      "--bg-main": "#050B1E",       // Exact Hero Background
      "--sidebar-bg": "#0A1229",    // Slightly lighter deep blue
      "--text-main": "#FFFFFF",
      "--border-color": "#1E293B",
      "--card-bg": "#0F172A",
      "--brand-primary": "#3b82f6", // Electric Blue
      "--card-backdrop": "blur(12px)",      // The magic "glass" effect
    };

  return (
    <div
      style={themeStyles as any}
      className="flex h-screen w-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 overflow-hidden"
    >
      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block shrink-0 h-full overflow-y-auto border-r border-[var(--border-color)] bg-[var(--sidebar-bg)]">
        <div className="w-72">
          <Sidebar />
        </div>
      </div>

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-grow flex flex-col min-w-0">
        <DashboardHeader
          onMenuClick={() => setIsMobileMenuOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ theme, toggleTheme }} />
          </div>
        </main>
      </div>
    </div>
  );
}
