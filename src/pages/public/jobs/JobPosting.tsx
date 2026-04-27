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
        let job: any = null;
        let op: any = null;

        const { data: directJob } = await supabase
          .from("roles")
          .select("*")
          .eq("id", roleId)
          .maybeSingle();

        if (directJob) {
          job = directJob;
          const { data: orgProfile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, company_name, bio, location")
            .eq("id", directJob.organization_id)
            .maybeSingle();
          op = orgProfile;
        } else {
          const { data: clients } = await supabase
            .from("profiles")
            .select("*");

          (clients || []).forEach((client: any) => {
            const profileJobs = client.system_prefs?.public_jobs || [];
            const foundJob = profileJobs.find((j: any) => j.id === roleId);
            if (foundJob) {
              job = foundJob;
              op = {
                id: client.id,
                full_name: client.full_name,
                avatar_url: client.avatar_url,
                company_name: client.company_name || "Enterprise",
                bio: client.bio,
                location: client.location
              };
            }
          });
        }

        if (!job) throw new Error("Job not found");
        setRole(job);
        setOrg(op);

        // 4. Check if already applied
        if (session?.user) {
          const { data: app } = await supabase
            .from("job_applications")
            .select("*")
            .eq("role_id", roleId)
            .eq("talent_id", session.user.id)
            .maybeSingle();

          const localKey = `job_applications_${session.user.id}`;
          const existing = localStorage.getItem(localKey);
          const apps = existing ? JSON.parse(existing) : [];

          if (app || apps.includes(roleId)) setHasApplied(true);
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
      navigate(`/talent/signup?redirect=/talent/jobs?role=${roleId}`);
      return;
    }

    if (profile?.role_type !== "talent") {
      toast({
        variant: "destructive",
        title: "Talent account required",
        description: "Please sign in or create a talent profile to apply.",
      });
      navigate(`/talent/signup?redirect=/talent/jobs?role=${roleId}`);
      return;
    }

    // Redirect to the talent dashboard so the application can be completed there.
    navigate(`/talent/jobs?role=${roleId}`);
  };

  const shareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied!", description: "Share this job with your network." });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#A079FF] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opening job briefing...</p>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-[#1A1C21] mb-2 uppercase">Job expired or not found</h1>
        <p className="text-slate-500 max-w-md font-medium mb-8">
          The role you are looking for might have been filled, closed, or moved to a private workforce group.
        </p>
        <Link to="/" className="px-8 py-4 bg-[#A079FF] text-white font-black text-xs uppercase tracking-widest rounded-md hover:bg-[#A079FF]/90 transition-all">
          Return Home
        </Link>
      </div>
    );
  }

  const companyName = (role as any)?.organization_name || org?.company_name || org?.full_name || "Enterprise Partner";

  return (
    <div className="min-h-screen bg-slate-50 font-jakarta selection:bg-[#A079FF]/20 selection:text-[#1A1C21] overflow-x-hidden">
      <PreparedNavbar />
      
      {/* ── HERO BANNER ── */}
      <section className="relative pt-40 pb-24 border-b border-[#EEEEF0] bg-white overflow-hidden">
        
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <Link to="/careers/open-positions" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1A1C21]/40 hover:text-[#1A1C21] transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
                </Link>
                <div className="h-4 w-px bg-[#EEEEF0]" />
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#A079FF]/10 text-[#A079FF] px-2.5 py-1 rounded-md">
                  {role.type}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#EEEEF0] text-[#1A1C21] px-2.5 py-1 rounded-md">
                  {role.status === 'open' ? 'Actively Hiring' : 'Reviewing'}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1A1C21] leading-[1.1]">
                {role.title}
              </h1>

              <div className="flex flex-wrap items-center gap-y-4 gap-x-8">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center border border-[#EEEEF0] overflow-hidden">
                    {(role as any)?.organization_avatar || org?.avatar_url ? (
                      <img src={(role as any)?.organization_avatar || org?.avatar_url} className="w-8 h-8 object-contain" alt="" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1C21]/40 leading-none mb-1">Posted by</p>
                    <p className="text-base font-bold text-[#1A1C21]">{companyName}</p>
                  </div>
                </div>
                
                <div className="h-10 w-px bg-[#EEEEF0] hidden md:block" />

                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1C21]/60 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-[#1A1C21]/40" /> {role.location}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1C21]/60 uppercase tracking-wide">
                      <DollarSign className="w-3.5 h-3.5 text-[#1A1C21]/40" /> {role.salary || "Competitive"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1C21]/60 uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5 text-[#1A1C21]/40" /> {new Date(role.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={shareJob}
                className="p-5 bg-white border border-[#EEEEF0] rounded-md hover:bg-slate-50 transition-all flex items-center gap-2 group"
              >
                <Share2 className="w-5 h-5 text-[#1A1C21]/40 group-hover:text-[#1A1C21] transition-colors" />
              </button>
              <button
                disabled={hasApplied}
                onClick={handleApply}
                className={`px-10 py-5 font-black text-xs uppercase tracking-[0.2em] rounded-md transition-all shadow-xl flex items-center gap-3 min-w-[200px] justify-center ${
                  hasApplied 
                    ? "bg-[#EEEEF0] text-[#1A1C21]/50 cursor-default" 
                    : "bg-[#1A1C21] hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {hasApplied ? (
                  <><CheckCircle2 className="w-4 h-4" /> Already Applied</>
                ) : (
                  <>Apply in Talent Portal</>
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
          <div className="lg:col-span-8">
            <div className="bg-white p-10 lg:p-14 border border-[#EEEEF0] rounded-md shadow-sm space-y-16">
              
              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-xl font-black tracking-tight text-[#1A1C21] uppercase border-b border-[#EEEEF0] pb-4">
                  Job Overview
                </h2>
                <p className="text-lg text-[#1A1C21]/80 font-medium leading-[1.7] font-jakarta max-w-3xl whitespace-pre-line pt-2">
                  {role.description}
                </p>
              </div>

              {/* Responsibilities */}
              {role.responsibilities?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black tracking-tight text-[#1A1C21] uppercase border-b border-[#EEEEF0] pb-4">
                    Responsibilities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 pt-2">
                    {role.responsibilities.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="w-5 h-5 text-[#1A1C21] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-[#1A1C21]/80 leading-relaxed whitespace-pre-line">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {role.benefits?.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-black tracking-tight text-[#1A1C21] uppercase border-b border-[#EEEEF0] pb-4">
                    Benefits
                  </h2>
                  <div className="flex flex-wrap gap-x-8 gap-y-4 pt-2">
                    {role.benefits.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-[#1A1C21] rounded-full" />
                        <span className="text-sm font-bold text-[#1A1C21] tracking-wide">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Bottom Apply Button */}
              <div className="pt-10 border-t border-[#EEEEF0]">
                <button
                  disabled={hasApplied}
                  onClick={handleApply}
                  className={`px-12 py-5 font-black text-xs uppercase tracking-[0.25em] rounded-md transition-all shadow-xl flex items-center justify-center min-w-[180px] ${
                    hasApplied 
                      ? "bg-[#EEEEF0] text-[#1A1C21]/50 cursor-default" 
                      : "bg-[#1A1C21] hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {hasApplied ? (
                    <><CheckCircle2 className="w-4 h-4" /> Already Applied</>
                  ) : (
                    <>Apply in Talent Portal</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Spec Card */}
            <div className="p-10 bg-white rounded-md text-[#1A1C21] space-y-10 shadow-sm border border-[#EEEEF0] relative overflow-hidden group">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#1A1C21]/40">Role Specifications</h3>
              
              <div className="grid grid-cols-1 gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#1A1C21]/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#1A1C21]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1C21]/40 mb-0.5">Location</p>
                    <p className="text-sm font-bold">{role.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#1A1C21]/5 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-[#1A1C21]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1C21]/40 mb-0.5">Contract Type</p>
                    <p className="text-sm font-bold">{role.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#1A1C21]/5 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-[#1A1C21]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1C21]/40 mb-0.5">Experience</p>
                    <p className="text-sm font-bold">{role.experience_level || "Not Specified"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-[#1A1C21]/5 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-[#1A1C21]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1A1C21]/40 mb-0.5">Department</p>
                    <p className="text-sm font-bold">{role.department || "General"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#EEEEF0] space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1A1C21]/40">Skills Required</p>
                <div className="flex flex-wrap gap-2">
                  {role.skills?.map(s => (
                    <span key={s} className="px-3 py-1.5 bg-white border border-[#EEEEF0] rounded-md text-xs font-black text-[#1A1C21] uppercase tracking-widest">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organization Info */}
            <div className="p-10 bg-white border border-[#EEEEF0] rounded-md space-y-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[#1A1C21]/40">Company Overview</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white border border-[#EEEEF0] flex items-center justify-center overflow-hidden">
                  {(role as any)?.organization_avatar || org?.avatar_url ? (
                    <img src={(role as any)?.organization_avatar || org?.avatar_url} className="w-8 h-8 object-contain" alt="" />
                  ) : (
                    <Building2 className="w-6 h-6 text-[#1A1C21]/10" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[#1A1C21]">{companyName}</h4>
                  <p className="text-sm font-medium text-[#1A1C21]/60">{org?.location || "Global Operations"}</p>
                </div>
              </div>

              <p className="text-sm font-medium text-[#1A1C21]/80 leading-relaxed">
                {org?.bio || "Join a high-performance team building the next generation of global workforce infrastructure."}
              </p>
            </div>

            {/* Share & Save */}
            <div className="flex gap-4">
              <button 
                onClick={shareJob}
                className="flex-1 px-6 py-4 bg-white border border-[#EEEEF0] rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group text-[#1A1C21]"
              >
                <Share2 className="w-4 h-4 text-[#1A1C21]/40 group-hover:text-[#A079FF] transition-colors" /> Share job
              </button>
              <button className="flex-1 px-6 py-4 bg-white border border-[#EEEEF0] rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group text-[#1A1C21]">
                <Bookmark className="w-4 h-4 text-[#1A1C21]/40 group-hover:text-[#A079FF] transition-colors" /> Save
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
