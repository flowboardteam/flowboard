"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  Upload,
  X,
  ArrowLeft,
  Lightbulb,
  Plus,
  Trash2,
  Calendar,
  Info,
  Github,
  Code2,
  Twitter,
  FileText,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import { Country, State } from "country-state-city";

const PHONE_CODES = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+233", country: "GH", flag: "🇬🇭" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+234", country: "NG", flag: "🇳🇬" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
];

export default function TalentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State - Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+233");
  const [phoneFlag, setPhoneFlag] = useState("🇬🇭");
  const [phoneNumber, setPhoneNumber] = useState("256909586");

  // Step 2: Links & Profiles
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [noLinkedIn, setNoLinkedIn] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState<string[]>([""]);
  const [socialProfiles, setSocialProfiles] = useState([
    { platform: "LeetCode", username: "", icon: Code2 },
    { platform: "GitHub", username: "", icon: Github },
    { platform: "Twitter / X", username: "", icon: Twitter },
  ]);

  // Step 3: Work Authorization & Residence
  const [allCountries] = useState(Country.getAllCountries());
  const [selectedCountryCode, setSelectedCountryCode] = useState("GH");
  const [states, setStates] = useState<any[]>([]);
  const [selectedStateCode, setSelectedStateCode] = useState("");
  const [city, setCity] = useState("Accra");
  const [postalCode, setPostalCode] = useState("00233");
  const [differentWorkCountry, setDifferentWorkCountry] = useState(false);

  // Legal attestation & signature
  const todayFormatted = useMemo(() => {
    const d = new Date();
    return `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  }, []);

  const [dob, setDob] = useState("04/06/2000");
  const [confirmAuthorized, setConfirmAuthorized] = useState(true);
  const [agreeRemainLocation, setAgreeRemainLocation] = useState(true);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [signatureDate, setSignatureDate] = useState(todayFormatted);

  // Step 4: Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [noResume, setNoResume] = useState(false);

  // Load User Info
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || "");
        setFullName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "George Aleesu"
        );
        setDigitalSignature(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "George Aleesu"
        );
      }
    };
    getUser();
  }, []);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountryCode) {
      const countryStates = State.getStatesOfCountry(selectedCountryCode);
      setStates(countryStates || []);
      if (countryStates && countryStates.length > 0) {
        setSelectedStateCode(countryStates[0].isoCode);
      } else {
        setSelectedStateCode("");
      }
    }
  }, [selectedCountryCode]);

  const selectedCountryObj = useMemo(() => {
    return allCountries.find((c) => c.isoCode === selectedCountryCode);
  }, [allCountries, selectedCountryCode]);

  const selectedCountryName = selectedCountryObj?.name || "Ghana";

  // Handlers for Extra Links
  const addExtraLink = () => {
    setExtraLinks([...extraLinks, ""]);
  };

  const updateExtraLink = (index: number, val: string) => {
    const updated = [...extraLinks];
    updated[index] = val;
    setExtraLinks(updated);
  };

  const removeExtraLink = (index: number) => {
    setExtraLinks(extraLinks.filter((_, i) => i !== index));
  };

  // Handlers for Social Profiles
  const updateSocialProfile = (index: number, username: string) => {
    const updated = [...socialProfiles];
    updated[index].username = username;
    setSocialProfiles(updated);
  };

  const removeSocialProfile = (index: number) => {
    setSocialProfiles(socialProfiles.filter((_, i) => i !== index));
  };

  // File Upload Simulator / Drag & Drop
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit.");
      return;
    }
    setIsUploading(true);
    setResumeFile(file);
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Resume attached successfully!");
    }, 800);
  };

  // Final Submission
  const handleFinish = async () => {
    setIsLoading(true);
    try {
      let resumePublicUrl = "";

      if (resumeFile && user) {
        const filePath = `${user.id}/resume_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, resumeFile);

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("resumes").getPublicUrl(filePath);
          resumePublicUrl = publicUrl;
        }
      }

      if (user) {
        localStorage.setItem(`onboarding_completed_${user.id}`, "true");
        
        // Update auth metadata so session knows onboarding is complete
        await supabase.auth.updateUser({
          data: { onboarding_completed: true }
        });

        await supabase.from("profiles").update({
          onboarding_completed: true,
          full_name: fullName,
          role_type: "talent",
          location: `${city}, ${selectedCountryName}`,
          phone_number: `${phoneCode} ${phoneNumber}`,
          linkedin_url: noLinkedIn ? null : linkedInUrl,
          portfolio_url: portfolioUrl,
          resume_url: resumePublicUrl,
          work_authorization: confirmAuthorized,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id);

        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fullName,
          role_type: "talent",
          onboarding_completed: true,
          location: `${city}, ${selectedCountryName}`,
          phone_number: `${phoneCode} ${phoneNumber}`,
          linkedin_url: noLinkedIn ? null : linkedInUrl,
          portfolio_url: portfolioUrl,
          resume_url: resumePublicUrl,
          work_authorization: confirmAuthorized,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.warn("Supabase upsert note:", error.message);
        }
      }

      toast.success("Onboarding completed successfully!");
      navigate("/talent/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col selection:bg-indigo-500/10">
      {/* ── TOP STEPPER HEADER ────────────────────────────────────────────── */}
      <header className="w-full max-w-4xl mx-auto pt-6 px-6">
        {/* Horizontal Progress Bars */}
        <div className="flex gap-2.5 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-100 transition-all duration-300"
            >
              <div
                className={`h-full transition-all duration-500 ${
                  i <= step ? "bg-[#5046E5]" : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="w-10">
            {step > 1 && (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="w-10" />

          <div className="w-10 flex justify-end">
            <button
              onClick={() => navigate("/talent/dashboard")}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
              title="Close onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: WELCOME & PERSONAL DETAILS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to Flowboard!
                </h1>
                <p className="text-slate-500 text-sm md:text-base font-normal max-w-md mx-auto leading-relaxed">
                  Let's start your profile! Fill out a few quick details to get
                  discovered by top employers and unlock better opportunities
                </p>
              </div>

              <div className="space-y-5 pt-2">
                {/* Full legal name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Full legal name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Phone number with Flag */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                    <span>Phone number</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#5046E5] transition-all">
                    {/* Country code selector */}
                    <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                      <span className="text-lg">{phoneFlag}</span>
                      <select
                        value={phoneCode}
                        onChange={(e) => {
                          const item = PHONE_CODES.find(
                            (p) => p.code === e.target.value
                          );
                          setPhoneCode(e.target.value);
                          if (item) setPhoneFlag(item.flag);
                        }}
                        className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
                      >
                        {PHONE_CODES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.flag} {p.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="256909586"
                      className="w-full bg-transparent px-2 py-2 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!fullName || !email}
                  className="w-full bg-[#5046E5] hover:bg-[#4338CA] text-white font-semibold h-12 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 mt-6 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: CONFIRM INFORMATION & LINKS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-[#1A1C21] tracking-tight">
                  Confirm your information
                </h1>
                <p className="text-slate-500 text-sm font-normal max-w-md mx-auto">
                  Review your details to ensure everything is correct before
                  moving on
                </p>
              </div>

              {/* Green Tip Callout Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-full px-4 py-2 text-xs font-medium text-emerald-800 flex items-center justify-center gap-2 w-fit mx-auto shadow-sm">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  Tip: Profiles with LinkedIns and other public links get
                  viewed 2x more
                </span>
              </div>

              <div className="space-y-6 pt-2">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Links</h3>

                  {/* LinkedIn URL */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-800">
                      LinkedIn URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      disabled={noLinkedIn}
                      value={linkedInUrl}
                      onChange={(e) => setLinkedInUrl(e.target.value)}
                      placeholder="https://www.linkedin.com/in/mraleesu/"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all disabled:opacity-50"
                    />

                    <label className="flex items-center gap-2 text-xs text-slate-500 font-medium cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={noLinkedIn}
                        onChange={(e) => setNoLinkedIn(e.target.checked)}
                        className="rounded border-slate-300 text-[#5046E5] focus:ring-[#5046E5]"
                      />
                      <span>I don't have a LinkedIn</span>
                    </label>
                  </div>

                  {/* Portfolio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-800">
                      Portfolio
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Other links */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-800">
                      Other links
                    </label>
                    {extraLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={link}
                          onChange={(e) =>
                            updateExtraLink(idx, e.target.value)
                          }
                          placeholder="https://example.com"
                          className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all placeholder:text-slate-400"
                        />
                        {extraLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExtraLink(idx)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addExtraLink}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5046E5] hover:text-indigo-700 transition-colors pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add more links</span>
                    </button>
                  </div>
                </div>

                {/* Other Profiles Card Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Other profiles
                  </h3>
                  <div className="space-y-2.5">
                    {socialProfiles.map((prof, idx) => {
                      const IconComp = prof.icon;
                      return (
                        <div
                          key={prof.platform}
                          className="flex items-center gap-3 bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:bg-white focus-within:border-[#5046E5] transition-all"
                        >
                          <IconComp className="w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={prof.username}
                            onChange={(e) =>
                              updateSocialProfile(idx, e.target.value)
                            }
                            placeholder={`${prof.platform.toLowerCase()}-username`}
                            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeSocialProfile(idx)}
                            className="text-slate-400 hover:text-slate-700 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(3)}
                  className="w-full bg-[#5046E5] hover:bg-[#4338CA] text-white font-semibold h-12 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 mt-6"
                >
                  Next
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: WORK AUTHORIZATION */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Work authorization
                </h1>
                <p className="text-slate-500 text-sm font-normal max-w-md mx-auto leading-relaxed">
                  Please ensure you meet local requirements for work
                  authorization. Accurate information helps us process your
                  application smoothly.
                </p>
              </div>

              <div className="space-y-8 pt-2">
                {/* Location of Residence */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Location of Residence
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Let us know your location of residence, which is where
                      you're based for most of the year. This might be different
                      from your citizenship.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Country <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all cursor-pointer"
                      >
                        {allCountries.map((c) => (
                          <option key={c.isoCode} value={c.isoCode}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State / Province / Region */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        State / Province / Region{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={selectedStateCode}
                        onChange={(e) => setSelectedStateCode(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all cursor-pointer"
                      >
                        {states.length > 0 ? (
                          states.map((s) => (
                            <option key={s.isoCode} value={s.isoCode}>
                              {s.name}
                            </option>
                          ))
                        ) : (
                          <option value="GH-AA">Greater Accra</option>
                        )}
                      </select>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Accra"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Postal Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="00233"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-slate-600 font-medium cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={differentWorkCountry}
                      onChange={(e) => setDifferentWorkCountry(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-[#5046E5] focus:ring-[#5046E5]"
                    />
                    <span>
                      I will be physically working from a different country than{" "}
                      {selectedCountryName} while performing services through
                      Flowboard.
                    </span>
                  </label>
                </div>

                <hr className="border-slate-100" />

                {/* Legal attestation */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Legal attestation
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Confirm your legally authorized work status
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Date of Birth */}
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs font-semibold text-slate-800">
                        Date of Birth (in MM/DD/YYYY){" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          placeholder="04/06/2000"
                          className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5] transition-all pr-10"
                        />
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Legal Checkbox 1 */}
                    <div className="space-y-1 bg-slate-50/40 p-3.5 rounded-xl border border-slate-100">
                      <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={confirmAuthorized}
                          onChange={(e) => setConfirmAuthorized(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-[#5046E5] focus:ring-[#5046E5]"
                        />
                        <span>
                          I confirm that I am legally authorized to work from{" "}
                          {selectedCountryName}. *
                        </span>
                      </label>
                      <div className="pl-6 text-[11px] text-slate-500 leading-relaxed space-y-1">
                        <p>By checking this box, you represent and warrant that:</p>
                        <p>
                          1. You have all necessary visas, permits, and/or legal
                          rights to work from the country you have indicated.
                        </p>
                        <p>
                          2. You will defend, indemnify, and hold harmless Flowboard
                          from any claims, losses, or liabilities arising from your
                          failure to maintain proper work authorization.
                        </p>
                      </div>
                    </div>

                    {/* Legal Checkbox 2 */}
                    <div className="space-y-1 bg-slate-50/40 p-3.5 rounded-xl border border-slate-100">
                      <label className="flex items-start gap-2.5 text-xs font-semibold text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeRemainLocation}
                          onChange={(e) => setAgreeRemainLocation(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-[#5046E5] focus:ring-[#5046E5]"
                        />
                        <span>
                          I agree to remain working from {selectedCountryName}, and
                          to notify Flowboard in writing prior to any change. *
                        </span>
                      </label>
                      <div className="pl-6 text-[11px] text-slate-500 leading-relaxed space-y-1">
                        <p>By checking this box, you agree to:</p>
                        <p>
                          1. Continue working only from the country specified above
                          unless you have provided Flowboard with prior written
                          notice of your intended change of work location.
                        </p>
                        <p>
                          2. Obtain and maintain proper work authorization for any
                          future country from which you intend to work before
                          beginning work from that country.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Digital signature */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Digital signature
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Please provide your digital signature to confirm your
                      agreement.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Full legal name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <span>Signature</span>
                        <Info className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        value={digitalSignature}
                        onChange={(e) => setDigitalSignature(e.target.value)}
                        placeholder="Ex: John Doe"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-[#5046E5]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-800">
                        Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={signatureDate}
                        className="w-full bg-slate-100/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-600 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={() => setStep(4)}
                    disabled={!confirmAuthorized || !agreeRemainLocation}
                    className="w-full bg-[#5046E5] hover:bg-[#4338CA] text-white font-semibold h-12 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 disabled:opacity-50"
                  >
                    Save work authorization
                  </Button>
                  <p className="text-[11px] text-slate-400 text-center font-normal">
                    By completing this section, you confirm you've reviewed and
                    agree with Flowboard's{" "}
                    <span className="font-semibold text-slate-600 underline cursor-pointer">
                      Terms and Conditions
                    </span>
                    .
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RESUME UPLOAD */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Upload a recent resume or CV
                </h1>
                <p className="text-slate-500 text-sm font-normal max-w-md mx-auto">
                  Autofill your profile in seconds by uploading your resume
                </p>
              </div>

              {/* Green Tip Callout Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-full px-4 py-2 text-xs font-medium text-emerald-800 flex items-center justify-center gap-2 w-fit mx-auto shadow-sm">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  Tip: Hiring managers are more likely to reach out when they
                  see a resume attached
                </span>
              </div>

              <div className="space-y-6 pt-2">
                {/* Upload Drag & Drop Box */}
                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-3xl p-10 bg-slate-50/40 hover:bg-slate-50 transition-all text-center group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] || null)
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />

                  {isUploading ? (
                    <div className="py-6 flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-[#5046E5] animate-spin" />
                      <p className="text-xs font-semibold text-slate-600">
                        Uploading your resume...
                      </p>
                    </div>
                  ) : resumeFile ? (
                    <div className="py-4 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <FileCheck2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB PDF
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 py-4">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5 text-[#5046E5]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Upload PDF Resume
                        </p>
                        <p className="text-xs text-slate-400 font-normal mt-0.5">
                          Drag and drop your file here, or click to browse (Max 3MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-500 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noResume}
                      onChange={(e) => setNoResume(e.target.checked)}
                      className="rounded border-slate-300 text-[#5046E5] focus:ring-[#5046E5]"
                    />
                    <span>I don't have a resume to upload right now</span>
                  </label>
                </div>

                <Button
                  onClick={() => setStep(5)}
                  disabled={!resumeFile && !noResume}
                  className="w-full bg-[#5046E5] hover:bg-[#4338CA] text-white font-semibold h-12 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 mt-4 disabled:opacity-50"
                >
                  Continue to review
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & COMPLETE */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  You're all set!
                </h1>
                <p className="text-slate-500 text-sm font-normal max-w-md mx-auto">
                  Review your profile summary below to complete onboarding and launch your dashboard
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-500">Name</span>
                    <span className="text-sm font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-500">Location</span>
                    <span className="text-sm font-bold text-slate-900">{city}, {selectedCountryName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <span className="text-xs font-semibold text-slate-500">Work Authorization</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Verified ✓
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Attached Resume</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                      {resumeFile ? resumeFile.name : "None attached"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleFinish}
                  disabled={isLoading}
                  className="w-full bg-[#5046E5] hover:bg-[#4338CA] text-white font-semibold h-12 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/10 mt-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Complete profile & launch dashboard"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
