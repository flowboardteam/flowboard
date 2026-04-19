import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  FileText,
  Globe,
  Github,
  Linkedin,
  Mail,
  Calendar,
  Award,
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Star,
  ExternalLink,
  Download,
  Languages,
  Building2,
  Menu,
  X,
  Sparkles,
  Link2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import NotFound from "./NotFound";
import { useToast } from "@/components/ui/use-toast";

interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  role_type: string;
  avatar_url: string | null;
  location: string | null;
  primary_role: string | null;
  experience_level: string | null;
  resume_url: string | null;
  languages: string[];
  username: string | null;
  bio: string | null;
  timezone: string | null;
  current_company: string | null;
  employment_status: string | null;
  skills: string[];
  tools: string[];
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  profile_completion: number;
  is_visible: boolean;
  created_at: string;
}

export function TalentPublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [talent, setTalent] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (username && !username.startsWith("@")) {
    return <NotFound />;
  }
  const [showHireModal, setShowHireModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setCurrentUser(profile);
      }
    };

    getSession();
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(false);

      let identifier = username?.trim() || "";
      if (identifier.startsWith("@")) {
        identifier = identifier.substring(1);
      }

      if (!identifier) throw new Error("Invalid username");

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role_type", "talent")
        .eq("is_visible", true);

      if (isUuid) {
        query = query.eq("id", identifier);
      } else {
        query = query.eq("username", identifier);
      }

      const { data, error: sbError } = await query.single();

      if (sbError || !data) throw new Error("Profile not found");

      setTalent(data as TalentProfile);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleHireSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You need to be logged in to reach out to talent.",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);

    try {
      setSending(true);
      const { error } = await supabase.from("hire_inquiries").insert({
        talent_id: talent.id,
        client_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_email: currentUser.email,
        message: formData.get("message"),
      });

      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: talent.id,
        title: "New Project Inquiry! 📬",
        message: `${currentUser.full_name} wants to discuss a project with you.`,
        type: 'inquiry'
      });

      toast({
        title: "Inquiry Sent! 🚀",
        description: `We've signaled ${talent.full_name.split(" ")[0]}. You'll hear back soon!`,
      });

      setShowHireModal(false);
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Transmission Error",
        description: err.message || "We couldn't deliver your message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const formatExternalLink = (url: string | null) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] font-jakarta">
        <div className="text-center space-y-4">
           <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] font-jakarta">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto bg-red-50 rounded-3xl flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-4xl font-black text-[#1A1C21] tracking-tighter uppercase">Profile Not Found</h2>
          <p className="text-slate-500 font-bold">We couldn't locate this talent profile. Please check the URL and try again.</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-3 px-8 py-4 bg-[#1A1C21] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] font-jakarta text-[#1A1C21] selection:bg-emerald-500/10">
      {/* NAVIGATION HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-[#EEEEF0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-[#1A1C21] transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-black text-[10px] uppercase tracking-widest">Back</span>
              </button>
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-[#1A1C21] uppercase tracking-[0.2em]">Flowboard</span>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Talent Profile</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {talent?.resume_url && (
                <a href={talent.resume_url} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 px-6 py-2.5 text-slate-400 hover:text-[#1A1C21] font-black uppercase tracking-widest text-[10px] transition-colors">
                  <Download className="w-4 h-4" /> Download CV
                </a>
              )}
              <button onClick={() => setShowHireModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#1A1C21] text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl shadow-slate-900/10">
                <Mail className="w-4 h-4" /> Contact
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-8">
            {/* MAIN PROFILE CARD */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EEEEF0] overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600">
                <div className="absolute inset-0 bg-black/5 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
              </div>

              <div className="relative px-8 pb-8 text-center sm:text-left">
                <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
                   <div className="relative group">
                     <div className="w-32 h-32 rounded-[28px] overflow-hidden bg-white shadow-2xl border-4 border-white">
                        {talent.avatar_url ? (
                          <img src={talent.avatar_url} className="w-full h-full object-cover" alt={talent.full_name} />
                        ) : (
                          <div className="w-full h-full bg-[#1A1C21] flex items-center justify-center">
                            <span className="text-4xl font-black text-white">{talent.full_name?.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-black text-[#1A1C21] tracking-tighter uppercase leading-none mb-1">
                      {talent.full_name}
                    </h1>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-3">
                      @{talent.username}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                       {talent.primary_role || "Professional"}
                    </div>
                  </div>

                  <div className="space-y-3 pt-6 border-t border-[#EEEEF0]">
                    {[
                      { icon: MapPin, text: talent.location },
                      { icon: Briefcase, text: `${talent.experience_level} Years Experience` },
                      { icon: Clock, text: talent.employment_status || "Available" }
                    ].map((item, idx) => item.text && (
                      <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <item.icon className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-3">
                    <button onClick={() => setShowHireModal(true)} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]">
                      Hire {talent.full_name?.split(" ")[0]}
                    </button>
                    <button className="w-full py-4 bg-slate-50 text-[#1A1C21] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:border-[#EEEEF0] border border-transparent transition-all">
                      Schedule Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EEEEF0] p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Professional Metrics</h3>
              <div className="space-y-6">
                {[
                  { icon: Star, color: "text-amber-500", bg: "bg-amber-50", label: "Profile Score", value: `${talent.profile_completion}%` },
                  { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Verified", value: "Identity Verified" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-sm font-black text-[#1A1C21]">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SOCIAL LINKS */}
            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EEEEF0] p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Connect</h3>
              <div className="flex gap-3">
                {[
                  { icon: Github, url: talent.github_url },
                  { icon: Linkedin, url: talent.linkedin_url },
                  { icon: Globe, url: talent.website_url }
                ].map((social, idx) => social.url && (
                  <a key={idx} href={formatExternalLink(social.url)} target="_blank" rel="noopener noreferrer" className="flex-1 h-12 bg-slate-50 border border-[#EEEEF0] rounded-xl flex items-center justify-center hover:bg-white hover:border-emerald-500/30 transition-all text-slate-400 hover:text-emerald-500">
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-2 space-y-8">
            {/* TABS CONTROLLER */}
            <div className="sticky top-24 z-30 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-[#EEEEF0] p-1.5 flex gap-1">
              {["Overview", "Skills", "Tools", "About"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSection(tab.toLowerCase())}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeSection === tab.toLowerCase()
                      ? "bg-[#1A1C21] text-white shadow-xl shadow-slate-900/20"
                      : "text-slate-400 hover:text-[#1A1C21] hover:bg-slate-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeSection === "overview" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Experience", value: talent.experience_level || "N/A", sub: "Years Active", color: "text-emerald-600", bg: "bg-emerald-50/50" },
                      { label: "Location", value: talent.location?.split(",")[0] || "Remote", sub: "Current Base", color: "text-blue-600", bg: "bg-blue-50/50" },
                      { label: "Status", value: talent.employment_status || "Available", sub: "Ready for missions", color: "text-amber-600", bg: "bg-amber-50/50" }
                    ].map((card, idx) => (
                      <div key={idx} className={`p-8 bg-white border border-[#EEEEF0] rounded-[32px] shadow-sm`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${card.color}`}>{card.label}</p>
                        <p className="text-2xl font-black text-[#1A1C21] tracking-tighter truncate uppercase">{card.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {talent.bio && (
                    <div className="bg-white rounded-[32px] border border-[#EEEEF0] p-8 lg:p-12 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 text-slate-100 group-hover:text-emerald-500/10 transition-colors">
                        <FileText size={80} strokeWidth={3} />
                      </div>
                      <div className="relative z-10 space-y-6">
                         <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Sparkles size={14} /> Professional Summary
                         </h2>
                         <p className="text-xl lg:text-2xl font-bold text-[#1A1C21]/80 leading-relaxed tracking-tight">
                            {talent.bio}
                         </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-[#1A1C21] rounded-[32px] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-8">
                       <div className="flex justify-between items-center">
                          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-400">Top Expertise</h3>
                          <button onClick={() => setActiveSection("skills")} className="text-[10px] font-black uppercase tracking-widest hover:text-emerald-400 transition-colors">View All Capabilities</button>
                       </div>
                       <div className="flex flex-wrap gap-4">
                          {talent.skills?.slice(0, 8).map(skill => (
                            <span key={skill} className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest">{skill}</span>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "skills" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-white rounded-[32px] border border-[#EEEEF0] p-8 lg:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-16 h-16 bg-emerald-50 rounded-[22px] flex items-center justify-center text-emerald-600">
                          <TrendingUp size={28} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-[#1A1C21] uppercase tracking-tighter">Technical Proficiency</h2>
                          <p className="text-sm font-bold text-slate-400">Core competencies and verified skillsets</p>
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {talent.skills?.map(skill => (
                        <div key={skill} className="px-6 py-4 bg-slate-50 border border-[#EEEEF0] text-[#1A1C21] rounded-2xl font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:bg-white transition-all cursor-default">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "tools" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-white rounded-[32px] border border-[#EEEEF0] p-8 lg:p-12 shadow-sm">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-16 h-16 bg-blue-50 rounded-[22px] flex items-center justify-center text-blue-600">
                          <Award size={28} />
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-[#1A1C21] uppercase tracking-tighter">Software & Stack</h2>
                          <p className="text-sm font-bold text-slate-400">The tools used to deliver world-class results</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {talent.tools?.map(tool => (
                        <div key={tool} className="flex items-center justify-between p-6 bg-slate-50 border border-[#EEEEF0] rounded-2xl group hover:bg-white hover:border-blue-400 transition-all">
                           <span className="font-black text-[#1A1C21] uppercase tracking-widest text-xs">{tool}</span>
                           <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full w-full bg-blue-500" />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "about" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-white rounded-[40px] border border-[#EEEEF0] p-8 lg:p-16 shadow-sm">
                     <div className="space-y-8">
                        <div className="flex items-center gap-3">
                           <Users className="w-6 h-6 text-emerald-600" />
                           <h2 className="text-3xl font-black text-[#1A1C21] uppercase tracking-tighter">Detailed Background</h2>
                        </div>
                        <div className="text-xl text-slate-600 font-bold leading-relaxed space-y-6">
                           {talent.bio?.split('\n').map((para, i) => (
                             <p key={i}>{para}</p>
                           ))}
                        </div>
                     </div>

                     <div className="grid sm:grid-cols-2 gap-6 mt-16 pt-16 border-t border-[#EEEEF0]">
                        <div className="p-8 bg-slate-50 rounded-[28px]">
                           <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                             <Briefcase size={14} /> Primary Discipline
                           </h3>
                           <p className="text-lg font-black text-[#1A1C21] uppercase tracking-tighter">{talent.primary_role || "Generalist"}</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[28px]">
                           <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                             <Link2 size={14} /> Talent Identity
                           </h3>
                           <p className="text-sm font-bold text-slate-600">Verified since {new Date(talent.created_at).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#EEEEF0] bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[#1A1C21]">
             <div className="w-2 h-2 bg-emerald-500 rounded-full" />
             <span className="font-black uppercase tracking-widest text-xs">Flowboard Premium</span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
             © 2026 Flowboard. All rights reserved.
          </p>
        </div>
      </footer>

      {showHireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 lg:p-14 shadow-2xl relative">
            <button onClick={() => setShowHireModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-[#1A1C21] transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="space-y-8">
              <div className="space-y-2">
                 <h2 className="text-4xl font-black text-[#1A1C21] uppercase tracking-tighter leading-none">Hire {talent.full_name?.split(" ")[0]}</h2>
                 <p className="text-slate-500 font-bold">Signal interest for your project. Discussion starts instantly.</p>
              </div>

              <form onSubmit={handleHireSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Details</label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="w-full bg-slate-50 border border-[#EEEEF0] rounded-3xl p-6 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none"
                    placeholder={`Describe the mission context...`}
                  />
                </div>

                <div className="p-6 bg-emerald-50 rounded-3xl flex items-start gap-4">
                  <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                  <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                     Your verified client identity will be shared with the talent to facilitate immediate communication.
                  </p>
                </div>

                <button disabled={sending} type="submit" className="w-full h-16 bg-[#1A1C21] hover:bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                  {sending ? "Transmitting..." : "Send Profile Signal"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
