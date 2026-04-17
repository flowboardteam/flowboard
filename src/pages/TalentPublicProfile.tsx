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

  // 2. IMMEDIATE CHECK: If no '@', act like this page doesn't exist
  // This renders the 404 component instead of the Profile UI
  if (username && !username.startsWith("@")) {
    return <NotFound />;
  }
  const [showHireModal, setShowHireModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // Get the profile data for the logged-in client
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

      // 3. Clean the identifier for the DB query
      // URL: /@codefx -> identifier: codefx
      let identifier = username?.trim() || "";
      if (identifier.startsWith("@")) {
        identifier = identifier.substring(1);
      }

      if (!identifier) throw new Error("Invalid username");

      // UUID Check
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          identifier,
        );

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

    // 1. Auth Guard Toast
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

      // This is what triggers the real-time "pop" and the bell icon badge
      await supabase.from("notifications").insert({
        user_id: talent.id, // The ID of the talent being hired
        title: "New Project Inquiry! 📬",
        message: `${currentUser.full_name} wants to discuss a project with you.`,
        type: 'inquiry'
      });

      // 2. Success Toast with much more "Variant" feel
      toast({
        title: "Inquiry Sent! 🚀",
        description: `We've signaled ${talent.full_name.split(" ")[0]}. You'll hear back soon!`,
        // If your shadcn toast config supports icons:
        // action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });

      setShowHireModal(false);
    } catch (err: any) {
      console.error(err);

      // 3. Error Toast
      toast({
        variant: "destructive",
        title: "Transmission Error",
        description:
          err.message || "We couldn't deliver your message. Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  // Add this helper function inside your component before the return
  const formatExternalLink = (url: string | null) => {
    if (!url) return "#";
    // If it doesn't start with http, add https://
    return url.startsWith("http") ? url : `https://${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-none"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-none border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="text-center space-y-4 max-w-md mx-auto px-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-none flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Profile Not Found
          </h2>
          <p className="text-slate-600">
            We couldn't locate this talent profile. Please check the URL and try
            again.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-none font-semibold hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const hasAnySkills = talent?.skills && talent.skills.length > 0;
  const hasAnyTools = talent?.tools && talent.tools.length > 0;
  const hasAnyLanguages = talent?.languages && talent.languages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* NAVIGATION HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm sm:text-base">Back</span>
              </button>
              <div className="hidden md:block h-6 w-px bg-slate-200"></div>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-none"></div>
                <span className="text-sm font-semibold text-slate-900">
                  Flowboard
                </span>
                <span className="text-sm text-slate-500">/</span>
                <span className="text-sm text-slate-500">Talent Profile</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {talent?.resume_url && (
                <a
                  href={talent.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 text-slate-700 hover:text-slate-900 font-semibold transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden lg:inline">Download CV</span>
                </a>
              )}
              <button className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-none sm:rounded-none font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-20 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* LEFT SIDEBAR - PROFILE CARD */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-6">
              {/* MAIN PROFILE CARD */}
              <div className="bg-white rounded-none sm:rounded-none shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                <div className="relative h-24 sm:h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                </div>

                <div className="relative px-4 sm:px-8 pb-6 sm:pb-8">
                  <div className="relative -mt-12 sm:-mt-16 mb-4 sm:mb-6">
                    <div className="relative inline-block">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-none sm:rounded-none overflow-hidden bg-white shadow-xl border-4 border-white">
                        {talent.avatar_url ? (
                          <img
                            src={talent.avatar_url}
                            className="w-full h-full object-cover"
                            alt={talent.full_name}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-bold text-white">
                              {talent.full_name?.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-none flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0.5">
                        {talent.full_name}
                      </h1>
                      <p className="text-slate-400 text-xs sm:text-sm font-medium mb-2">
                        @{talent.username}
                      </p>
                      <p className="text-indigo-600 font-semibold text-sm sm:text-base">
                        {talent.primary_role || "Professional"}
                      </p>
                    </div>

                    <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4 border-t border-slate-100">
                      {talent.location && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">
                            {talent.location}
                          </span>
                        </div>
                      )}
                      {talent.experience_level && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">
                            {talent.experience_level} Years Experience
                          </span>
                        </div>
                      )}
                      {talent.employment_status && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600">
                            {talent.employment_status}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 sm:pt-6 space-y-2 sm:space-y-3">
                      <button
                        onClick={() => setShowHireModal(true)}
                        className="w-full py-2.5 sm:py-3 bg-indigo-600 text-white rounded-none sm:rounded-none font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 text-sm sm:text-base active:scale-[0.98]"
                      >
                        Hire {talent.full_name?.split(" ")[0]}
                      </button>
                      <button className="w-full py-2.5 sm:py-3 bg-slate-100 text-slate-700 rounded-none sm:rounded-none font-semibold hover:bg-slate-200 transition-colors text-sm sm:text-base">
                        Schedule Interview
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK STATS - Flat version (No extra functions needed) */}
              <div className="bg-white rounded-none sm:rounded-none shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-6">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Professional Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-none flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">
                        Profile Score
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {talent.profile_completion}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-none flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-medium uppercase">
                        Verified
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        Identity Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div className="bg-white rounded-none sm:rounded-none shadow-lg shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-6">
                <h3 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Connect
                </h3>
                <div className="flex gap-2 sm:gap-3">
                  {talent.github_url && (
                    <a
                      href={formatExternalLink(talent.github_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-10 bg-slate-50 border border-slate-100 rounded-none flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <Github className="w-4 h-4 text-slate-600" />
                    </a>
                  )}
                  {talent.linkedin_url && (
                    <a
                      href={formatExternalLink(talent.linkedin_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-10 bg-slate-50 border border-slate-100 rounded-none flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <Linkedin className="w-4 h-4 text-slate-600" />
                    </a>
                  )}
                  {talent.website_url && (
                    <a
                      href={formatExternalLink(talent.website_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-10 bg-slate-50 border border-slate-100 rounded-none flex items-center justify-center hover:bg-slate-100 transition-all"
                    >
                      <Globe className="w-4 h-4 text-slate-600" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT AREA */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* NAVIGATION TABS - Sticky with Glassmorphism */}
              <div className="sticky top-20 sm:top-24 z-30 bg-white/80 backdrop-blur-md rounded-none sm:rounded-none shadow-lg shadow-slate-200/50 border border-slate-200/60 p-1.5 sm:p-2">
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {["Overview", "Skills", "Tools", "About"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveSection(tab.toLowerCase());
                        if (window.innerWidth < 1024) {
                          window.scrollTo({ top: 400, behavior: "smooth" });
                        }
                      }}
                      className={`py-2 sm:py-3 px-2 sm:px-4 rounded-none sm:rounded-none font-semibold text-xs sm:text-sm transition-all ${
                        activeSection === tab.toLowerCase()
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* DYNAMIC CONTENT SECTION */}
              <div className="transition-all duration-300">
                {/* OVERVIEW TAB - The "At a Glance" Dashboard */}
                {activeSection === "overview" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Core Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="p-4 sm:p-6 bg-white rounded-none border border-slate-200 shadow-sm">
                        <p className="text-xs sm:text-sm text-indigo-600 font-bold uppercase tracking-wider mb-1">
                          Experience
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900">
                          {talent.experience_level || "N/A"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Years Active
                        </p>
                      </div>
                      <div className="p-4 sm:p-6 bg-white rounded-none border border-slate-200 shadow-sm">
                        <p className="text-xs sm:text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">
                          Status
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 capitalize">
                          {talent.employment_status || "Available"}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-emerald-500 rounded-none animate-pulse"></div>
                          <p className="text-xs text-slate-500 font-medium">
                            Ready to work
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block p-4 sm:p-6 bg-white rounded-none border border-slate-200 shadow-sm">
                        <p className="text-xs sm:text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">
                          Location
                        </p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                          {talent.location || "Remote"}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Current Base
                        </p>
                      </div>
                    </div>

                    {/* Bio Teaser */}
                    {talent.bio && (
                      <div className="bg-white rounded-none border border-slate-200/60 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-indigo-50 rounded-none">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h2 className="text-lg font-bold text-slate-900">
                            Professional Summary
                          </h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-base sm:text-lg italic">
                          "{talent.bio.substring(0, 250)}
                          {talent.bio.length > 250 ? "..." : ""}"
                        </p>
                      </div>
                    )}

                    {/* Quick Skills Preview */}
                    <div className="bg-slate-900 rounded-none p-6 sm:p-8 text-white shadow-xl shadow-slate-200">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Top Expertise</h3>
                        <button
                          onClick={() => setActiveSection("skills")}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          VIEW ALL
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {talent.skills?.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-none text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SKILLS TAB */}
                {activeSection === "skills" && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95">
                    <div className="bg-white rounded-none shadow-sm border border-slate-200/60 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-emerald-100 rounded-none">
                          <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            Technical Proficiency
                          </h2>
                          <p className="text-sm text-slate-500">
                            Core competencies and specialized skillsets
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {talent.skills?.map((skill) => (
                          <div
                            key={skill}
                            className="px-5 py-3 bg-gradient-to-br from-slate-50 to-white text-slate-700 rounded-none border border-slate-200 font-bold text-sm shadow-sm hover:border-indigo-500 hover:translate-y-[-2px] transition-all cursor-default"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TOOLS TAB */}
                {activeSection === "tools" && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95">
                    <div className="bg-white rounded-none shadow-sm border border-slate-200/60 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2.5 bg-purple-100 rounded-none">
                          <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">
                            Software & Technologies
                          </h2>
                          <p className="text-sm text-slate-500">
                            The stack and tools used to deliver projects
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {talent.tools?.map((tool) => (
                          <div
                            key={tool}
                            className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-none group hover:bg-white hover:border-purple-300 transition-all"
                          >
                            <span className="font-bold text-slate-700">
                              {tool}
                            </span>
                            <div className="h-1.5 w-12 bg-slate-200 rounded-none overflow-hidden">
                              <div className="h-full w-full bg-purple-500"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ABOUT TAB - The Full Deep Dive */}
                {activeSection === "about" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                    {/* Full Bio */}
                    <div className="bg-white rounded-none border border-slate-200/60 p-6 sm:p-8">
                      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" /> The Story
                      </h2>
                      <div className="prose prose-indigo max-w-none text-slate-600 leading-relaxed text-lg">
                        {talent.bio}
                      </div>
                    </div>

                    {/* Professional Background Extras */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Education / Role details if they exist in your DB */}
                      <div className="bg-white rounded-none border border-slate-200/60 p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-slate-400" />{" "}
                          Primary Discipline
                        </h3>
                        <p className="text-slate-600 font-medium">
                          {talent.primary_role || "Generalist"}
                        </p>
                      </div>

                      <div className="bg-white rounded-none border border-slate-200/60 p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-indigo-500" />{" "}
                          Verification
                        </h3>
                        <p className="text-sm text-slate-500">
                          Account verified since{" "}
                          {new Date(talent.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center py-4">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-[0.2em]">
                        End of Profile
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-slate-500">
              © 2026 Flowboard. Premium Talent Network.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
      {showHireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-none w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Hire {talent.full_name?.split(" ")[0]}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sending as{" "}
                  <span className="font-semibold text-indigo-600">
                    {currentUser?.full_name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowHireModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Details
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder={`Hey ${talent.full_name.split(" ")[0]}, I'd love to discuss a project with you...`}
                  defaultValue={`Hey ${talent.full_name.split(" ")[0]}, I'd love to discuss a project with you...`}
                />
              </div>

              <div className="bg-indigo-50 p-3 rounded-none flex items-start gap-3 mb-2">
                <div className="w-5 h-5 bg-indigo-100 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-3 h-3 text-indigo-600" />
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed">
                  Your contact details and profile will be shared with the
                  talent so they can respond to you directly.
                </p>
              </div>

              <button
                disabled={sending || !currentUser}
                type="submit"
                className="w-full py-3.5 bg-indigo-600 text-white rounded-none font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
              >
                {sending ? "Sending Message..." : "Send Hiring Inquiry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
