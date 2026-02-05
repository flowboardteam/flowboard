"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function TalentDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push("/talent/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error || !data) {
        router.push("/talent/login");
        return;
      }

      // Redirect to onboarding if not completed
      if (!data.onboarding_completed) {
        router.push("/talent/onboarding");
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile.full_name}!</h1>
      <p className="text-slate-600">This is your talent dashboard. Here you'll find gigs, AI tools, and analytics.</p>
    </div>
  );
}
