"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  User,
  MapPin,
  Save,
  Camera,
  Linkedin,
  Globe,
  FileText,
  Trash2,
  Sparkles,
  Plus,
  X,
  Clock,
  Target,
  Building2,
  Mail,
  Globe2,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";

export default function ClientProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [profile, setProfile] = useState<any>({
    username: "",
    full_name: "",
    email: "",
    role_type: "CLIENT",
    bio: "",
    location: "",
    timezone: "UTC",
    avatar_url: "",
    profile_completion: 0,
    is_visible: true,
    // Client-specific fields
    company_name: "",
    industry: "",
    team_size: "",
  });

  const { toast } = useToast();

  const INDUSTRIES = [
    "Technology & Software",
    "Finance & Banking",
    "Healthcare & Medical",
    "E-commerce & Retail",
    "Education & Training",
    "Real Estate",
    "Marketing & Advertising",
    "Manufacturing",
    "Consulting",
    "Entertainment & Media",
    "Agriculture",
    "Construction",
    "Energy & Utilities",
    "Transportation & Logistics",
    "Hospitality & Tourism",
    "Other",
  ];

  const TEAM_SIZES = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  // Calculate profile completion for clients
  const calculateCompletion = () => {
    const fields = [
      profile.full_name,
      profile.username,
      profile.bio,
      profile.avatar_url,
      profile.company_name,
      profile.industry,
      profile.team_size,
      profile.location,
    ];

    const filledFields = fields.filter((f) => !!f).length;

    return Math.round((filledFields / fields.length) * 100);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile(data);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUpdating(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 3. Update Database
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // 4. Update UI State
      setPreviewUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Logo Updated",
        description: "Your company logo is now live!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const strengthScore = calculateCompletion();

      const { error } = await supabase
        .from("profiles")
        .update({
          ...profile,
          profile_completion: strengthScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) {
        if (error.code === "23505") {
          toast({
            variant: "destructive",
            title: "Username Taken",
            description: "This handle is already claimed by another user.",
          });
        } else {
          throw error;
        }
      } else {
        setProfile((prev) => ({ ...prev, profile_completion: strengthScore }));
        toast({
          title: "Profile Updated",
          description: "Your company profile has been synchronized.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center bg-[var(--background)] justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-none animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-32 bg-[var(--background)] dark:bg-[#020617] min-h-screen transition-colors duration-300">
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-none shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative h-12 w-12 md:h-14 md:w-14 flex items-center justify-center flex-shrink-0">
            <div
              className="h-10 w-10 md:h-12 md:w-12 bg-slate-500/5 dark:bg-slate-400/5 rounded-none flex items-center justify-center text-xs md:text-sm font-black border border-[var(--border-color)] relative z-10"
              style={{
                color:
                  calculateCompletion() < 40
                    ? "#f87171"
                    : calculateCompletion() < 70
                      ? "#fbbf24"
                      : "#3b82f6",
              }}
            >
              {calculateCompletion()}%
            </div>
            <div className="absolute inset-0 border border-dashed border-slate-200 dark:border-slate-800 rounded-none animate-[spin_10s_linear_infinite]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">
              Profile Strength
            </p>
            <div className="w-full h-1.5 bg-slate-500/10 dark:bg-slate-400/10 rounded-none mt-1 overflow-hidden">
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${calculateCompletion()}%`,
                  backgroundColor:
                    calculateCompletion() < 40
                      ? "#f87171"
                      : calculateCompletion() < 70
                        ? "#fbbf24"
                        : "#3b82f6",
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full sm:w-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 rounded-none transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {updating ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-none animate-spin" />
              Syncing...
            </span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* COMPLETION WARNING */}
      {calculateCompletion() < 70 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-none p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900 rounded-none flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 leading-tight">
              Your profile needs attention
            </h4>
            <p className="text-xs font-bold text-amber-700 dark:text-amber-300/80 mt-0.5">
              Reach <span className="text-amber-900 dark:text-amber-100">70% strength</span> to
              unlock full visibility. Try adding{" "}
              {!profile.company_name
                ? "company name"
                : !profile.industry
                  ? "industry"
                  : "more details"}
              .
            </p>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-none pt-2 sm:pt-0">
            <span className="text-[10px] font-black uppercase tracking-tighter text-amber-900/40 dark:text-amber-100/40">
              Missing {70 - calculateCompletion()}%
            </span>
          </div>
        </div>
      )}

      {/* HEADER / LOGO */}
      <header className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-5 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 shadow-sm text-center md:text-left overflow-hidden">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-none bg-slate-500/10 dark:bg-slate-900/50 border border-[var(--border-color)] overflow-hidden flex items-center justify-center group relative shadow-inner">
            {previewUrl || profile.avatar_url ? (
              <img
                src={previewUrl || profile.avatar_url}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Company Logo"
              />
            ) : (
              <Building2 className="w-12 h-12 md:w-16 md:h-16 text-slate-500/30" />
            )}
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-3 md:p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all group z-10"
          >
            <Camera className="w-4 h-4 md:w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>

        {/* INFO SECTION */}
        <div className="flex-1 space-y-5 w-full min-w-0">
          <div className="space-y-2">
            <input
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
              className="text-2xl sm:text-3xl md:text-5xl font-black bg-transparent border-none outline-none text-[var(--foreground)] w-full text-center md:text-left focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 transition-all leading-tight truncate"
              placeholder="Contact Name"
            />

            <div className="flex items-center justify-center md:justify-start gap-1.5 opacity-70">
              <span className="text-slate-400 font-black text-sm md:text-lg">
                @
              </span>
              <input
                value={profile.username || ""}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="bg-transparent border-none outline-none text-slate-500 dark:text-slate-400 w-full font-bold text-sm md:text-base text-center md:text-left focus:ring-0 tracking-tight truncate"
                placeholder="username"
              />
            </div>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full">
            <div className="max-w-full">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/5 dark:bg-slate-400/5 text-slate-500 dark:text-slate-400 border border-[var(--border-color)] rounded-none text-[10px] md:text-[11px] font-black uppercase tracking-widest w-full">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[300px] md:max-w-[400px]">
                  {profile.email}
                </span>
              </span>
            </div>

            <span className="inline-flex items-center px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-none text-[10px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
              {profile.role_type || "CLIENT"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* COMPANY OVERVIEW */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-8 space-y-8 shadow-sm">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
                <Sparkles className="w-4 h-4" /> Company Overview
              </h3>
              <textarea
                rows={4}
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Describe your company, mission, and what you're looking for..."
                className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-none p-5 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 transition-all text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1 tracking-wider">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={profile.company_name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, company_name: e.target.value })
                    }
                    placeholder="e.g. Acme Corporation"
                    className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-none pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-blue-600 transition-all text-[var(--foreground)]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1 tracking-wider">
                  Industry
                </label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={profile.industry || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, industry: e.target.value })
                    }
                    className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-none pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-blue-600 transition-all text-[var(--foreground)] cursor-pointer appearance-none"
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry} className="bg-[var(--card-bg)]">
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* COMPANY DETAILS */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none md:rounded-none p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 shadow-sm">
            {/* Left: Location & Timezone */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3 text-blue-600" /> Location Info
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 group transition-colors hover:border-slate-400 dark:hover:border-slate-600">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">
                    Headquarters
                  </span>
                  <input
                    value={profile.location || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="bg-transparent text-right text-xs font-black outline-none text-[var(--foreground)] w-full ml-4 placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    placeholder="CITY, COUNTRY"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 group transition-colors hover:border-slate-400 dark:hover:border-slate-600">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">
                    Timezone
                  </span>
                  <select
                    value={profile.timezone}
                    onChange={(e) =>
                      setProfile({ ...profile, timezone: e.target.value })
                    }
                    className="bg-transparent text-right text-xs font-black outline-none text-slate-600 dark:text-slate-300 cursor-pointer appearance-none uppercase tracking-tight"
                  >
                    <option className="bg-[var(--card-bg)]" value="UTC">
                      UTC (London)
                    </option>
                    <option className="bg-[var(--card-bg)]" value="EST">
                      EST (New York)
                    </option>
                    <option className="bg-[var(--card-bg)]" value="PST">
                      PST (Los Angeles)
                    </option>
                    <option className="bg-[var(--card-bg)]" value="WAT">
                      WAT (Lagos)
                    </option>
                    <option className="bg-[var(--card-bg)]" value="GMT">
                      GMT (Accra)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Company Size */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Users className="w-3 h-3 text-blue-600" /> Company Size
              </h4>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                  Team Size
                </label>
                <select
                  value={profile.team_size || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, team_size: e.target.value })
                  }
                  className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-none px-4 py-3 text-xs font-black uppercase tracking-tight outline-none focus:border-blue-600 text-[var(--foreground)] transition-all cursor-pointer appearance-none"
                >
                  <option value="">Select Team Size</option>
                  {TEAM_SIZES.map((size) => (
                    <option key={size} value={size} className="bg-[var(--card-bg)]">
                      {size} Employees
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SOCIAL LINKS */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                External Links
              </h3>
              <div className="w-2 h-2 rounded-none bg-blue-600 animate-pulse" />
            </div>

            {[
              {
                icon: Linkedin,
                key: "linkedin_url",
                label: "Company LinkedIn",
              },
              {
                icon: Globe2,
                key: "website_url",
                label: "Company Website",
              },
            ].map((item) => (
              <div key={item.key} className="relative group">
                <item.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300" />
                <input
                  value={profile[item.key] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [item.key]: e.target.value })
                  }
                  placeholder={item.label}
                  className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-none pl-11 pr-4 py-3.5 text-[11px] font-bold outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-500/5 text-[var(--foreground)] placeholder:text-slate-500 placeholder:font-medium"
                />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-focus-within:h-1/2 bg-blue-600 transition-all duration-300 rounded-none" />
              </div>
            ))}
          </section>

          {/* HIRING STATUS */}
          <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 rounded-none p-8 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600">
                Hiring Status
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Your profile is visible to {profile.is_visible ? "all" : "no"} talent on Flowboard.
              Complete your profile to attract the best candidates.
            </p>
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={profile.is_visible}
                  onChange={(e) =>
                    setProfile({ ...profile, is_visible: e.target.checked })
                  }
                  className="w-5 h-5 rounded-none border-2 border-blue-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                  Make my profile visible to talent
                </span>
              </label>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}