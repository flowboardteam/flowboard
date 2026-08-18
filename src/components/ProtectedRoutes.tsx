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
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      // 1. No User? Send them to the appropriate login based on origin
      if (!user) {
        const isClientPath = location.pathname.startsWith("/client");
        navigate(isClientPath ? "/client/login" : "/talent/login", { replace: true });
        return;
      }

      // Check for pending invitation redirect first
      const pendingInviteToken = localStorage.getItem("pendingInviteToken");
      if (pendingInviteToken && !location.pathname.startsWith("/invite/")) {
        navigate(`/invite/${pendingInviteToken}`, { replace: true });
        return;
      }

      // 2. Fetch Profile for Role and Onboarding status
      let { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role_type, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileErr) {
        console.warn("[ProtectedRoutes] Profile query warning:", profileErr.message);
      }

      // --- SOCIAL LOGIN ROLE CORRECTION & METADATA FALLBACK ---
      const intendedRole = localStorage.getItem("intended_role");
      const userMetaRole = user.user_metadata?.role_type || intendedRole || "talent";

      if (!profile) {
        // If profile row doesn't exist yet, attempt to create basic profile row
        const metaOnboarding = user.user_metadata?.onboarding_completed || false;
        profile = {
          role_type: userMetaRole,
          onboarding_completed: metaOnboarding
        };
        
        await supabase.from("profiles").upsert({
          id: user.id,
          role_type: userMetaRole,
          onboarding_completed: metaOnboarding,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          updated_at: new Date().toISOString()
        }, { onConflict: "id" });
      } else if (!profile.onboarding_completed && intendedRole && profile.role_type !== intendedRole) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ role_type: intendedRole })
          .eq("id", user.id);
        
        if (!updateError) {
          profile.role_type = intendedRole;
        }
        localStorage.removeItem("intended_role");
      }

      const role = profile.role_type || userMetaRole; // 'talent' | 'client'
      const hasCompleted = Boolean(
        profile.onboarding_completed || 
        user.user_metadata?.onboarding_completed || 
        localStorage.getItem(`onboarding_completed_${user.id}`) === "true"
      );
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

      if (!config) {
        console.warn("User has no valid role config:", role);
        setLoading(false);
        return;
      }

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

      // If not completed -> Force them to their specific onboarding (except if they are visiting an invite link)
      if (!hasCompleted && !isOnOnboardingPage && !path.startsWith("/invite/")) {
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

    const checkUserWithTimeout = async () => {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Auth timeout")), 10000)
      );

      try {
        await Promise.race([checkUser(), timeoutPromise]);
      } catch (err) {
        console.error("Auth check failed or timed out:", err);
        setLoading(false); // Let the children handle the missing state or show an error
      }
    };

    checkUserWithTimeout();
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