"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Save,
  Camera,
  Github,
  Linkedin,
  Globe,
  FileText,
  Languages,
  Trash2,
  Key,
  Sparkles,
  Plus,
  X,
  Clock,
  Zap,
  Target,
  Wrench,
  Building2,
  Mail,
  Hash,
  Globe2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newLanguage, setNewLanguage] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newTool, setNewTool] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [toolSuggestions, setToolSuggestions] = useState<string[]>([]);

  const [profile, setProfile] = useState<any>({
    username: "",
    full_name: "",
    email: "",
    role_type: "TALENT",
    bio: "",
    location: "",
    timezone: "UTC",
    primary_role: "",
    experience_level: "Mid-Level",
    employment_status: "Open to Work",
    languages: [],
    avatar_url: "",
    profile_completion: 0,
    is_visible: true,
  });

  const { toast } = useToast();

  const SUGGESTED_SKILLS = [
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "UI/UX Design",
    "Product Management",
    "AWS",
    "SQL",
    "Tailwind CSS",
    "Framer Motion",
  ];
  const SUGGESTED_TOOLS = [
    "Figma",
    "VS Code",
    "GitHub",
    "Jira",
    "Notion",
    "Slack",
    "Vercel",
    "Docker",
    "Postman",
    "Linear",
  ];

  // 3. Add the handler function
  const handleSkillChange = (val: string) => {
    setNewSkill(val);
    if (val.length > 1) {
      const filtered = SUGGESTED_SKILLS.filter(
        (s) =>
          s.toLowerCase().includes(val.toLowerCase()) &&
          !profile.skills?.includes(s),
      );
      setSkillSuggestions(filtered);
    } else {
      setSkillSuggestions([]);
    }
  };

  const handleToolChange = (val: string) => {
    setNewTool(val);
    if (val.length > 1) {
      const filtered = SUGGESTED_TOOLS.filter(
        (t) =>
          t.toLowerCase().includes(val.toLowerCase()) &&
          !profile.tools?.includes(t),
      );
      setToolSuggestions(filtered);
    } else {
      setToolSuggestions([]);
    }
  };

  // 4. Calculate Percentage (Add this so the 0% actually moves!)
  const calculateCompletion = () => {
    const fields = [
      profile.full_name,
      profile.username,
      profile.bio,
      profile.avatar_url,
      profile.primary_role,
      profile.location,
    ];
    const arrays = [profile.languages, profile.skills, profile.tools];

    const filledFields = fields.filter((f) => !!f).length;
    const filledArrays = arrays.filter((a) => a && a.length > 0).length;

    return Math.round(
      ((filledFields + filledArrays) / (fields.length + arrays.length)) * 100,
    );
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
          setProfile({
            ...data,
            languages: data.languages || [],
            skills: data.skills || [],
            tools: data.tools || [],
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // Update visibility toggle
  const toggleVisibility = () => {
    setProfile({ ...profile, is_visible: !profile.is_visible });
  };

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
      // FIX: Changed '-' to '/' to put file in the user's specific folder
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

      // 3. Update Database IMMEDIATELY (Instant change)
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // 4. Update UI State
      setPreviewUrl(publicUrl);
      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Avatar Updated",
        description: "Your new look is now live!",
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
          title: "Identity Synchronized",
          description: "Your global FlowBoard profile is up to date.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const addLanguage = () => {
    if (newLanguage && !profile.languages.includes(newLanguage)) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage],
      });
      setNewLanguage("");
    }
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center bg-[var(--background)] justify-center">
        <div className="w-10 h-10 border-4 border-[#00A86B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-32 bg-[var(--background)] dark:bg-[#020617] min-h-screen transition-colors duration-300">
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-xl shadow-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative h-12 w-12 md:h-14 md:w-14 flex items-center justify-center flex-shrink-0">
            {/* Muted background for the percentage, text color is dynamic */}
            <div
              className="h-10 w-10 md:h-12 md:w-12 bg-slate-500/5 dark:bg-slate-400/5 rounded-xl flex items-center justify-center text-xs md:text-sm font-black border border-[var(--border-color)] relative z-10"
              style={{
                color:
                  calculateCompletion() < 40
                    ? "#f87171"
                    : calculateCompletion() < 70
                      ? "#fbbf24"
                      : "#00A86B",
              }}
            >
              {calculateCompletion()}%
            </div>
            {/* Optional: Subtle decorative ring */}
            <div className="absolute inset-0 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl animate-[spin_10s_linear_infinite]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-slate-400">
              Profile Strength
            </p>
            {/* THE PROGRESS BAR - Muted track */}
            <div className="w-full h-1.5 bg-slate-500/10 dark:bg-slate-400/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${calculateCompletion()}%`,
                  backgroundColor:
                    calculateCompletion() < 40
                      ? "#f87171" // Red
                      : calculateCompletion() < 70
                        ? "#fbbf24" // Amber
                        : "#00A86B", // Emerald
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button - Removed the heavy green shadow, added a cleaner hover */}
        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full sm:w-auto bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-[#00A86B] dark:hover:bg-[#00A86B] hover:text-white dark:hover:text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {updating ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Syncing...
            </span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* COMPLETION WARNING NUDGE */}
      {calculateCompletion() < 70 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-900 leading-tight">
              Your profile is currently "Shadowed"
            </h4>
            <p className="text-xs font-bold text-amber-700/80 mt-0.5">
              Reach <span className="text-amber-900">70% strength</span> to
              unlock visibility. Try adding{" "}
              {profile.skills?.length === 0
                ? "Skills"
                : profile.bio
                  ? "more links"
                  : "a bio"}
              .
            </p>
          </div>
          <div className="w-full sm:w-auto text-left sm:text-right border-t sm:border-none pt-2 sm:pt-0">
            <span className="text-[10px] font-black uppercase tracking-tighter text-amber-900/40">
              Missing {70 - calculateCompletion()}%
            </span>
          </div>
        </div>
      )}

      {/* HEADER / AVATAR */}
      <header className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 shadow-sm text-center md:text-left overflow-hidden">
        <div className="relative flex-shrink-0">
          <div className="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-slate-500/10 dark:bg-slate-900/50 border border-[var(--border-color)] overflow-hidden flex items-center justify-center group relative shadow-inner">
            {previewUrl || profile.avatar_url ? (
              <img
                src={previewUrl || profile.avatar_url}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Avatar"
              />
            ) : (
              <User className="w-12 h-12 md:w-16 md:h-16 text-slate-500/30" />
            )}
          </div>

          {/* The Trigger Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-3 md:p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all group z-10"
          >
            <Camera className="w-4 h-4 md:w-5 h-5 text-slate-400 group-hover:text-[#00A86B]" />
          </button>

          {/* THE MISSING INPUT - This makes it work! */}
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
              className="text-2xl sm:text-3xl md:text-5xl font-black bg-transparent border-none outline-none text-[var(--foreground)] w-full text-center md:text-left focus:ring-0 placeholder:text-slate-300 transition-all leading-tight truncate"
              placeholder="Full Name"
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
                className="bg-transparent border-none outline-none text-slate-500 w-full font-bold text-sm md:text-base text-center md:text-left focus:ring-0 tracking-tight truncate"
                placeholder="username"
              />
            </div>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 w-full">
            <div className="max-w-full">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/5 dark:bg-slate-400/5 text-slate-500 dark:text-slate-400 border border-[var(--border-color)] rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest w-full">
                <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[300px] md:max-w-[400px]">
                  {profile.email}
                </span>
              </span>
            </div>

            <span className="inline-flex items-center px-4 py-2 bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-transparent rounded-lg text-[10px] md:text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
              {profile.role_type || "Member"}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* 1. PROFESSIONAL OVERVIEW & BIO */}
          <section className=" dark:bg-[#0B1120] dark:bg-[#0B1120] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 space-y-8 shadow-sm">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00A86B]">
                <Sparkles className="w-4 h-4" /> Neural Biography
              </h3>
              <textarea
                rows={4}
                value={profile.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                placeholder="Describe your expertise..."
                className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-xl p-5 text-base outline-none focus:border-[#00A86B] focus:ring-4 focus:ring-emerald-500/5 transition-all text-[var(--foreground)]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1 tracking-wider">
                  Primary Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={profile.primary_role || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, primary_role: e.target.value })
                    }
                    placeholder="e.g. Senior Fullstack Engineer"
                    className="w-full dark:bg-slate-900/50 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-[#00A86B] dark:bg-[#0B1120] dark:bg-[#0B1120] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-500 ml-1 tracking-wider">
                  Current Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    value={profile.current_company || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        current_company: e.target.value,
                      })
                    }
                    placeholder="e.g. FlowBoard Labs"
                    className="w-full dark:bg-slate-900/50 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-[#00A86B] dark:bg-[#0B1120] dark:bg-[#0B1120] transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. CAPABILITIES: SKILLS & TOOLS */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 space-y-10 shadow-sm">
            {/* Skills Stack */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Zap className="w-4 h-4 text-[#00A86B]" /> Skill Matrix
              </h3>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-500/5 dark:bg-slate-900/50 rounded-2xl border border-dashed border-[var(--border-color)]">
                {profile.skills?.map((skill: string) => (
                  <motion.span
                    layout
                    key={skill}
                    className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-sm transition-all group hover:border-[#00A86B]/30"
                  >
                    {skill}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer text-slate-400 group-hover:text-red-500 transition-colors"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          skills: profile.skills.filter(
                            (s: string) => s !== skill,
                          ),
                        })
                      }
                    />
                  </motion.span>
                ))}

                {/* SMART INPUT FOR SKILLS */}
                <div className="relative flex-1 min-w-[140px] flex items-center px-2">
                  <input
                    value={newSkill}
                    onChange={(e) => handleSkillChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSkill.trim()) {
                        setProfile({
                          ...profile,
                          skills: [...(profile.skills || []), newSkill.trim()],
                        });
                        setNewSkill("");
                        setSkillSuggestions([]);
                      }
                    }}
                    placeholder="Add Skill..."
                    className="w-full bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-[var(--foreground)] placeholder:text-slate-500"
                  />
                  <AnimatePresence>
                    {skillSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-0 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[100] overflow-hidden"
                      >
                        {skillSuggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setProfile({
                                ...profile,
                                skills: [...(profile.skills || []), s],
                              });
                              setNewSkill("");
                              setSkillSuggestions([]);
                            }}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:bg-[#00A86B]/10 hover:text-[#00A86B] transition-colors border-b border-[var(--border-color)] last:border-none"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Tech Stack & Tools */}
            <div className="space-y-5">
              <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <Wrench className="w-4 h-4 text-[#00A86B]" /> Tech Stack
              </h3>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-500/5 dark:bg-slate-900/50 rounded-2xl border border-dashed border-[var(--border-color)]">
                {profile.tools?.map((tool: string) => (
                  <motion.span
                    layout
                    key={tool}
                    className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-sm transition-all group hover:border-[#00A86B]/30"
                  >
                    {tool}
                    <X
                      className="w-3.5 h-3.5 cursor-pointer text-slate-400 group-hover:text-red-500 transition-colors"
                      onClick={() =>
                        setProfile({
                          ...profile,
                          tools: profile.tools.filter(
                            (t: string) => t !== tool,
                          ),
                        })
                      }
                    />
                  </motion.span>
                ))}

                {/* SMART INPUT FOR TOOLS */}
                <div className="relative flex-1 min-w-[140px] flex items-center px-2">
                  <input
                    value={newTool}
                    onChange={(e) => handleToolChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTool.trim()) {
                        setProfile({
                          ...profile,
                          tools: [...(profile.tools || []), newTool.trim()],
                        });
                        setNewTool("");
                        setToolSuggestions([]);
                      }
                    }}
                    placeholder="Add Tool..."
                    className="w-full bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-[var(--foreground)] placeholder:text-slate-500"
                  />
                  <AnimatePresence>
                    {toolSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-0 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[100] overflow-hidden"
                      >
                        {toolSuggestions.map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setProfile({
                                ...profile,
                                tools: [...(profile.tools || []), t],
                              });
                              setNewTool("");
                              setToolSuggestions([]);
                            }}
                            className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-tight text-slate-500 hover:bg-[#00A86B]/10 hover:text-[#00A86B] transition-colors border-b border-[var(--border-color)] last:border-none"
                          >
                            {t}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* LOGISTICS GRID */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl md:rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 shadow-sm">
            {/* Left Side: Marketplace Info */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#00A86B]" /> Talent Account Info
              </h4>
              <div className="space-y-4">
                {/* Location Node */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 group transition-colors hover:border-slate-400 dark:hover:border-slate-600">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">
                    Location
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

                {/* Timezone Node (Refined from before) */}
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

            {/* Right Side: Global Status */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3 text-[#00A86B]" /> Global Status
              </h4>
              <div className="grid grid-cols-1 gap-5">
                {/* Expertise Level */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    Expertise Level
                  </label>
                  <select
                    value={profile.experience_level}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        experience_level: e.target.value,
                      })
                    }
                    className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-black uppercase tracking-tight outline-none focus:border-slate-400 text-[var(--foreground)] transition-all cursor-pointer appearance-none"
                  >
                    <option className="bg-[var(--card-bg)]">Junior</option>
                    <option className="bg-[var(--card-bg)]">Mid-Level</option>
                    <option className="bg-[var(--card-bg)]">Senior</option>
                    <option className="bg-[var(--card-bg)]">
                      Expert / Lead
                    </option>
                  </select>
                </div>

                {/* Availability - Muted the green background significantly */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    Availability Status
                  </label>
                  <div className="relative group">
                    <select
                      value={profile.employment_status || "Open to Work"}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          employment_status: e.target.value,
                        })
                      }
                      className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-black outline-none text-[var(--foreground)] group-hover:border-[#00A86B]/50 transition-all cursor-pointer appearance-none uppercase tracking-widest"
                    >
                      <option className="bg-[var(--card-bg)]">
                        Open to Work
                      </option>
                      <option className="bg-[var(--card-bg)]">
                        Freelancing
                      </option>
                      <option className="bg-[var(--card-bg)]">
                        Full-time Contract
                      </option>
                      <option className="bg-[var(--card-bg)]">
                        Not Available
                      </option>
                    </select>
                    {/* Minimalist status dot - the only bright green part */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#00A86B] shadow-[0_0_8px_rgba(0,168,107,0.4)] animate-pulse pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LANGUAGES SECTION */}
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Languages className="w-4 h-4 text-[#00A86B]" /> Communication
              Nodes
            </h3>

            <div className="flex flex-wrap gap-3 p-4 bg-slate-500/5 dark:bg-slate-900/50 rounded-2xl border border-dashed border-[var(--border-color)]">
              {profile.languages?.map((lang: string) => (
                <motion.span
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={lang}
                  className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-tight text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-sm group transition-all hover:border-[#00A86B]/30"
                >
                  {lang}
                  <X
                    className="w-3 h-3 cursor-pointer text-slate-400 group-hover:text-red-500 transition-colors"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        languages: profile.languages.filter(
                          (l: string) => l !== lang,
                        ),
                      })
                    }
                  />
                </motion.span>
              ))}

              {/* Input Node */}
              <div className="flex items-center gap-3 px-2 min-w-[140px]">
                <input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                  placeholder="Add Language..."
                  className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-[var(--foreground)] placeholder:text-slate-500 w-full"
                />
                <button
                  onClick={addLanguage}
                  className="p-1.5 hover:bg-emerald-500/10 rounded-xl transition-colors group"
                >
                  <Plus className="w-4 h-4 text-[#00A86B] group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: LINKS */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                External Nodes
              </h3>
              <div className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
            </div>

            {[
              { icon: Github, key: "github_url", label: "GitHub Profile URL" },
              {
                icon: Linkedin,
                key: "linkedin_url",
                label: "LinkedIn Profile URL",
              },
              {
                icon: Globe2,
                key: "portfolio_url",
                label: "Personal Portfolio",
              },
            ].map((item) => (
              <div key={item.key} className="relative group">
                <item.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00A86B] transition-colors duration-300" />
                <input
                  value={profile[item.key] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [item.key]: e.target.value })
                  }
                  placeholder={item.label}
                  className="w-full bg-slate-500/5 dark:bg-slate-900/50 border border-[var(--border-color)] rounded-xl pl-11 pr-4 py-3.5 text-[11px] font-bold outline-none transition-all focus:border-[#00A86B] focus:ring-4 focus:ring-emerald-500/5 text-[var(--foreground)] placeholder:text-slate-500 placeholder:font-medium"
                />
                {/* Subtle hover indicator line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-focus-within:h-1/2 bg-[#00A86B] transition-all duration-300 rounded-full" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
