import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * AuthCallback
 *
 * Handles both:
 *  - OAuth PKCE code exchange  (URL contains ?code=...)
 *  - Magic link / implicit token (URL contains #access_token=...)
 *
 * Strategy:
 *  1. If there is a `code` query param, call exchangeCodeForSession() which
 *     performs the PKCE exchange and resolves the session.
 *  2. Otherwise fall back to listening for the INITIAL_SESSION event via
 *     onAuthStateChange, which fires once Supabase detects the hash fragment.
 *  3. After a resolved session, redirect to the intended destination.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        // ── Step 1: PKCE code exchange ──────────────────────────────────────
        const code = searchParams.get("code");

        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;

          if (!cancelled && data.session) {
            redirectAfterAuth(data.session.user?.user_metadata?.role_type);
          }
          return;
        }

        // ── Step 2: Implicit / hash-based token ─────────────────────────────
        // The Supabase client processes the #access_token hash automatically.
        // We listen for the event and redirect once it's settled.
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (cancelled) return;
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            subscription.unsubscribe();
            if (session) {
              redirectAfterAuth(session.user?.user_metadata?.role_type);
            } else {
              // No session after callback — send to login
              navigate("/client/login", { replace: true });
            }
          }
        });

        // Safety timeout: if nothing fires in 8 s, check session directly
        const timer = setTimeout(async () => {
          if (cancelled) return;
          subscription.unsubscribe();
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            redirectAfterAuth(session.user?.user_metadata?.role_type);
          } else {
            navigate("/client/login", { replace: true });
          }
        }, 8000);

        // Clean up on unmount
        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("[AuthCallback] Error:", err);
        if (!cancelled) setError(err.message || "Authentication failed");
      }
    };

    const redirectAfterAuth = (roleFromMeta?: string) => {
      // 1. Honour explicit ?redirect= param (set by both login pages)
      const redirectParam = searchParams.get("redirect");
      if (redirectParam && redirectParam !== "/" && redirectParam !== "/login") {
        navigate(redirectParam, { replace: true });
        return;
      }

      // 2. Honour intended_role stored before OAuth redirect
      const intendedRole = localStorage.getItem("intended_role");
      const role = intendedRole || roleFromMeta || "talent";
      localStorage.removeItem("intended_role");

      // 3. Check for a pending invite token
      const pendingToken = localStorage.getItem("pendingInviteToken");
      if (pendingToken) {
        navigate(`/invite/${pendingToken}`, { replace: true });
        return;
      }

      // 4. Route by role
      if (role === "client") {
        navigate("/client/dashboard", { replace: true });
      } else {
        navigate("/talent/dashboard", { replace: true });
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, []); // run once on mount

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 gap-4">
        <p className="text-red-400 font-bold text-center max-w-sm">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/client/login", { replace: true })}
            className="px-5 py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-all"
          >
            Client Login
          </button>
          <button
            onClick={() => navigate("/talent/login", { replace: true })}
            className="px-5 py-2 bg-slate-700 rounded-lg text-sm font-bold hover:bg-slate-600 transition-all"
          >
            Talent Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050B1E] text-white gap-3">
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      <p className="text-sm font-medium text-slate-300">Completing sign in…</p>
    </div>
  );
}
