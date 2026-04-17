import { Link } from "react-router-dom";
import { PreparedBackgroundGrid } from "./PreparedBackgroundGrid";

export function PreparedFooter() {
  return (
    <footer className="w-full bg-[#353733] border-t border-white/10 text-white relative z-20 overflow-hidden">
      {/* Structural Grid lines drawn under content */}
      <PreparedBackgroundGrid />
      
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 pb-8 flex flex-col relative z-20">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">
          
          {/* Brand Col */}
          <div className="lg:col-span-4 flex flex-col items-start pr-8 border-r border-white/5">
            <Link to="/" className="text-3xl font-bold tracking-tight text-white mb-6">Flowboard Team</Link>
            <p className="text-lg font-light leading-snug text-white/90">
              Everything you need to get hire and manage your workforce
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1 */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">PLATFORM</span>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Applicant Tracking</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Talent Cloud</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Project Manager</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Global Payroll</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Integrations</Link>
              
              <div className="mt-8 flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">USE CASES</span>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Startup Scaling</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Enterprise Hiring</Link>
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">FOR COMPANIES</span>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Hire Engineers</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Build Remote Teams</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Pricing</Link>
              
              <div className="mt-16 pt-3 flex flex-col gap-3">
                <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">FOR TALENT</span>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Browse Jobs</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Developer Community</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Career Resources</Link>
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">RESOURCES</span>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Case Studies</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Blog</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Webinars</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Events</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Videos</Link>
              <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">News</Link>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col flex-1 relative">
              <div className="flex flex-col gap-3 mb-10">
                <span className="text-[10px] font-bold tracking-widest text-[#a6abad] mb-2 uppercase">ABOUT</span>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Company</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Careers</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Contact</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Trust</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Support</Link>
                <Link to="#" className="text-sm font-medium hover:text-white/70 transition-colors">Press</Link>
              </div>
              <div className="flex flex-col gap-4 mt-auto absolute bottom-0 right-0 w-full">
                <button className="w-full py-3 border border-white/40 hover:border-white text-white text-sm font-medium rounded-none transition-colors text-center">Login</button>
                <button className="w-full py-3 bg-[#f5f4ef] hover:bg-white text-[#111] text-sm font-semibold rounded-none transition-colors text-center shadow-lg">Get Demo</button>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs font-semibold text-[#a6abad]">
          <div className="font-mono">
            © 2026 Flowboard Team, Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6 mt-4 md:mt-0 font-mono">
            <Link to="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookies Settings</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
