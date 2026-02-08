"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Search,
  User,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  UserPlus,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  heroHeight?: number;
}

export function Navbar({ heroHeight = 700 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "My";

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setIsOverHero(scrollY < heroHeight);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [heroHeight]);

  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const textColor = isOverHero ? "text-white" : "text-slate-900";
  const iconColor = isOverHero ? "text-white" : "text-slate-700";
  const hoverBg = isOverHero ? "hover:bg-white/10" : "hover:bg-gray-100";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isOverHero
          ? "bg-transparent"
          : "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-5">
          {/* LEFT: Logo & Nav */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Hamburger Icon for Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl ${hoverBg} transition-colors`}
            >
              {isMobileMenuOpen ? (
                <X className={iconColor} />
              ) : (
                <Menu className={iconColor} />
              )}
            </button>

            <a href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                <img
                  src="/flowboardlogo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span
                className={`text-xl font-black tracking-tighter hidden md:block ${textColor}`}
              >
                Flowboard
              </span>
            </a>

            <div
              className={`hidden lg:block w-px h-6 ${isOverHero ? "bg-white/20" : "bg-gray-200"}`}
            />

            <div className="hidden lg:flex items-center gap-6">
              {["Talent Cloud", "Job Board", "Pricing"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`text-xs font-black uppercase tracking-widest ${textColor} opacity-70 hover:opacity-100 transition-all`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Search & Auth Dropdown */}
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2.5 rounded-full ${hoverBg} transition hidden sm:block`}
            >
              <Search className={`w-5 h-5 ${iconColor}`} />
            </button>

            <button
              onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
              className={`flex items-center gap-2 p-1.5 pl-3 rounded-full border transition-all ${
                isOverHero
                  ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">
                {user ? "Account" : "Join Network"}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <User className="w-4 h-4" />
              </div>
            </button>

            {/* SEGMENTED DROPDOWN (Desktop) */}
            <AnimatePresence>
              {isAuthDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 overflow-hidden"
                >
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        Clients
                      </p>
                      <div className="space-y-1">
                        <AuthLink
                          label="Client Login"
                          icon={LogIn}
                          onClick={() => navigateTo("/client/login")}
                        />
                        <AuthLink
                          label="Hire Talent"
                          icon={UserPlus}
                          onClick={() => navigateTo("/client/signup")}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                        Talent
                      </p>
                      <div className="space-y-1">
                        <AuthLink
                          label="Talent Login"
                          icon={LogIn}
                          onClick={() => navigateTo("/talent/login")}
                        />
                        <AuthLink
                          label="Join Talent Cloud"
                          icon={UserPlus}
                          onClick={() => navigateTo("/talent/signup")}
                        />
                        <AuthLink
                          label="Flowboard Pay"
                          icon={CreditCard}
                          onClick={() => navigateTo("/talent/pay")}
                        />
                      </div>
                    </div>

                    {user && (
                      <div className="pt-4 border-t border-slate-100">
                        <AuthLink
                          label={`${firstName}'s Profile`} // Dynamically shows "Oscar's Profile"
                          icon={User} // Changed from LayoutDashboard to User for a "Profile" feel
                          onClick={() => navigateTo("/talent/dashboard")}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* MOBILE MENU (Links ONLY) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
            >
              <div className="py-6 flex flex-col gap-4">
                {["Talent Cloud", "Job Board", "Pricing"].map((label) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-bold text-slate-900 px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function AuthLink({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-all" />
    </button>
  );
}
