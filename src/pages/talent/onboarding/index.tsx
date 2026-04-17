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
} from "lucide-react";
import { Country, City } from "country-state-city";

const LANGUAGE_OPTIONS = [
  "English",
  "French",
  "Spanish",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Twi",
  "Yoruba",
  "Swahili",
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

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return [];
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
      .slice(0, 8); // Limit to 8 for performance
  }, [countrySearch, allCountries]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch) return [];
    return cities
      .filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
      .slice(0, 8);
  }, [citySearch, cities]);

  // When country changes, load cities for that country
  useEffect(() => {
    if (selectedCountry) {
      const countryCities = City.getCitiesOfCountry(selectedCountry.isoCode);
      setCities(countryCities || []);
    }
  }, [selectedCountry]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(filePath);
        resumePublicUrl = publicUrl;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("profiles").upsert({
        id: authUser.id,
        full_name: authUser.user_metadata?.full_name || "Anonymous User", // Add this line!
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
    // Added bg-[#050B1E] and changed flex properties to ensure coverage
    <div className="flex flex-col min-h-screen bg-[#050B1E] text-white selection:bg-emerald-500/30">
      {/* Background Glow - Fixed positioning to stay centered regardless of scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] blur-[120px] rounded-none bg-emerald-500/10 opacity-50" />
      </div>

      {/* Content wrapper with flex-grow to push footer/bottom if needed */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 py-12 md:p-8">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[700px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-none md:rounded-none p-6 md:p-12 shadow-2xl"
        >
          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12">
            <div
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-none border transition-all ${step === 1 ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-slate-500"}`}
            >
              <Briefcase className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                Experience
              </span>
            </div>
            <div className="w-6 md:w-8 h-[1px] bg-white/10" />
            <div
              className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-none border transition-all ${step === 2 ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-slate-500"}`}
            >
              <FileText className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                Resume
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">
                    Professional Identity
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">
                    Tell us who you are and where you're based.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                      Professional Title
                    </label>
                    <input
                      value={details.primaryRole}
                      onChange={(e) =>
                        setDetails({ ...details, primaryRole: e.target.value })
                      }
                      placeholder="e.g. Lead Software Engineer"
                      className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* COUNTRY SELECT */}
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Country
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setShowCountrySuggestions(true);
                          }}
                          onFocus={() => setShowCountrySuggestions(true)}
                          placeholder="Search country..."
                          className="w-full bg-white/5 border border-white/10 rounded-none p-4 pl-12 text-sm outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>

                      {showCountrySuggestions &&
                        filteredCountries.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-[#0A1229] border border-white/10 rounded-none shadow-2xl overflow-hidden">
                            {filteredCountries.map((c) => (
                              <div
                                key={c.isoCode}
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setCountrySearch(c.name);
                                  setShowCountrySuggestions(false);
                                  setCitySearch(""); // Reset city when country changes
                                }}
                                className="p-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors border-b border-white/5 last:border-none"
                              >
                                {c.flag} {c.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* CITY SELECT */}
                    <div
                      className={`space-y-2 relative ${!selectedCountry ? "opacity-50" : ""}`}
                    >
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        City
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          disabled={!selectedCountry}
                          value={citySearch}
                          onChange={(e) => {
                            setCitySearch(e.target.value);
                            setShowCitySuggestions(true);
                          }}
                          onFocus={() => setShowCitySuggestions(true)}
                          placeholder={
                            selectedCountry
                              ? "Search city..."
                              : "Select country first"
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-none p-4 pl-12 text-sm outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>

                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute z-[110] w-full mt-2 bg-[#0A1229] border border-white/10 rounded-none shadow-2xl overflow-hidden">
                          {filteredCities.map((city) => (
                            <div
                              key={`${city.name}-${city.latitude}`}
                              onClick={() => {
                                const fullLocation = `${city.name}, ${selectedCountry.name}`;
                                setCitySearch(city.name);
                                setDetails({
                                  ...details,
                                  location: fullLocation,
                                });
                                setShowCitySuggestions(false);
                              }}
                              className="p-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors border-b border-white/5 last:border-none"
                            >
                              {city.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Experience Level
                    </label>
                    <div className="relative">
                      <select
                        value={details.experienceLevel}
                        onChange={(e) =>
                          setDetails({
                            ...details,
                            experienceLevel: e.target.value,
                          })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-sm outline-none appearance-none cursor-pointer focus:border-emerald-500"
                      >
                        <option value="" className="bg-[#050B1E]">
                          Select Level
                        </option>
                        <option value="1-3" className="bg-[#050B1E]">
                          1-3 Years
                        </option>
                        <option value="4-7" className="bg-[#050B1E]">
                          4-7 Years
                        </option>
                        <option value="8+" className="bg-[#050B1E]">
                          8+ Years
                        </option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>

                  <div
                    className="md:col-span-2 space-y-2 relative"
                    ref={langRef}
                  >
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      Languages Spoken
                    </label>
                    <div
                      onClick={() => setShowLangDropdown(!showLangDropdown)}
                      className="min-h-[56px] w-full bg-white/5 border border-white/10 rounded-none p-3 flex flex-wrap gap-2 cursor-pointer hover:border-emerald-500/30 transition-all"
                    >
                      {details.languages.length === 0 && (
                        <span className="text-slate-500 text-sm ml-2 mt-1">
                          Select multiple...
                        </span>
                      )}
                      {details.languages.map((lang) => (
                        <span
                          key={lang}
                          className="bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold px-3 py-1 rounded-none flex items-center gap-2 border border-emerald-500/30 animate-in zoom-in-95"
                        >
                          {lang}{" "}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLanguage(lang);
                            }}
                          />
                        </span>
                      ))}
                      <ChevronDown className="ml-auto mt-1 w-4 h-4 text-slate-500" />
                    </div>

                    {showLangDropdown && (
                      <div className="absolute z-[100] w-full mt-2 bg-[#0A1229] border border-white/10 rounded-none shadow-2xl p-2 grid grid-cols-2 gap-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                        {LANGUAGE_OPTIONS.map((lang) => (
                          <div
                            key={lang}
                            onClick={() => toggleLanguage(lang)}
                            className={`flex items-center justify-between p-2.5 rounded-none cursor-pointer text-xs md:text-sm transition-all ${details.languages.includes(lang) ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-white/5 text-slate-300"}`}
                          >
                            {lang}
                            {details.languages.includes(lang) && (
                              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Complete}
                  className="w-full h-14 md:h-16 bg-emerald-600 hover:bg-emerald-500 text-[#050B1E] rounded-none md:rounded-none font-black text-base md:text-lg disabled:opacity-20 transition-all shadow-xl shadow-emerald-500/10 uppercase italic tracking-widest"
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
                className="space-y-6 md:space-y-8 text-center"
              >
                <div>
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-none flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Upload className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">
                    Document Upload
                  </h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">
                    Upload your latest PDF CV to finish registration.
                  </p>
                </div>

                <div className="group relative">
                  <div
                    className={`border-2 border-dashed rounded-none md:rounded-none p-8 md:p-12 transition-all duration-300 ${details.resumeFile ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/[0.01] hover:bg-white/[0.03]"}`}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          resumeFile: e.target.files?.[0] || null,
                        })
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    {details.resumeFile ? (
                      <div className="flex flex-col items-center animate-in zoom-in-95">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                        <p className="font-bold text-emerald-400 truncate max-w-[180px] md:max-w-[250px]">
                          {details.resumeFile.name}
                        </p>
                        <p className="text-[10px] text-emerald-500/50 uppercase font-black tracking-widest mt-1">
                          Verified Format
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-bold text-sm md:text-lg">
                          Click to select PDF CV
                        </p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest">
                          Maximum file size: 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleFinish}
                    disabled={isLoading || !details.resumeFile}
                    className={`h-14 md:h-16 rounded-none md:rounded-none font-black text-base md:text-lg transition-all ${details.resumeFile ? "bg-emerald-600 hover:bg-emerald-500 text-[#050B1E] shadow-xl shadow-emerald-500/20" : "bg-white/5 text-slate-600"}`}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "FINISH REGISTRATION"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="h-14 rounded-none text-slate-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
                  >
                    Go back to info
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <style>{`
  html, body {
    background-color: #050B1E !important;
    margin: 0;
    padding: 0;
    min-height: 100%;
    overflow-x: hidden;
  }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { 
    background: rgba(16, 185, 129, 0.2); 
    border-radius: 10px; 
  }
`}</style>
    </div>
  );
}
