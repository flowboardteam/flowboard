"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface NavbarProps {
  heroHeight?: number;
}

export function Navbar({ heroHeight = 700 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for active session safely
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    
    checkUser();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setIsOverHero(scrollY < heroHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroHeight]);

  // Logic-based navigation without useRouter hooks
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const handleProfileClick = () => {
    if (user) {
      navigateTo("/dashboard");
    } else {
      navigateTo("/login");
    }
  };

  /* ================= STYLES ================= */
  const navBgClass = isOverHero
    ? "bg-transparent"
    : "bg-white/80 backdrop-blur-md shadow-md border-b border-border/40";

  const textColor = isOverHero ? "text-white" : "text-slate-900";
  const iconColor = isOverHero ? "text-white" : "text-slate-700";
  const hoverBg = isOverHero ? "hover:bg-white/10" : "hover:bg-gray-100";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-5">
          
          {/* LEFT */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="FlowBoard Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className={`text-xl font-bold hidden lg:block ${textColor}`}>
                Flowboard Team
              </span>
            </a>

            <div className={`hidden lg:block w-px h-6 ${isOverHero ? "bg-white/30" : "bg-gray-300"}`} />

            <div className="hidden lg:flex items-center gap-6">
              {["Talent Cloud", "Companies", "How It Works", "Pricing"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative text-sm font-medium ${textColor} transition-colors after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-current after:transition-all hover:after:w-full`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden lg:flex items-center gap-4 relative">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-0 flex items-center rounded-lg shadow-lg bg-white overflow-hidden">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 py-2 px-4 focus:outline-none text-slate-900"
                    autoFocus
                  />
                  <button className="p-2 border-l hover:bg-gray-100" onClick={() => setIsSearchOpen(false)}>
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className={`p-2 rounded-full ${hoverBg} transition`}>
                  <Search className={`w-5 h-5 ${iconColor}`} />
                </button>
              )}
            </div>

            {/* Profile */}
            <button 
              onClick={handleProfileClick}
              className={`p-2 rounded-full ${hoverBg} transition relative`}
            >
              <User className={`w-5 h-5 ${iconColor}`} />
              {user && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 border-2 border-white rounded-full" />
              )}
            </button>

            {/* CTA */}
            <Button
              onClick={() => navigateTo("/signup")}
              size="sm"
              className={`px-6 py-2 font-semibold rounded-sm transition-all ${
                isOverHero
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Get Started
            </Button>
          </div>

          {/* MOBILE TOGGLE */}
          <button className={`lg:hidden p-2 ${iconColor}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 space-y-4">
            {["Talent Cloud", "Companies", "How It Works", "Pricing"].map((label) => (
              <a key={label} href="#" className="block text-slate-800 font-medium py-1" onClick={() => setIsMobileMenuOpen(false)}>
                {label}
              </a>
            ))}
            <div className="pt-2 border-t flex flex-col gap-2">
              <Button onClick={handleProfileClick} variant="outline" className="w-full justify-start gap-2 text-slate-700">
                <User className="w-4 h-4" /> {user ? "Dashboard" : "Login"}
              </Button>
              <Button onClick={() => navigateTo("/signup")} className="w-full bg-blue-600 text-white rounded-sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}