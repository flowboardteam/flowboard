"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Briefcase, DollarSign, Clock, ArrowLeft,
  Share2, CheckCircle2, Building2, Globe, Users,
  Zap, Calendar, Loader2, Mail, ExternalLink,
  ChevronRight, Bookmark
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PreparedNavbar } from "@/components/landing/PreparedNavbar";
import { PreparedFooter } from "@/components/landing/PreparedFooter";
import { useToast } from "@/components/ui/use-toast";

interface JobRole {
  id: string;
  title: string;
  department: string | null;
  type: string;
  location: string;
  salary: string | null;
  experience_level: string | null;
  description: string;
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  status: string;
  organization_id: string;
  created_at: string;
}

interface OrgProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  company_name: string | null;
  bio: string | null;
  location: string | null;
}

export default function JobPosting() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [role, setRole] = useState<JobRole | null>(null);
  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(false);

        // 1. Fetch Session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const { data: p } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
          setProfile(p);
        }

        // 2. Fetch Job
        const { data: job, error: jobErr } = await supabase
          .from("roles")
          .select("*")
          .eq("id", roleId)
          .single();

        if (jobErr || !job) throw new Error("Job not found");
        setRole(job);

        // 3. Fetch Org
        const { data: op } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, company_name, bio, location")
          .eq("id", job.organization_id)
          .single();
        setOrg(op);

        // 4. Check if already applied
        if (session?.user) {
          const { data: app } = await supabase
            .from("job_applications")
            .select("*")
            .eq("role_id", roleId)
            .eq("talent_id", session.user.id)
            .maybeSingle();
          if (app) setHasApplied(true);
        }

      } catch (err) {
        console.error("Fetch job error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [roleId]);

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Account required",
        description: "Please sign in to apply for this mission.",
      });
      navigate(`/talent/login?redirect=/jobs/${roleId}`);
      return;
    }

    if (profile?.role_type !== "talent") {
      toast({
        variant: "destructive",
        title: "Invalid account type",
        description: "Only talent profiles can apply for roles.",
      });
      return;
    }

    setApplying(true);
    try {
      // Logic for application
      const { error: appErr } = await supabase.from("job_applications").insert({
        role_id: roleId,
        talent_id: user.id,
        status: 'pending'
      });

      if (appErr) throw appErr;

      setHasApplied(true);
      toast({
        title: "Application Sent! 🚀",
        description: `Your profile has been shared with ${org?.company_name || 'the organization'}.`,
      });
    } catch (err) {
      console.error("Apply error:", err);
      toast({
        variant: "destructive",
        title: "Application failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  };

  const shareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this job with your network." });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f4f2ee]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opening job briefing...</p>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f4f2ee] p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-[#111] mb-2 uppercase">Job expired or not found</h1>
        <p className="text-slate-500 max-w-md font-medium mb-8">
          The role you are looking for might have been filled, closed, or moved to a private workforce group.
        </p>
        <Link to="/" className="px-8 py-4 bg-[#111] text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  const companyName = org?.company_name || org?.full_name || "Enterprise Partner";

  return (
    <div className="min-h-screen bg-[#f4f2ee] font-jakarta selection:bg-[#ffb038] selection:text-[#111] overflow-x-hidden">
      <PreparedNavbar />
      
      {/* ── HERO BANNER ── */}
      <section className="relative pt-40 pb-24 border-b border-black/5 bg-white overflow-hidden">
        {/* Subtle Gradient Backglow */}
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-blue-50/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent shadow-[0_4px_40px_rgba(0,0,0,0.02)]" />
        
        {/* Topographic Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}></div>
        
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <Link to="/careers/open-positions" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600/10 text-blue-600 px-2.5 py-1 rounded-lg">
                  {role.type}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg">
                  {role.status === 'open' ? 'Actively Hiring' : 'Reviewing'}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#111] leading-[1.1]">
                {role.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-4 gap-x-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center border border-black/5 overflow-hidden">
                    {org?.avatar_url ? (
                      <img src={org.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1">Posted by</p>
                    <p className="text-base font-bold text-[#111]">{companyName}</p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-slate-200 hidden md:block" />

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> {role.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {role.salary || "Competitive"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> {new Date(role.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={shareJob}
                className="p-4 bg-white border border-black/10 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 group"
              >
                <Share2 className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>
              <button
                disabled={hasApplied}
                onClick={handleApply}
                className={`px-10 py-5 font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl flex items-center gap-3 min-w-[200px] justify-center ${
                  hasApplied 
                    ? "bg-emerald-500 text-white cursor-default" 
                    : "bg-[#111] hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {applying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasApplied ? (
                  <><CheckCircle2 className="w-4 h-4" /> Already Applied</>
                ) : (
                  <>APPLY</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT SECTION ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Description */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tighter text-[#111] uppercase flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-none shadow-[0_0_15px_rgba(37,99,235,0.4)]" /> Job Overview
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-[1.7] font-jakarta max-w-3xl whitespace-pre-line">
                {role.description}
              </p>
            </div>

            {/* Responsibilities */}
            {role.responsibilities?.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black tracking-tighter text-[#111] uppercase flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-none shadow-[0_0_15px_rgba(16,185,129,0.4)]" /> Responsibilities
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {role.responsibilities.map((item, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-white border border-black/5 rounded-none group hover:border-blue-500/10 transition-all">
                      <div className="w-8 h-8 rounded-none bg-blue-600/5 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-blue-600 uppercase">R{i+1}</span>
                      </div>
                      <p className="text-base font-medium text-slate-700 leading-relaxed pt-1 whitespace-pre-line">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {role.benefits?.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-black tracking-tighter text-[#111] uppercase flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-amber-500 rounded-none shadow-[0_0_15px_rgba(245,158,11,0.4)]" /> Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {role.benefits.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-white border border-black/5 rounded-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compact Bottom Apply Button */}
            <div className="pt-10 border-t border-black/5">
              <button
                disabled={hasApplied}
                onClick={handleApply}
                className={`px-12 py-5 font-black text-xs uppercase tracking-[0.25em] rounded-none transition-all shadow-xl flex items-center justify-center min-w-[180px] ${
                  hasApplied 
                    ? "bg-emerald-500 text-white cursor-default" 
                    : "bg-[#1A1C21] hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {applying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : hasApplied ? (
                  <><CheckCircle2 className="w-4 h-4" /> Already Applied</>
                ) : (
                  <>APPLY</>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Spec Card */}
            <div className="p-10 bg-[#F5F3FF] rounded-none text-slate-900 space-y-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden group border border-purple-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[100px] rounded-none -mr-32 -mt-32 group-hover:bg-purple-600/10 transition-all duration-1000" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-none -ml-24 -mb-24" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">Role Specifications</h3>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-purple-600/5 border border-purple-200/50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Deployment</p>
                    <p className="text-sm font-bold">{role.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-emerald-600/5 border border-emerald-200/50 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Contract Type</p>
                    <p className="text-sm font-bold">{role.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-amber-600/5 border border-amber-200/50 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Experience</p>
                    <p className="text-sm font-bold">{role.experience_level || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-none bg-indigo-600/5 border border-indigo-200/50 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Department</p>
                    <p className="text-sm font-bold">{role.department || "General"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-purple-200/50 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Skills Required</p>
                <div className="flex flex-wrap gap-2">
                  {role.skills?.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-white border border-purple-100 rounded-none text-xs font-black text-purple-600 uppercase tracking-widest">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <div className="p-10 bg-white border border-black/5 rounded-none space-y-8 shadow-xl shadow-black/5">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Company Overview</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-black/5 flex items-center justify-center overflow-hidden">
                  {org?.avatar_url ? (
                    <img src={org.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#111]">{companyName}</h4>
                  <p className="text-sm font-medium text-slate-500">{org?.location || "Global Operations"}</p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {org?.bio || "Join a high-performance team building the next generation of global workforce infrastructure."}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-none text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Founded</p>
                  <p className="text-sm font-black text-slate-900">2021</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-none text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Global Team</p>
                  <p className="text-sm font-black text-slate-900">250+</p>
                </div>
              </div>
            </div>

            {/* Share & Save */}
            <div className="flex gap-4">
              <button 
                onClick={shareJob}
                className="flex-1 px-6 py-4 border border-black/10 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
              >
                <Share2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" /> Share job
              </button>
              <button className="flex-1 px-6 py-4 border border-black/10 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group">
                <Bookmark className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" /> Save for later
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-20">
        <PreparedFooter />
      </div>
    </div>
  );
}
