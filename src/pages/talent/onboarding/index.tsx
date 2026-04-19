"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  CheckCircle2,
  Upload,
  ChevronDown,
  X,
  Briefcase,
  FileText,
  Sparkles,
} from "lucide-react";
import { Country, City } from "country-state-city";

const LANGUAGE_OPTIONS = [
  "English", "French", "Spanish", "German", "Portuguese",
  "Arabic", "Chinese", "Twi", "Yoruba", "Swahili",
];

export default function TalentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [details, setDetails] = useState({
    primaryRole: "",
    experienceLevel: "",
    primarySkill: "",
    location: "",
    languages: [] as string[],
    resumeFile: null as File | null,
  });

  const [locInput, setLocInput] = useState("");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [allCountries] = useState(Country.getAllCountries());
  const [cities, setCities] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return [];
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
      .slice(0, 8);
  }, [countrySearch, allCountries]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
      .slice(0, 8);
  }, [citySearch, cities]);

  useEffect(() => {
    if (selectedCountry) {
      const countryCities = City.getCitiesOfCountry(selectedCountry.isoCode);
      setCities(countryCities || []);
    }
  }, [selectedCountry]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();

    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node))
        setShowLangDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLanguage = (lang: string) => {
    setDetails((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const isStep1Complete = useMemo(() => {
    return (
      details.primaryRole.length > 2 &&
      details.experienceLevel !== "" &&
      details.location !== "" &&
      details.languages.length > 0
    );
  }, [details]);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Auth session expired");
      let resumePublicUrl = "";

      if (details.resumeFile) {
        const filePath = `${user.id}/resume_${Date.now()}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, details.resumeFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("resumes").getPublicUrl(filePath);
        resumePublicUrl = publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "Anonymous User",
        role_type: "talent",
        onboarding_completed: true,
        location: details.location,
        primary_role: details.primaryRole,
        experience_level: details.experienceLevel,
        languages: details.languages,
        resume_url: resumePublicUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Profile verified!");
      setTimeout(() => navigate("/talent/dashboard", { replace: true }), 1500);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9FB] font-jakarta text-[#1A1C21] selection:bg-emerald-500/10">
      {/* Premium Header Decoration */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
      
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 py-12 md:p-8">
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[750px] bg-white border border-[#EEEEF0] rounded-[40px] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
        >
          {/* Content wrapper with fixed hierarchy */}
          <div className="max-w-[500px] mx-auto text-center space-y-12">
            {/* Step Icon & Title Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 text-emerald-600 rounded-2xl border border-emerald-500/10">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Flowboard Onboarding</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1A1C21] leading-none mb-1">
                  {step === 1 ? "Professional identity" : "Document upload"}
                </h2>
                <p className="text-slate-500 font-bold text-sm md:text-base px-4">
                  {step === 1 ? "Tell us who you are and where you're based." : "Upload your latest PDF CV to finish registration."}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8 text-left"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Title</label>
                      <div className="relative group">
                         <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                         <input
                          value={details.primaryRole}
                          onChange={(e) => setDetails({ ...details, primaryRole: e.target.value })}
                          placeholder="e.g. Lead Software Engineer"
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* COUNTRY SELECT */}
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Country</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            value={countrySearch}
                            onChange={(e) => { setCountrySearch(e.target.value); setShowCountrySuggestions(true); }}
                            onFocus={() => setShowCountrySuggestions(true)}
                            placeholder="Country..."
                            className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                          />
                        </div>
                        {showCountrySuggestions && filteredCountries.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                            {filteredCountries.map((c) => (
                              <div key={c.isoCode} onClick={() => { setSelectedCountry(c); setCountrySearch(c.name); setShowCountrySuggestions(false); setCitySearch(""); }} className="p-4 hover:bg-emerald-500/5 cursor-pointer text-sm font-bold transition-colors border-b border-[#EEEEF0] last:border-none">
                                {c.flag} {c.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CITY SELECT */}
                      <div className={`space-y-2 relative ${!selectedCountry ? "opacity-40" : ""}`}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">City</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            disabled={!selectedCountry}
                            value={citySearch}
                            onChange={(e) => { setCitySearch(e.target.value); setShowCitySuggestions(true); }}
                            onFocus={() => setShowCitySuggestions(true)}
                            placeholder="City..."
                            className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                          />
                        </div>
                        {showCitySuggestions && filteredCities.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                            {filteredCities.map((city) => (
                              <div key={`${city.name}-${city.latitude}`} onClick={() => { setCitySearch(city.name); setDetails({ ...details, location: `${city.name}, ${selectedCountry.name}` }); setShowCitySuggestions(false); }} className="p-4 hover:bg-emerald-500/5 cursor-pointer text-sm font-bold transition-colors border-b border-[#EEEEF0] last:border-none">
                                {city.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Experience Level</label>
                       <div className="relative group">
                         <select
                          value={details.experienceLevel}
                          onChange={(e) => setDetails({ ...details, experienceLevel: e.target.value })}
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 text-sm font-bold outline-none appearance-none cursor-pointer focus:border-emerald-500 focus:bg-white transition-all"
                         >
                          <option value="">Select Experience</option>
                          <option value="1-3">1-3 Years</option>
                          <option value="4-7">4-7 Years</option>
                          <option value="8+">8+ Years</option>
                         </select>
                         <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                       </div>
                    </div>

                    <div className="space-y-2 relative" ref={langRef}>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Languages</label>
                      <div
                        onClick={() => setShowLangDropdown(!showLangDropdown)}
                        className="min-h-[60px] w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-3 flex flex-wrap gap-2 cursor-pointer hover:border-emerald-500/30 transition-all"
                      >
                        {details.languages.length === 0 && (
                          <span className="text-slate-400 text-sm font-bold ml-2 mt-1.5">Select languages...</span>
                        )}
                        {details.languages.map((lang) => (
                          <span key={lang} className="bg-emerald-500/5 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-2 border border-emerald-500/10">
                            {lang} <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleLanguage(lang); }} />
                          </span>
                        ))}
                      </div>
                      {showLangDropdown && (
                        <div className="absolute z-[100] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl p-2 grid grid-cols-2 gap-1 max-h-[200px] overflow-y-auto">
                          {LANGUAGE_OPTIONS.map((lang) => (
                            <div key={lang} onClick={() => toggleLanguage(lang)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-sm font-bold transition-all ${details.languages.includes(lang) ? "bg-emerald-500/10 text-emerald-600" : "hover:bg-slate-50 text-slate-600"}`}>
                              {lang} {details.languages.includes(lang) && <CheckCircle2 className="w-4 h-4" />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Complete}
                    className="w-full h-16 bg-[#1A1C21] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-20 transition-all shadow-xl shadow-slate-900/10 mt-4"
                  >
                    Continue to Resume
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div className="group relative">
                    <div className={`border-2 border-dashed rounded-[32px] p-12 md:p-16 transition-all duration-300 ${details.resumeFile ? "border-emerald-500 bg-emerald-500/5" : "border-[#EEEEF0] bg-slate-50 hover:bg-white hover:border-emerald-500/30"}`}>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setDetails({ ...details, resumeFile: e.target.files?.[0] || null })}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      {details.resumeFile ? (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <CheckCircle2 className="w-10 h-10" />
                          </div>
                          <div className="space-y-1">
                             <p className="font-black text-lg text-[#1A1C21]">Ready to go!</p>
                             <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{details.resumeFile.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-white rounded-2xl border border-[#EEEEF0] flex items-center justify-center mx-auto shadow-sm">
                            <Upload className="w-6 h-6 text-slate-400" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-base text-[#1A1C21]">Drop your PDF CV</p>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">or click to browse files</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={handleFinish}
                      disabled={isLoading || !details.resumeFile}
                      className={`h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${details.resumeFile ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Verify Profile"}
                    </Button>
                    <button
                      onClick={() => setStep(1)}
                      className="text-slate-400 hover:text-[#1A1C21] text-xs font-black uppercase tracking-widest transition-colors py-2"
                    >
                      Go back
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      <style>{`
        body { background-color: #F9F9FB !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
