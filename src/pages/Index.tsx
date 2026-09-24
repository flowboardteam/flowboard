import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  Globe,
  ChevronDown,
  X,
  Check
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

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

  // Auto-redirect if already signed in with Clerk
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = user.unsafeMetadata?.role || user.publicMetadata?.role;
      if (role === "client") {
        navigate("/client/dashboard", { replace: true });
      } else {
        navigate("/talent/dashboard", { replace: true });
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);

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
            Choose your account portal to continue.
          </p>

          {/* Flowboard for Business & Talent Options */}
          <div className="w-full space-y-3.5 mb-6">
            
            {/* Business Card */}
            <div className="w-full p-4 sm:p-5 border border-[#e9e9e8] hover:border-[#d3d3d1] rounded-[8px] bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left">
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
            <div className="w-full p-4 sm:p-5 border border-[#e9e9e8] hover:border-[#d3d3d1] rounded-[8px] bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left">
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

          <div className="flex items-center gap-4 text-xs text-[#787774]">
            <a href="/terms" className="hover:underline">Terms of Use</a>
            <span>•</span>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e9e9e8] py-4 px-6 flex items-center justify-between text-xs text-[#787774]">
        <span>© {new Date().getFullYear()} Flowboard Inc.</span>
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-1.5 hover:text-[#191919] transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{selectedLanguage}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </footer>
    </div>
  );
}
