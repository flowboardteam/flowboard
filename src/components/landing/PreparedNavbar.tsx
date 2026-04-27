import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronDown, ChevronRight, User, LogIn, UserPlus, CreditCard, 
  Layers, Globe, CheckCircle2, DollarSign, Building2, BriefcaseBusiness, Globe2, 
  TrendingUp, ShieldCheck, Presentation, FileText, Video, Rss 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PreparedNavbar() {
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isDropdownActive = activeMegaMenu !== null || isAuthDropdownOpen;
  const isSubpage = location.pathname !== '/';
  const isLightMode = isDropdownActive || isSubpage;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header 
      className={`w-full relative z-[100] font-sans border-b transition-colors duration-300 ${isLightMode ? "border-gray-300 bg-[#FCFBF9]" : "border-white/10 bg-transparent"}`} 
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      {/* Top Banner */}
      <div className="w-full bg-[#fce000] text-center text-xs font-semibold py-2 px-4 shadow-sm z-[110] text-[#111]">
          <span className="text-[10px] sm:text-xs font-medium tracking-wide">
            Haraka01 is now part of Flowboard HR Suite. Click to <span className="font-bold underline underline-offset-2">learn more.</span>
          </span>
      </div>
      
      {/* Navbar Container */}
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between relative z-[100]">
        
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <Link to="/" className={`text-[28px] font-bold tracking-tight transition-colors duration-300 ${isLightMode ? "text-[#111]" : "text-white"}`}>Flowboard</Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex h-full items-center gap-8 ml-auto mr-10">
          <div 
            className="flex items-center gap-1 cursor-pointer group h-full px-2"
            onMouseEnter={() => setActiveMegaMenu("platform")}
          >
             <span className={`text-[15px] font-medium transition-colors duration-300 ${isLightMode ? "text-[#111]/80 group-hover:text-[#111]" : "text-white/80 group-hover:text-white"}`}>Platform</span>
             <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLightMode ? (activeMegaMenu === "platform" ? "text-[#111] -rotate-180" : "text-[#111]/60 group-hover:text-[#111]") : "text-white/60 group-hover:text-white"}`} />
          </div>
          <div 
            className="flex items-center gap-1 cursor-pointer group h-full px-2"
            onMouseEnter={() => setActiveMegaMenu("solutions")}
          >
             <span className={`text-[15px] font-medium transition-colors duration-300 ${isLightMode ? "text-[#111]/80 group-hover:text-[#111]" : "text-white/80 group-hover:text-white"}`}>Solutions</span>
             <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLightMode ? (activeMegaMenu === "solutions" ? "text-[#111] -rotate-180" : "text-[#111]/60 group-hover:text-[#111]") : "text-white/60 group-hover:text-white"}`} />
          </div>
          <div 
            className="flex items-center gap-1 cursor-pointer group h-full px-2"
            onMouseEnter={() => setActiveMegaMenu("resources")}
          >
             <span className={`text-[15px] font-medium transition-colors duration-300 ${isLightMode ? "text-[#111]/80 group-hover:text-[#111]" : "text-white/80 group-hover:text-white"}`}>Resources</span>
             <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLightMode ? (activeMegaMenu === "resources" ? "text-[#111] -rotate-180" : "text-[#111]/60 group-hover:text-[#111]") : "text-white/60 group-hover:text-white"}`} />
          </div>
          <div 
            className="flex items-center gap-1 cursor-pointer group h-full px-2"
            onMouseEnter={() => setActiveMegaMenu(null)}
          >
             <Link to="/careers/open-positions" className={`text-[15px] font-medium transition-colors duration-300 ${isLightMode ? "text-[#111]/80 group-hover:text-[#111]" : "text-white/80 group-hover:text-white"}`}>Job Board</Link>
          </div>
          <div 
            className="flex items-center gap-1 cursor-pointer group h-full px-2"
            onMouseEnter={() => setActiveMegaMenu(null)}
          >
             <Link to="/client/signup" className={`text-[15px] font-medium transition-colors duration-300 ${isLightMode ? "text-[#111]/80 group-hover:text-[#111]" : "text-white/80 group-hover:text-white"}`}>Talent Cloud</Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4 relative" ref={authDropdownRef}>
          <button 
            onClick={() => { setIsAuthDropdownOpen(!isAuthDropdownOpen); setActiveMegaMenu(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 text-[15px] font-medium rounded-none transition-all duration-300 ${isLightMode ? "bg-[#111] border border-[#111] text-white hover:bg-black" : "bg-[#111] border border-[#111] text-white hover:bg-black"}`}
          >
            Account <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAuthDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Auth Dropdown */}
          <AnimatePresence>
            {isAuthDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-[0px] top-[calc(100%+0.5rem)] w-72 bg-[#FCFBF9] rounded-none shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-[#E5E5E5] p-6 overflow-hidden z-[100]"
              >
                <div className="space-y-8">
                  <div>
                    <p className="text-[11px] font-mono tracking-widest text-[#666] mb-4 uppercase">
                      Clients
                    </p>
                    <div className="space-y-1">
                      <AuthLink label="Client Login" icon={LogIn} onClick={() => { setIsAuthDropdownOpen(false); navigate("/client/login"); }} />
                      <AuthLink label="Hire Talent" icon={UserPlus} onClick={() => { setIsAuthDropdownOpen(false); navigate("/client/signup"); }} />
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-mono tracking-widest text-[#666] mb-4 uppercase">
                      Talent
                    </p>
                    <div className="space-y-1">
                      <AuthLink label="Talent Login" icon={LogIn} onClick={() => { setIsAuthDropdownOpen(false); navigate("/talent/login"); }} />
                      <AuthLink label="Join Talent Cloud" icon={UserPlus} onClick={() => { setIsAuthDropdownOpen(false); navigate("/talent/signup"); }} />
                      <AuthLink label="Flowboard Pay" icon={CreditCard} onClick={() => { setIsAuthDropdownOpen(false); navigate("/talent/pay"); }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mega Menus Base Background (Light Theme matching screenshot perfectly) */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, transition: { duration: 0.15 } }}
            className="absolute left-0 top-full w-full bg-[#FCFBF9] shadow-[0_30px_60px_rgba(0,0,0,0.08)] z-[90] overflow-hidden border-t border-b border-gray-300"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")' }}
          >
            <div className="max-w-[1440px] mx-auto grid grid-cols-12 min-h-[480px]">
              
              {/* PLATFORM MENU */}
              {activeMegaMenu === "platform" && (
                <>
                  <div className="col-span-3 border-r border-gray-300 p-12 pr-10 flex flex-col pt-14">
                    <span className="text-[12px] font-mono tracking-widest text-[#555] mb-6 uppercase">THE PLATFORM</span>
                    <h2 className="text-[40px] font-medium tracking-tight text-[#111] mb-4 leading-[1.1]">Unified HR Suite</h2>
                    <p className="text-[#555] leading-relaxed text-[15px]">
                      One system, one screen, every phase of the talent lifecycle—custom-tailored for scale.
                    </p>
                  </div>
                  <div className="col-span-9 p-14 pl-16 grid grid-cols-2 gap-x-20 gap-y-14">
                    <div className="col-span-2 mb-[-2rem]">
                      <span className="text-[12px] font-mono tracking-widest text-[#555] uppercase">END-TO-END</span>
                    </div>
                    <MegaMenuItem 
                      to="/platform/applicant-tracking"
                      icon={Layers} 
                      title="Applicant Tracking" 
                      desc="Reduce the burden of application volume, flow streamline parsing pipelines, and eliminate data backlogs." 
                    />
                    <MegaMenuItem 
                      to="/platform/quality-assurance"
                      icon={CheckCircle2} 
                      title="Quality Assurance" 
                      desc="Evaluate performance metrics in real-time across your teams to develop staff faster and retain more top personnel." 
                    />
                    <MegaMenuItem 
                      to="/platform/global-talent-cloud"
                      icon={Globe} 
                      title="Global Talent Cloud" 
                      desc="Effortlessly monitor every region and sourcing group to ensure you have the talent pipeline you need, when you need it." 
                    />
                    <MegaMenuItem 
                      to="/platform/global-payroll"
                      icon={DollarSign} 
                      title="Global Payroll" 
                      desc="Faster, multi-currency compensation via streamlined payroll generation and localized compliance tracking." 
                    />
                  </div>
                </>
              )}

              {/* SOLUTIONS MENU */}
              {activeMegaMenu === "solutions" && (
                <>
                  <div className="col-span-3 border-r border-gray-300 p-12 pr-10 flex flex-col pt-14">
                    <span className="text-[12px] font-mono tracking-widest text-[#555] mb-6 uppercase">WE WORK WITH</span>
                    <div className="flex flex-col gap-5">
                      <Link to="/solutions/startups" className="text-[32px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Startups</Link>
                      <Link to="/solutions/enterprises" className="text-[32px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Enterprises</Link>
                      <Link to="/solutions/remote-teams" className="text-[32px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Remote Teams</Link>
                    </div>
                  </div>
                  <div className="col-span-9 p-14 pl-16">
                    <span className="text-[12px] font-mono tracking-widest text-[#555] mb-8 block uppercase">USE CASES</span>
                    <div className="grid grid-cols-2 gap-x-20 gap-y-16 mt-6">
                      <MegaMenuItem 
                        to="/solutions/intelligent-sourcing"
                        icon={Globe2} 
                        title="Intelligent Sourcing" 
                        desc="Eliminate geographical barriers to get every hiring manager the talent they need, faster than ever before." 
                      />
                      <MegaMenuItem 
                        to="/solutions/performance-tracking"
                        icon={Presentation} 
                        title="Performance Tracking & Labeling" 
                        desc="Rapidly improve performance and morale with real-time visibility into every KPI and deliverable." 
                      />
                      <MegaMenuItem 
                        to="/solutions/compliance-automation"
                        icon={ShieldCheck} 
                        title="Compliance Automation" 
                        desc="Next-generation automation empowers you to meet regulatory standards wherever your team works, gaining a new level of operational clarity." 
                      />
                    </div>
                  </div>
                </>
              )}

              {/* RESOURCES MENU */}
              {activeMegaMenu === "resources" && (
                <>
                  <div className="col-span-3 border-r border-gray-300 p-12 pr-10 flex flex-col pt-14">
                    <span className="text-[12px] font-mono tracking-widest text-[#555] mb-6 uppercase">LEARN MORE</span>
                    <div className="flex flex-col gap-5">
                      <Link to="/resources/hub" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">News</Link>
                      <Link to="/resources/hub" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Events</Link>
                      <Link to="/resources/hub" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Help Center</Link>
                      <Link to="/resources/hub" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Flowboard Resource Hub</Link>
                      <Link to="/resources/hub" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Partner Program</Link>
                      <Link to="/careers/open-positions" className="text-[20px] font-normal tracking-tight text-[#111] hover:text-[#555] transition-colors">Careers</Link>
                    </div>
                  </div>
                  <div className="col-span-9 p-14 pl-16">
                    <span className="text-[12px] font-mono tracking-widest text-[#555] mb-8 block uppercase">FEATURED</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <ResourceCard 
                        to="/resources/news"
                        category="News"
                        title="Flowboard releases next-generation Project Manager suite"
                        gradient="from-[#111] to-[#1a1a1a]"
                        textColor="text-white"
                        tagColor="text-white/80"
                        imgBg="bg-[#1a1a1a]"
                      />
                      <ResourceCard 
                        to="/resources/news"
                        category="News"
                        title="Localized Compliance Automation Engine Now Live"
                        gradient="from-[#fce000] to-[#fce000]"
                        textColor="text-[#111]"
                        tagColor="text-[#111]/80"
                        imgBg="bg-[#cca300]"
                      />
                    </div>
                  </div>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}

function MegaMenuItem({ icon: Icon, title, desc, to }: { icon: any; title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="flex flex-col gap-3 group cursor-pointer">
      <h3 className="text-[28px] font-normal tracking-tight text-[#111] group-hover:text-[#444] transition-colors">{title}</h3>
      <p className="text-[#555] text-[15px] leading-relaxed max-w-sm">{desc}</p>
      <div className="mt-4 flex items-center justify-start group-hover:transform group-hover:-translate-y-1 transition-all">
        <Icon className="w-8 h-8 text-[#111] opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
      </div>
    </Link>
  );
}

function ResourceCard({ category, title, gradient, to, textColor = "text-white", tagColor = "text-white/80", imgBg = "bg-[#1D1E20]" }: { category: string; title: string; gradient: string; to: string; textColor?: string; tagColor?: string; imgBg?: string }) {
  return (
    <Link to={to} className="flex flex-col h-[280px] rounded-sm overflow-hidden group cursor-pointer border border-[#E5E5E5] hover:border-gray-400 transition-all shadow-sm hover:shadow-md">
      <div className={`h-[140px] w-full relative flex items-center justify-center ${imgBg}`}>
        <div className={`absolute inset-0 opacity-40 bg-gradient-to-t ${gradient}`}></div>
        <div className={`relative z-10 opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700 font-black ${textColor} text-3xl tracking-tighter`}>
            FLOWBOARD
        </div>
      </div>
      <div className={`flex-1 p-6 flex flex-col justify-end bg-gradient-to-b ${gradient}`}>
        <span className={`text-[11px] font-mono tracking-widest ${tagColor} mb-2 uppercase`}>{category}</span>
        <h4 className={`text-[20px] font-medium ${textColor} leading-[1.2] tracking-tight`}>{title}</h4>
      </div>
    </Link>
  );
}

function AuthLink({ label, icon: Icon, onClick }: { label: string; icon: any; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-none hover:bg-black/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-black/5 flex items-center justify-center group-hover:bg-[#111] group-hover:text-white text-[#555] transition-all border border-[#111]/10 group-hover:border-[#111]">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[14px] font-medium text-[#111] group-hover:text-[#111] transition-colors">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-[#aaa] group-hover:text-[#111] transition-all" />
    </button>
  );
}
