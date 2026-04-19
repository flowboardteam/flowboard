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
  Globe,
  Search,
  PlusCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Country, City } from "country-state-city";

const INDUSTRY_OPTIONS = [
  "AI & Machine Learning", "FinTech", "HealthTech", "SaaS", "Web3 & Crypto",
  "E-commerce", "Cybersecurity", "Manufacturing", "Real Estate", "Education", "Logistics",
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
  }, []);

  const isStep1Complete = useMemo(() => {
    return details.companyName.length > 1 && details.location !== "" && details.industry !== "";
  }, [details]);

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("Auth session expired");

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
      
      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      toast.success("Organization Profile Created!");
      setTimeout(() => navigate("/client/dashboard", { replace: true }), 1500);

    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9F9FB] font-jakarta text-[#1A1C21] selection:bg-emerald-500/10 overflow-x-hidden">
      {/* Premium Header Decoration */}
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 py-12 md:p-8">
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[750px] bg-white border border-[#EEEEF0] rounded-[40px] p-8 md:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
        >
          <div className="max-w-[500px] mx-auto text-center space-y-12">
            {/* Step Icon & Title Section */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/5 text-emerald-600 rounded-2xl border border-emerald-500/10">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Flowboard Client Setup</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1A1C21] leading-none mb-1">
                  {step === 1 ? "Company identity" : "Team metrics"}
                </h2>
                <p className="text-slate-500 font-bold text-sm md:text-base px-4">
                  {step === 1 ? "Founding details for your organization." : "How large is your current operation?"}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8 text-left">
                  <div className="space-y-6">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Company Name</label>
                      <div className="relative group">
                         <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                         <input
                          value={details.companyName}
                          onChange={(e) => setDetails({ ...details, companyName: e.target.value })}
                          placeholder="e.g. Acme Corp"
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Industry</label>
                      <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                          value={industrySearch}
                          onChange={(e) => {
                            setIndustrySearch(e.target.value);
                            setDetails({ ...details, industry: e.target.value });
                            setShowIndustrySuggestions(true);
                          }}
                          onFocus={() => setShowIndustrySuggestions(true)}
                          placeholder="Search or type industry..."
                          className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                        />
                      </div>
                      {showIndustrySuggestions && industrySearch.length > 0 && (
                        <div className="absolute z-[120] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                          {filteredIndustries.map((ind) => (
                            <div key={ind} onClick={() => { setDetails({...details, industry: ind}); setIndustrySearch(ind); setShowIndustrySuggestions(false); }} className="p-4 hover:bg-emerald-500/5 cursor-pointer text-sm font-bold border-b border-[#EEEEF0] last:border-none">
                              {ind}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Country</label>
                        <div className="relative group">
                           <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                           <input
                            value={countrySearch}
                            onChange={(e) => { setCountrySearch(e.target.value); setShowCountrySuggestions(true); }}
                            onFocus={() => setShowCountrySuggestions(true)}
                            placeholder="Country"
                            className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                          />
                        </div>
                        {showCountrySuggestions && filteredCountries.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredCountries.map((c) => (
                              <div key={c.isoCode} onClick={() => { setSelectedCountry(c); setCountrySearch(c.name); setShowCountrySuggestions(false); setCitySearch(""); }} className="p-4 hover:bg-emerald-500/5 cursor-pointer text-sm font-bold border-b border-[#EEEEF0] last:border-none">
                                {c.flag} {c.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={`space-y-2 relative ${!selectedCountry ? "opacity-40" : ""}`}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">City</label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input
                            disabled={!selectedCountry}
                            value={citySearch}
                            onChange={(e) => { setCitySearch(e.target.value); setShowCitySuggestions(true); }}
                            onFocus={() => setShowCitySuggestions(true)}
                            placeholder="City"
                            className="w-full bg-slate-50 border border-[#EEEEF0] rounded-2xl p-5 pl-12 text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all"
                          />
                        </div>
                        {showCitySuggestions && filteredCities.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-white border border-[#EEEEF0] rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredCities.map((city) => (
                              <div key={city.name} onClick={() => { setCitySearch(city.name); setDetails({...details, location: `${city.name}, ${selectedCountry.name}`}); setShowCitySuggestions(false); }} className="p-4 hover:bg-emerald-500/5 cursor-pointer text-sm font-bold border-b border-[#EEEEF0] last:border-none">
                                {city.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Complete}
                    className="w-full h-16 bg-[#1A1C21] hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-20 transition-all shadow-xl shadow-slate-900/10 mt-4"
                  >
                    Next Step
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                  <div className="grid grid-cols-2 gap-3">
                    {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setDetails({ ...details, teamSize: size })}
                        className={`p-5 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${details.teamSize === size ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-sm shadow-emerald-500/10" : "bg-slate-50 border-[#EEEEF0] text-slate-400 hover:border-emerald-500/30"}`}
                      >
                        {size} Employees
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 pt-4">
                    <Button
                      onClick={handleFinish}
                      disabled={isLoading || !details.teamSize}
                      className="h-16 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xl shadow-emerald-500/10"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : "Finish Setup"}
                    </Button>
                    <button onClick={() => setStep(1)} className="text-slate-400 hover:text-[#1A1C21] text-xs font-black uppercase tracking-widest transition-colors py-2">
                       Back to Company Info
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