import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/client/Sidebar";
import DashboardHeader from "@/components/client/DashboardHeader";
import MobileSidebar from "@/components/client/MobileSidebar";
import { GroupProvider } from "@/contexts/GroupContext";

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

  // Put this in a place that runs when the Dashboard loads (e.g., DashboardLayout.tsx)
useEffect(() => {
  const syncProfile = async () => {
    // 1. Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      // 2. Extract social image from metadata
      const socialImage = user.user_metadata?.picture || user.user_metadata?.avatar_url;

      if (socialImage) {
        // 3. Check if they already have an avatar in your 'profiles' table
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        // 4. If empty, sync it!
        if (!profile?.avatar_url) {
          await supabase
            .from('profiles')
            .update({ avatar_url: socialImage })
            .eq('id', user.id);
          
          console.log("✅ Social profile picture synced to database!");
        }
      }
    }
  };

  syncProfile();
}, []);

  const themeStyles = theme === "light"
  ? {
      "--bg-main": "#F9F9FB",
      "--sidebar-bg": "#FFFFFF",
      "--text-main": "#1A1C21",
      "--border-color": "#EEEEF0",
      "--card-bg": "#FFFFFF",
      "--brand-primary": "#10b981", // Emerald for Client
    }
  : {
      "--bg-main": "#050B1E",
      "--sidebar-bg": "#0A1229",
      "--text-main": "#FFFFFF",
      "--border-color": "#1E293B",
      "--card-bg": "#0F172A",
      "--brand-primary": "#10b981", // Emerald for Client
      "--card-backdrop": "blur(12px)",
    };

  return (
    <GroupProvider>
      <div
        style={themeStyles as any}
        className="flex flex-col h-screen w-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 overflow-hidden font-jakarta"
      >
        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

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
    </GroupProvider>
  );
}
