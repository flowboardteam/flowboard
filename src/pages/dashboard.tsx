"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getPlayerData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    getPlayerData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Simple Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-slate-900 tracking-tight">Flowboard-Team</span>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="text-slate-500 hover:text-red-600 transition-colors gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </nav>

      {/* Hero Content */}
      <main className="max-w-4xl mx-auto pt-20 px-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6">
            <LayoutDashboard className="w-8 h-8 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 mb-2">
            Welcome back, {profile?.full_name || "User"}!
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            You are currently logged in as a <span className="text-blue-600 font-bold uppercase">{profile?.user_type}</span>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2 text-slate-900 font-bold">
                <UserIcon className="w-4 h-4" />
                Account Email
              </div>
              <p className="text-slate-600">{user?.email}</p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 mb-2 text-green-900 font-bold">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                System Status
              </div>
              <p className="text-green-700 font-medium">Authentication & RLS Active</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}