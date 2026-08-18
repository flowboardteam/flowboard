import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        const redirect = searchParams.get("redirect");
        const intendedRole = localStorage.getItem("intended_role");

        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        if (session) {
          const role = intendedRole || session.user?.user_metadata?.role;
          if (role === "client") {
            navigate("/client/dashboard", { replace: true });
          } else {
            navigate("/talent/dashboard", { replace: true });
          }
        } else {
          navigate("/talent/login", { replace: true });
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <p className="text-red-400 font-bold mb-4">{error}</p>
        <button
          onClick={() => navigate("/talent/login", { replace: true })}
          className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050B1E] text-white">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-300">Completing sign in...</p>
    </div>
  );
}
