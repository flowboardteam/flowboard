import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Globe,
  ChevronDown,
  X,
  Check
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  // Modals & Popovers
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English (US)");
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Languages list
  const languages = [
    "English (US)",
    "English (UK)",
    "Español (España)",
    "Español (Latinoamérica)",
    "Français",
    "Deutsch",
    "Italiano",
    "Português (Brasil)",
    "日本語",
    "한국어",
    "Nederlands",
  ];

  // Auto-redirect if already signed in
  useEffect(() => {
    const checkActiveSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile to send to proper portal
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_type")
          .eq("id", session.user.id)
          .maybeSingle();

        const role = profile?.role_type || session.user.user_metadata?.role_type || "talent";
        if (role === "client") {
          navigate("/client/dashboard", { replace: true });
        } else {
          navigate("/talent/dashboard", { replace: true });
        }
      }
    };
    checkActiveSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white text-[#37352f] font-sans flex flex-col justify-between selection:bg-violet-100 selection:text-violet-900 [&_h1]:!font-sans [&_h2]:!font-sans [&_h3]:!font-sans [&_h4]:!font-sans [&_h5]:!font-sans [&_h6]:!font-sans">
      {/* Title / Meta */}
      <title>Log in to your Flowboard workspace</title>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[420px] sm:max-w-[440px] flex flex-col items-center text-center mx-auto">
          
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <img
              src="/flowboardlogo.png"
              alt="Flowboard"
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain hover:scale-105 transition-transform"
            />
          </div>

          {/* Heading */}
          <h1
            style={{ fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
            className="!font-sans text-[20px] sm:text-[24px] font-bold text-[#191919] tracking-[-0.02em] text-center leading-tight whitespace-nowrap w-full"
          >
            Log in to your Flowboard workspace
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#787774] font-normal mt-1.5 mb-8 text-center whitespace-nowrap w-full">
            Find opportunities worth pursuing.
          </p>

          {/* Flowboard for Business & Talent Options */}
          <div className="w-full space-y-3.5 mb-6">
            
            {/* Business Card */}
            <div className="w-full p-4 sm:p-5 border border-[#e9e9e8] hover:border-[#d3d3d1] rounded-[8px] bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <div className="mb-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-[15px] font-semibold text-[#191919]">
                    Flowboard for Business
                  </h2>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#f7f7f5] text-[#787774] border border-[#e9e9e8] shrink-0">
                    Client Portal
                  </span>
                </div>
                <p className="text-[12px] text-[#787774] mt-0.5 leading-relaxed">
                  Source, interview, and manage global high-performing teams.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/client/login"
                  className="h-[36px] bg-[#A079FF] hover:bg-[#9165f7] active:bg-[#8050ee] text-white font-medium text-[13px] rounded-[6px] transition-colors flex items-center justify-center shadow-none"
                >
                  Log in
                </Link>
                <Link
                  to="/client/signup"
                  className="h-[36px] bg-white hover:bg-[#f7f7f5] text-[#37352f] border border-[#e9e9e8] hover:border-[#d3d3d1] font-medium text-[13px] rounded-[6px] transition-colors flex items-center justify-center"
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Talent Card */}
            <div className="w-full p-4 sm:p-5 border border-[#e9e9e8] hover:border-[#d3d3d1] rounded-[8px] bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              <div className="mb-3.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="text-[15px] font-semibold text-[#191919]">
                    Flowboard Talent
                  </h2>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[#f7f7f5] text-[#787774] border border-[#e9e9e8] shrink-0">
                    Candidate Portal
                  </span>
                </div>
                <p className="text-[12px] text-[#787774] mt-0.5 leading-relaxed">
                  Access vetted opportunities, AI evaluations, and fast payouts.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/talent/login"
                  className="h-[36px] bg-[#A079FF] hover:bg-[#9165f7] active:bg-[#8050ee] text-white font-medium text-[13px] rounded-[6px] transition-colors flex items-center justify-center shadow-none"
                >
                  Log in
                </Link>
                <Link
                  to="/talent/signup"
                  className="h-[36px] bg-white hover:bg-[#f7f7f5] text-[#37352f] border border-[#e9e9e8] hover:border-[#d3d3d1] font-medium text-[13px] rounded-[6px] transition-colors flex items-center justify-center"
                >
                  Sign up
                </Link>
              </div>
            </div>

          </div>

          {/* Legal disclaimer */}
          <p className="text-[11px] text-[#9b9a97] text-center leading-relaxed max-w-[340px] mx-auto">
            By continuing, you acknowledge that you understand and agree to the{" "}
            <Link to="/terms" className="underline hover:text-[#37352f]">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-[#37352f]">
              Privacy Policy
            </Link>
            .
          </p>

        </div>
      </main>

      {/* Footer (Center language selector + Bottom-right Help question mark) */}
      <footer className="w-full px-6 py-5 flex items-center justify-center relative">
        
        {/* Language selector (Center) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 text-[13px] text-[#787774] hover:text-[#37352f] transition-colors cursor-pointer py-1 px-2 rounded hover:bg-[#f7f7f5]"
          >
            <Globe className="w-4 h-4 text-[#787774]" />
            <span>Language: {selectedLanguage}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#787774] ml-0.5" />
          </button>

          {/* Language Dropdown Popover */}
          {showLanguageMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowLanguageMenu(false)}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white border border-[#e9e9e8] rounded-[8px] shadow-lg py-1.5 z-50 max-h-60 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#9b9a97] uppercase tracking-wider">
                  Select Language
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between hover:bg-[#f7f7f5] transition-colors ${
                      selectedLanguage === lang
                        ? "text-violet-600 font-semibold"
                        : "text-[#37352f]"
                    }`}
                  >
                    <span>{lang}</span>
                    {selectedLanguage === lang && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Help circular ? button (Bottom Right) */}
        <div className="absolute right-6">
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            aria-label="Help and Support"
            className="w-7 h-7 rounded-full border border-[#e3e2e0] text-[#787774] hover:text-[#37352f] hover:bg-[#f7f7f5] flex items-center justify-center text-[13px] font-medium transition-colors cursor-pointer"
          >
            ?
          </button>
        </div>
      </footer>

      {/* --- MODAL: Help & Support --- */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[10px] border border-[#e9e9e8] shadow-2xl max-w-sm w-full p-6 text-left relative">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute right-4 top-4 text-[#787774] hover:text-[#191919]"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-[#191919] mb-3">
              Need help logging in?
            </h3>
            <div className="space-y-3 text-[13px] text-[#787774]">
              <p>
                If you're having trouble accessing your account or workspace, we're here to help.
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  to="/client/forgot-password"
                  className="block p-2.5 rounded-[6px] border border-[#e9e9e8] hover:bg-[#f7f7f5] text-[#191919] font-medium"
                >
                  Reset Business password →
                </Link>
                <Link
                  to="/talent/forgot-password"
                  className="block p-2.5 rounded-[6px] border border-[#e9e9e8] hover:bg-[#f7f7f5] text-[#191919] font-medium"
                >
                  Reset Talent password →
                </Link>
                <Link
                  to="/faq"
                  className="block p-2.5 rounded-[6px] border border-[#e9e9e8] hover:bg-[#f7f7f5] text-[#191919] font-medium"
                >
                  Visit FAQ & Help Center →
                </Link>
                <a
                  href="mailto:support@flowboard.team"
                  className="block p-2.5 rounded-[6px] border border-[#e9e9e8] hover:bg-[#f7f7f5] text-[#191919] font-medium"
                >
                  Email support@flowboard.team →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
