"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TalentDashboard } from "./components/TalentDashboard";
import { RecruiterDashboard } from "./components/RecruiterDashboard";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    fetchUser();
  }, []);

  if (!profile) return null;

  return (
    <div className="p-8">
      {profile.role_type === "talent" ? (
        <TalentDashboard profile={profile} />
      ) : (
        <RecruiterDashboard profile={profile} />
      )}
    </div>
  );
}