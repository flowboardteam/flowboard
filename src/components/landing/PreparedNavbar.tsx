import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export function PreparedNavbar() {
  return (
    <header className="w-full relative z-50 font-sans border-b border-white/10 bg-transparent">
      {/* Top Banner */}
      <div className="w-full bg-[#fce000] text-center text-xs font-semibold py-2 px-4 shadow-sm z-50 text-black">
          <span className="text-[10px] sm:text-xs font-medium tracking-wide">
            Haraka01 is now part of Flowboard HR Suite. <span className="underline underline-offset-2">Click to learn more.</span>
          </span>
      </div>
      
      {/* Navbar Container */}
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">Flowboard Team</Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 ml-auto mr-10">
          <div className="flex items-center gap-1 cursor-pointer group">
             <Link to="#" className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Platform</Link>
             <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
             <Link to="#" className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Solutions</Link>
             <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
             <Link to="#" className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Resources</Link>
             <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
             <Link to="#" className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Talent Cloud</Link>
             <ChevronDown className="w-4 h-4 text-white/70 group-hover:text-white" />
          </div>
          <div className="flex items-center gap-1 cursor-pointer group">
             <Link to="#" className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Job Board</Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="px-5 py-2 text-sm font-medium text-white border border-white/30 hover:border-white/60 rounded-none transition-colors">Login</button>
          <button className="px-5 py-2 text-sm font-medium bg-[#111] border border-[#111] text-white rounded-none hover:bg-black transition-all">Request Demo</button>
        </div>

      </nav>
    </header>
  );
}
