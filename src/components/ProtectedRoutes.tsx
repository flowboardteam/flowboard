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

      if (!user) {
        navigate("/talent/login", { replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      const isOnOnboardingPage = location.pathname === "/talent/onboarding";

      // 1. If not completed and NOT on onboarding page -> Go to onboarding
      if (!profile?.onboarding_completed && !isOnOnboardingPage) {
        navigate("/talent/onboarding", { replace: true });
        return;
      }

      // 2. If ALREADY completed but trying to access onboarding -> Go to dashboard
      if (profile?.onboarding_completed && isOnOnboardingPage) {
        navigate("/talent/dashboard", { replace: true });
        return;
      }

      // 3. If we are here, it's safe to show the page
      setLoading(false);
    };

    checkUser();
  }, [navigate, location.pathname]); // Only re-run when path changes

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050B1E]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};