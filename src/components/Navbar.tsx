import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User } from "lucide-react";

interface NavbarProps {
  heroHeight?: number; // height of HeroSection to check scroll
}

export function Navbar({ heroHeight = 700 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOverHero, setIsOverHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      setIsOverHero(scrollY < heroHeight); // true if over hero
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [heroHeight]);

  const textColor = "text-foreground";
const iconColor = "text-foreground";

const bgClass = isScrolled
  ? "backdrop-blur-md bg-white/70 shadow-md"
  : "bg-white/60 backdrop-blur-sm";


  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass} border-b border-border/40`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 lg:py-5">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png" // leading slash points to public folder
                  alt="FlowBoard Logo"
                  className="w-8 h-8 object-contain" // scale nicely inside container
                />
              </div>
              <span className={`text-xl font-bold ${textColor}`}>
                FlowBoard
              </span>
            </a>
            <div className="hidden lg:block w-px h-6 bg-gray-300"></div>
            <div className="hidden lg:flex items-center gap-6">
              {[
                "Talent",
                "Companies",
                "How It Works",
                "Case Studies",
                "Pricing",
              ].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`relative text-sm font-medium transition-colors after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[2px] after:bg-foreground after:transition-all
                             hover:after:w-full ${textColor}`}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Search, Profile, CTA */}
          <div className="hidden lg:flex items-center gap-4 relative">
            <div className="relative">
              {isSearchOpen ? (
                <div className="absolute right-0 top-0 flex items-center border border-gray-300 rounded-lg shadow-md bg-white overflow-hidden transition-all">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 py-2 px-4 focus:outline-none"
                  />
                  <button
                    className="p-2 border-l border-gray-300 hover:bg-gray-100 transition"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              ) : (
                <button
                  className={`p-2 rounded-full hover:bg-gray-100 transition ${iconColor}`}
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className={`w-5 h-5 ${iconColor}`} />
                </button>
              )}
            </div>

            <button
              className={`p-2 rounded-full hover:bg-gray-100 transition ${iconColor}`}
            >
              <User className={`w-5 h-5 ${iconColor}`} />
            </button>

            <Button
              variant="gradient"
              size="sm"
              className="px-6 py-2 hover:scale-105 transition-transform"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 ${iconColor}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`lg:hidden mt-2 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 p-4">
            {[
              "Talent",
              "Companies",
              "How It Works",
              "Case Studies",
              "Pricing",
            ].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-base font-medium text-foreground hover:text-primary-500 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <Search className="w-5 h-5 text-foreground" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <User className="w-5 h-5 text-foreground" />
              </button>
              <Button variant="gradient" className="flex-1 py-2">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
