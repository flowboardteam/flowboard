"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MapPin,
  Building2,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  X,
  Users,
} from "lucide-react";
import { Country, City } from "country-state-city";

const INDUSTRY_OPTIONS = [
  "AI & Machine Learning",
  "FinTech",
  "HealthTech",
  "SaaS",
  "Web3 & Crypto",
  "E-commerce",
  "Cybersecurity",
  "Manufacturing",
  "Real Estate",
  "Education",
  "Logistics",
];

const TEAM_SIZE_OPTIONS = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "500+ employees",
];

export default function ClientOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [details, setDetails] = useState({
    companyName: "",
    industry: "",
    teamSize: "",
    location: "",
  });

  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);

  const filteredIndustries = useMemo(() => {
    return INDUSTRY_OPTIONS.filter((i) =>
      i.toLowerCase().includes(industrySearch.toLowerCase())
    );
  }, [industrySearch]);

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
      setCities(City.getCitiesOfCountry(selectedCountry.isoCode) || []);
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
  }, []);

  const isStep1Complete = useMemo(() => {
    return (
      details.companyName.length > 1 &&
      details.location !== "" &&
      details.industry !== ""
    );
  }, [details]);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Auth session expired");

      localStorage.setItem(`onboarding_completed_${user.id}`, "true");

      // Update auth metadata so session knows onboarding is complete
      await supabase.auth.updateUser({
        data: { onboarding_completed: true }
      });

      const payload = {
        id: user.id,
        full_name: user.user_metadata?.full_name || "Anonymous Client",
        role_type: "client",
        onboarding_completed: true,
        location: details.location,
        company_name: details.companyName,
        industry: details.industry,
        team_size: details.teamSize,
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true, role_type: "client", company_name: details.companyName, location: details.location })
        .eq("id", user.id);

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        console.warn("Client onboarding profile update note:", error.message);
      }

      // Seed default 'My Workplace' organization if none exists
      try {
        const { data: existingGroups } = await supabase
          .from("groups")
          .select("id")
          .eq("organization_id", user.id);

        const { data: memberGroups } = await supabase
          .from("group_members")
          .select("id")
          .eq("user_id", user.id);

        const hasAnyGroup =
          (existingGroups && existingGroups.length > 0) ||
          (memberGroups && memberGroups.length > 0);

        if (!hasAnyGroup) {
          await supabase.from("groups").insert({
            name: details.companyName || "My Workplace",
            organization_id: user.id,
            status: "active",
            is_primary: true,
            admin_count: 1,
            contract_count: 0,
          });
        }
      } catch (err) {
        console.error("Failsafe error during default group seeding:", err);
      }

      toast.success("Organization Profile Created!");
      navigate("/client/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9FB] font-sans text-[#1A1C21] selection:bg-slate-100 overflow-x-hidden">
      {/* ── TOP STEPPER HEADER ────────────────────────────────────────────── */}
      <header className="w-full max-w-4xl mx-auto pt-6 px-6">
        {/* Horizontal Progress Stepper Bars */}
        <div className="flex gap-2.5 mb-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-slate-200/70 transition-all duration-300"
            >
              <div
                className={`h-full transition-all duration-500 ${
                  i <= step ? "bg-[#1A1C21]" : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Action Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
          <div className="w-10">
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="w-10 flex justify-end">
            <button
              onClick={() => navigate("/client/dashboard")}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
              title="Close setup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────── */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 py-8 md:p-8">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[700px] bg-white border border-[#EEEEF0] rounded-[32px] p-8 md:p-14 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)]"
        >
          <div className="max-w-[480px] mx-auto text-center space-y-10">
            {/* Header Title Section */}
            <div className="space-y-2">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1C21]">
                  {step === 1 ? "Company identity" : "Team metrics"}
                </h2>
                <p className="text-slate-500 font-normal text-sm md:text-base">
                  {step === 1
                    ? "Founding details for your organization."
                    : "Select your team size and operational scope."}
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
                  className="space-y-6 text-left"
                >
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Company Name
                    </label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A1C21] transition-colors" />
                      <input
                        value={details.companyName}
                        onChange={(e) =>
                          setDetails({ ...details, companyName: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
                        className="w-full bg-slate-50 border border-[#EEEEF0] rounded-xl p-3.5 pl-11 text-sm font-medium text-slate-900 outline-none focus:border-[#1A1C21] focus:bg-white transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700">
                      Industry
                    </label>
                    <div className="relative group">
                      <input
                        value={industrySearch || details.industry}
                        onChange={(e) => {
                          setIndustrySearch(e.target.value);
                          setDetails({ ...details, industry: e.target.value });
                          setShowIndustrySuggestions(true);
                        }}
                        onFocus={() => setShowIndustrySuggestions(true)}
                        placeholder="Select or search industry..."
                        className="w-full bg-slate-50 border border-[#EEEEF0] rounded-xl p-3.5 text-sm font-medium text-slate-900 outline-none focus:border-[#1A1C21] focus:bg-white transition-all placeholder:text-slate-400"
                      />
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {showIndustrySuggestions && filteredIndustries.length > 0 && (
                      <div className="absolute z-[110] w-full mt-1.5 bg-white border border-[#EEEEF0] rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {filteredIndustries.map((ind) => (
                          <div
                            key={ind}
                            onClick={() => {
                              setDetails({ ...details, industry: ind });
                              setIndustrySearch(ind);
                              setShowIndustrySuggestions(false);
                            }}
                            className="p-3 hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-colors border-b border-[#EEEEF0] last:border-none"
                          >
                            {ind}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Country & City Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs font-bold text-slate-700">
                        Country
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A1C21] transition-colors" />
                        <input
                          value={countrySearch}
                          onChange={(e) => {
                            setCountrySearch(e.target.value);
                            setShowCountrySuggestions(true);
                          }}
                          onFocus={() => setShowCountrySuggestions(true)}
                          placeholder="Search country..."
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-xl p-3.5 pl-11 text-sm font-medium text-slate-900 outline-none focus:border-[#1A1C21] focus:bg-white transition-all"
                        />
                      </div>
                      {showCountrySuggestions && filteredCountries.length > 0 && (
                        <div className="absolute z-[110] w-full mt-1.5 bg-white border border-[#EEEEF0] rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <div
                              key={c.isoCode}
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountrySearch(c.name);
                                setShowCountrySuggestions(false);
                                setCitySearch("");
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-colors border-b border-[#EEEEF0] last:border-none"
                            >
                              {c.flag} {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div
                      className={`space-y-1.5 relative ${
                        !selectedCountry ? "opacity-50" : ""
                      }`}
                    >
                      <label className="text-xs font-bold text-slate-700">
                        City
                      </label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1A1C21] transition-colors" />
                        <input
                          disabled={!selectedCountry}
                          value={citySearch}
                          onChange={(e) => {
                            setCitySearch(e.target.value);
                            setShowCitySuggestions(true);
                          }}
                          onFocus={() => setShowCitySuggestions(true)}
                          placeholder="Search city..."
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-xl p-3.5 pl-11 text-sm font-medium text-slate-900 outline-none focus:border-[#1A1C21] focus:bg-white transition-all"
                        />
                      </div>
                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute z-[110] w-full mt-1.5 bg-white border border-[#EEEEF0] rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                          {filteredCities.map((cityItem) => (
                            <div
                              key={`${cityItem.name}-${cityItem.latitude}`}
                              onClick={() => {
                                setCitySearch(cityItem.name);
                                setDetails({
                                  ...details,
                                  location: `${cityItem.name}, ${selectedCountry.name}`,
                                });
                                setShowCitySuggestions(false);
                              }}
                              className="p-3 hover:bg-slate-50 cursor-pointer text-xs font-semibold transition-colors border-b border-[#EEEEF0] last:border-none"
                            >
                              {cityItem.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Complete}
                    className="w-full h-12 bg-[#1A1C21] hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-900/5 disabled:opacity-30 mt-4"
                  >
                    Continue to Team Metrics
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6 text-left"
                >
                  {/* Team Size Option Cards */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Team Size
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {TEAM_SIZE_OPTIONS.map((ts) => (
                        <div
                          key={ts}
                          onClick={() => setDetails({ ...details, teamSize: ts })}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                            details.teamSize === ts
                              ? "border-[#1A1C21] bg-slate-50 text-[#1A1C21]"
                              : "border-[#EEEEF0] bg-slate-50 hover:bg-white text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-semibold">{ts}</span>
                          </div>
                          {details.teamSize === ts && (
                            <div className="w-2 h-2 rounded-full bg-[#1A1C21]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleFinish}
                      disabled={isLoading || !details.teamSize}
                      className="h-12 bg-[#1A1C21] hover:bg-black text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-slate-900/5 disabled:opacity-30"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      ) : (
                        "Create Organization Profile"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
