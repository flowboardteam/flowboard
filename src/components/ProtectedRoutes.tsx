import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. No User? Send them to the appropriate login based on URL, or default to talent
      if (!user) {
        const isClientPath = location.pathname.startsWith("/client");
        navigate(isClientPath ? "/client/login" : "/talent/login", { replace: true });
        return;
      }

      // 2. Fetch Profile for Role and Onboarding status
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_type, onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile) {
        // Fallback: If no profile exists yet, they definitely need to login again
        navigate("/talent/login", { replace: true });
        return;
      }

      const role = profile.role_type; // 'talent' | 'client'
      const hasCompleted = profile.onboarding_completed;
      const path = location.pathname;

      // 3. Define the "Guardrails" based on role
      const config = {
        talent: {
          onboarding: "/talent/onboarding",
          dashboard: "/talent/dashboard",
          login: "/talent/login"
        },
        client: {
          onboarding: "/client/onboarding",
          dashboard: "/client/dashboard",
          login: "/client/login"
        }
      }[role as "talent" | "client"];

      // 4. CROSS-ROLE PROTECTION
      // Prevent Talent from seeing Client pages and vice versa
      if (role === "talent" && path.startsWith("/client")) {
        navigate(config.dashboard, { replace: true });
        return;
      }
      if (role === "client" && path.startsWith("/talent")) {
        navigate(config.dashboard, { replace: true });
        return;
      }

      // 5. ONBOARDING LOGIC
      const isOnOnboardingPage = path === config.onboarding;

      // If not completed -> Force them to their specific onboarding
      if (!hasCompleted && !isOnOnboardingPage) {
        navigate(config.onboarding, { replace: true });
        return;
      }

      // If already completed but trying to access onboarding -> Go to dashboard
      if (hasCompleted && isOnOnboardingPage) {
        navigate(config.dashboard, { replace: true });
        return;
      }

      // 6. Safe to show
      setLoading(false);
    };

    checkUser();
  }, [navigate, location.pathname]);

  if (loading) {
    // Dynamic background color based on route
    const isClientPath = location.pathname.startsWith("/client");
    return (
      <div className={`h-screen w-full flex items-center justify-center ${isClientPath ? "bg-[#0A1229]" : "bg-[#050B1E]"}`}>
        <Loader2 className={`w-10 h-10 animate-spin ${isClientPath ? "text-indigo-500" : "text-emerald-500"}`} />
      </div>
    );
  }

  return <>{children}</>;
};