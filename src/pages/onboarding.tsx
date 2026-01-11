"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Building2,
  User,
  Loader2,
  Sparkles,
  MapPin,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Github,
  Search,
  Briefcase,
} from "lucide-react";

const WORLD_CITIES = [
  "Accra, Ghana",
  "Lagos, Nigeria",
  "Nairobi, Kenya",
  "London, UK",
  "New York, USA",
  "San Francisco, USA",
  "Berlin, Germany",
  "Toronto, Canada",
  "Dubai, UAE",
  "Cape Town, South Africa",
];

const ROLE_GROUPS = [
  {
    group: "Engineering",
    roles: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Fullstack Developer",
      "Mobile Developer",
      "DevOps Engineer",
    ],
  },
  {
    group: "AI & Data Science",
    roles: [
      "AI Engineer",
      "Machine Learning Engineer",
      "Data Scientist",
      "Data Analyst",
    ],
  },
  {
    group: "Design & Product",
    roles: [
      "Product Designer",
      "UI/UX Designer",
      "Product Manager",
      "Project Manager",
    ],
  },
];

const ENGLISH_LEVELS = [
  { label: "Beginner A1/A2", value: "beginner" },
  { label: "Intermediate B1/B2", value: "intermediate" },
  { label: "Advanced C1/C2", value: "advanced" },
  { label: "Native / Bilingual", value: "native" },
];

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [userRole, setUserRole] = useState<"recruiter" | "talent" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [details, setDetails] = useState({
    // Shared / Talent Fields
    titleOrCompany: "",
    experienceOrSize: "",
    primarySkillOrIndustry: "",
    englishLevel: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    resumeFile: null as File | null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [locSearch, setLocSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);

  // Validation Logic - Role Sensitive
  const isStep2Complete = useMemo(() => {
    const common =
      details.location.length >= 3 && details.titleOrCompany.length > 0;

    if (userRole === "talent") {
      return (
        common &&
        details.experienceOrSize !== "" &&
        details.primarySkillOrIndustry !== "" &&
        details.englishLevel !== ""
      );
    } else {
      // Recruiters don't need English level or specific skills to pass step 2
      return (
        common &&
        details.experienceOrSize !== "" &&
        details.primarySkillOrIndustry !== ""
      );
    }
  }, [details, userRole]);

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return ROLE_GROUPS;
    return ROLE_GROUPS.map((g) => ({
      ...g,
      roles: g.roles.filter((r) =>
        r.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((g) => g.roles.length > 0);
  }, [searchQuery]);

  const filteredLocations = useMemo(() => {
    if (locSearch.length < 2) return [];
    return WORLD_CITIES.filter((c) =>
      c.toLowerCase().includes(locSearch.toLowerCase())
    );
  }, [locSearch]);

  const handleFinish = async () => {
  setIsLoading(true);
  try {
    // 1. Get the current Auth user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No authenticated user found");

    let resumePublicUrl = "";

    // 2. Handle File Upload (Talent only)
    if (userRole === "talent" && details.resumeFile) {
      const fileExt = details.resumeFile.name.split(".").pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, details.resumeFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      resumePublicUrl = publicUrl;
    }

    // 3. Extract Identity from Google/Auth Metadata
    // Supabase stores Google info in user_metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
    const avatarUrl = user.user_metadata?.avatar_url || "";
    const userEmail = user.email || "";

    // 4. Build the Final Profile Object
    const profileUpdate = {
      id: user.id,
      email: userEmail,
      full_name: fullName,
      avatar_url: avatarUrl,
      role_type: userRole,
      onboarding_completed: true, // Crucial for your ProtectedRoute
      location: details.location,
      
      // Talent Mapping
      primary_role: userRole === "talent" ? details.titleOrCompany : null,
      experience_level: userRole === "talent" ? details.experienceOrSize : null,
      primary_skill: userRole === "talent" ? details.primarySkillOrIndustry : null,
      github_url: details.github,
      linkedin_url: details.linkedin,
      english_level: details.englishLevel,
      resume_url: resumePublicUrl,

      // Recruiter Mapping
      company_name: userRole === "recruiter" ? details.titleOrCompany : null,
      company_size: userRole === "recruiter" ? details.experienceOrSize : null,
      website_url: details.website, // Ensure this exists in your 'details' state
      
      updated_at: new Date().toISOString(),
    };

    // 5. Upsert to Supabase
    const { error } = await supabase
      .from("profiles")
      .upsert(profileUpdate, { onConflict: 'id' });

    if (error) throw error;

    toast.success("Profile updated successfully!");
    
    // 6. Redirect to Dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);

  } catch (error: any) {
    console.error("Onboarding Error:", error);
    toast.error(error.message || "Failed to save profile");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#050B1E] flex flex-col items-center justify-center p-4 md:p-10 text-white relative overflow-x-hidden">
      {/* Background Aura */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[150px] rounded-full transition-colors duration-1000 opacity-20 ${
          userRole === "talent" ? "bg-emerald-500/40" : "bg-blue-500/40"
        }`}
      />

      {/* Progress Header */}
      <div className="flex items-center gap-6 mb-12 relative z-10 scale-90 md:scale-100">
        {[
          { s: 1, l: "ACCOUNT" },
          { s: 2, l: userRole === "recruiter" ? "COMPANY" : "EXPERIENCE" },
          { s: 3, l: userRole === "recruiter" ? "FINISH" : "RESUME" },
        ].map((item, i) => (
          <div key={item.s} className="flex items-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step >= item.s
                    ? userRole === "recruiter"
                      ? "bg-blue-500 border-blue-500"
                      : "bg-emerald-500 border-emerald-500"
                    : "border-white/10 text-white/30"
                }`}
              >
                {step > item.s ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span className="font-bold">{item.s}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-black tracking-[0.2em] ${
                  step >= item.s
                    ? userRole === "recruiter"
                      ? "text-blue-500"
                      : "text-emerald-500"
                    : "text-white/20"
                }`}
              >
                {item.l}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`w-20 h-[1px] mb-8 mx-2 ${
                  step > item.s
                    ? userRole === "recruiter"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                    : "bg-white/5"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <motion.div
        animate={{ width: step === 2 ? "720px" : "550px" }}
        className="relative z-10 w-full bg-white/[0.03] border border-white/10 backdrop-blur-3xl rounded-[3rem] p-8 md:p-14 shadow-2xl transition-all duration-500"
      >
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="s1"
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-8"
            >
              <div>
                <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h1 className="text-4xl font-black tracking-tight">
                  How will you use Flowboard?
                </h1>
              </div>
              <div className="grid gap-4">
                <button
                  onClick={() => setUserRole("talent")}
                  className={`group flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all ${
                    userRole === "talent"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-white/5 bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                      userRole === "talent"
                        ? "bg-emerald-500"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <User className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">I'm Talent</h3>
                    <p className="text-sm text-slate-500">
                      Looking for high-impact roles.
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setUserRole("recruiter")}
                  className={`group flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all ${
                    userRole === "recruiter"
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/5 bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                      userRole === "recruiter"
                        ? "bg-blue-500"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">I'm Hiring</h3>
                    <p className="text-sm text-slate-500">
                      Need to build an elite team.
                    </p>
                  </div>
                </button>
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full h-16 bg-white text-black hover:bg-slate-200 rounded-2xl font-black text-lg"
                disabled={!userRole}
              >
                Continue
              </Button>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="s2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div>
                <h2
                  className={`text-3xl font-black tracking-tight ${
                    userRole === "recruiter"
                      ? "text-blue-500"
                      : "text-emerald-500"
                  }`}
                >
                  {userRole === "recruiter"
                    ? "Company Details"
                    : "Professional Expertise"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Fields marked with <span className="text-rose-500">*</span>{" "}
                  are required.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dynamic Title Input */}
                <div className="md:col-span-2 space-y-2 relative">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {userRole === "recruiter" ? "Company Name" : "Primary Role"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    {userRole === "recruiter" ? (
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    ) : (
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    )}
                    <input
                      placeholder={
                        userRole === "recruiter"
                          ? "e.g. Acme Corp"
                          : "e.g. Software Engineer"
                      }
                      value={searchQuery}
                      onFocus={() =>
                        userRole === "talent" && setShowSuggestions(true)
                      }
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setDetails((prev) => ({
                          ...prev,
                          titleOrCompany: e.target.value,
                        }));
                        if (userRole === "talent") setShowSuggestions(true);
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                  {showSuggestions && userRole === "talent" && (
                    <div className="absolute z-50 w-full mt-2 bg-[#0A1229] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 backdrop-blur-xl">
                      {filteredRoles.map((g) => (
                        <div key={g.group} className="mb-2">
                          <div className="px-3 py-1 text-[10px] font-black text-emerald-500 uppercase">
                            {g.group}
                          </div>
                          {g.roles.map((r) => (
                            <button
                              key={r}
                              onClick={() => {
                                setDetails({ ...details, titleOrCompany: r });
                                setSearchQuery(r);
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 text-sm transition-colors"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Left Col */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {userRole === "recruiter"
                        ? "Company Size"
                        : "Total Experience"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={details.experienceOrSize}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          experienceOrSize: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 appearance-none text-sm cursor-pointer"
                    >
                      <option value="" className="bg-[#050B1E]">
                        Select option
                      </option>
                      {userRole === "talent" ? (
                        <>
                          <option value="1-3" className="bg-[#050B1E]">
                            1-3 Years
                          </option>
                          <option value="4-7" className="bg-[#050B1E]">
                            4-7 Years
                          </option>
                          <option value="8+" className="bg-[#050B1E]">
                            8+ Years
                          </option>
                        </>
                      ) : (
                        <>
                          <option value="1-10" className="bg-[#050B1E]">
                            1-10 Employees
                          </option>
                          <option value="11-50" className="bg-[#050B1E]">
                            11-50 Employees
                          </option>
                          <option value="50+" className="bg-[#050B1E]">
                            50+ Employees
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-2 relative">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        placeholder="Accra, Ghana"
                        value={locSearch}
                        onChange={(e) => {
                          setLocSearch(e.target.value);
                          setDetails((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }));
                          setShowLocSuggestions(true);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-emerald-500 transition-all text-sm"
                      />
                    </div>
                    {showLocSuggestions && filteredLocations.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-[#0A1229] border border-white/10 rounded-2xl shadow-2xl p-2">
                        {filteredLocations.map((l) => (
                          <button
                            key={l}
                            onClick={() => {
                              setDetails({ ...details, location: l });
                              setLocSearch(l);
                              setShowLocSuggestions(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-emerald-500/10 text-sm"
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Col */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {userRole === "recruiter" ? "Industry" : "Primary Skill"}{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={details.primarySkillOrIndustry}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          primarySkillOrIndustry: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 appearance-none text-sm cursor-pointer"
                    >
                      <option value="" className="bg-[#050B1E]">
                        Select option
                      </option>
                      {userRole === "talent" ? (
                        <>
                          <option value="react" className="bg-[#050B1E]">
                            React / Next.js
                          </option>
                          <option value="ai" className="bg-[#050B1E]">
                            AI / ML Models
                          </option>
                          <option value="node" className="bg-[#050B1E]">
                            Node.js Backend
                          </option>
                        </>
                      ) : (
                        <>
                          <option value="fintech" className="bg-[#050B1E]">
                            Fintech
                          </option>
                          <option value="saas" className="bg-[#050B1E]">
                            SaaS
                          </option>
                          <option value="health" className="bg-[#050B1E]">
                            Healthtech
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                  {userRole === "talent" && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        English Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={details.englishLevel}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            englishLevel: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500 appearance-none text-sm cursor-pointer"
                      >
                        <option value="" className="bg-[#050B1E]">
                          Select proficiency
                        </option>
                        {ENGLISH_LEVELS.map((l) => (
                          <option
                            key={l.value}
                            value={l.value}
                            className="bg-[#050B1E]"
                          >
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {userRole === "recruiter" && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Company Website
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          placeholder="https://..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 outline-none focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                {userRole === "talent" && (
                  <div className="md:col-span-2 space-y-3 pt-6 border-t border-white/5 mt-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                      Online Presence{" "}
                      <span className="text-[9px] lowercase font-medium opacity-50">
                        (Optional)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500" />
                        <input
                          placeholder="GitHub URL"
                          value={details.github}
                          onChange={(e) =>
                            setDetails({ ...details, github: e.target.value })
                          }
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                      <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500" />
                        <input
                          placeholder="LinkedIn URL"
                          value={details.linkedin}
                          onChange={(e) =>
                            setDetails({ ...details, linkedin: e.target.value })
                          }
                          className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 pl-12 text-sm outline-none focus:border-emerald-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1 h-16 rounded-2xl text-slate-500 hover:text-white font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(userRole === "recruiter" ? 3 : 3)} // Both go to 3, but 3 will look different
                  disabled={!isStep2Complete}
                  className={`flex-[2] h-16 rounded-2xl font-black text-lg transition-all ${
                    isStep2Complete
                      ? userRole === "recruiter"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-white/5 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  {userRole === "recruiter" ? "Finish Setup" : "Next: Resume"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="s3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              {userRole === "talent" ? (
                <>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">
                      Upload your resume
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                      Required for profile verification.
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-16 bg-white/[0.01] hover:bg-white/[0.03] transition-all group cursor-pointer relative">
                    <input
                      type="file"
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          resumeFile: e.target.files?.[0] || null,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                      accept=".pdf"
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <Upload className="w-10 h-10 text-emerald-500" />
                      </div>
                      <p className="text-xl font-bold">
                        Drop PDF here or{" "}
                        <span className="text-emerald-500">Browse</span>
                      </p>
                      {details.resumeFile && (
                        <div className="mt-8 px-6 py-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/40 text-emerald-400 font-bold flex items-center gap-3">
                          <CheckCircle2 className="w-4 h-4" />{" "}
                          {details.resumeFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 space-y-6">
                  <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">
                    Ready to hire?
                  </h2>
                  <p className="text-slate-400 max-w-xs mx-auto">
                    Your company profile is set up. You can now start posting
                    jobs and browsing elite talent.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="flex-1 h-16 rounded-2xl text-slate-500 font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={
                    isLoading || (userRole === "talent" && !details.resumeFile)
                  }
                  className={`flex-[2] h-16 rounded-2xl font-black text-lg ${
                    userRole === "recruiter"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
