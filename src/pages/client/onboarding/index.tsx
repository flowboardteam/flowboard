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

  // Industry Search Logic
  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);

  const filteredIndustries = useMemo(() => {
    const filtered = INDUSTRY_OPTIONS.filter((i) =>
      i.toLowerCase().includes(industrySearch.toLowerCase())
    );
    return filtered;
  }, [industrySearch]);

  // Country/City Logic
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Auth session expired");

    // Log the data we are sending to make sure it's clean
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
    
    console.log("Sending payload:", payload);

    const { error, data } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: 'id' }) // Explicitly handle conflict on ID
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    console.log("Success data:", data);
    toast.success("Organization Profile Created!");
    
    // Give the toast a moment to show before navigating
    setTimeout(() => {
      navigate("/client/dashboard", { replace: true });
    }, 1500);

  } catch (error: any) {
    console.error("Catch Error:", error.message);
    toast.error(error.message || "Failed to save profile");
    setIsLoading(false); // Reset loading only on error so user can try again
  }
};

  return (
    <div className="flex flex-col min-h-screen bg-[#0A1229] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] blur-[120px] rounded-full bg-indigo-500/10 opacity-50" />
      </div>

      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 py-8 md:p-8">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[650px] bg-white/[0.02] border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 md:p-10 shadow-2xl"
        >
          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${step === 1 ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
              <Building2 className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Company</span>
            </div>
            <div className="w-4 md:w-8 h-[1px] bg-white/10" />
            <div className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border transition-all ${step === 2 ? "bg-indigo-500/10 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
              <Globe className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Scaling</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 md:space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white">Company Identity</h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">Founding details for your organization.</p>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Company Name</label>
                    <input
                      value={details.companyName}
                      onChange={(e) => setDetails({ ...details, companyName: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Industry Search/Manual Input */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Industry</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        value={industrySearch}
                        onChange={(e) => {
                          setIndustrySearch(e.target.value);
                          setDetails({ ...details, industry: e.target.value });
                          setShowIndustrySuggestions(true);
                        }}
                        onFocus={() => setShowIndustrySuggestions(true)}
                        placeholder="Search or type industry..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    {showIndustrySuggestions && industrySearch.length > 0 && (
                      <div className="absolute z-[120] w-full mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                        {filteredIndustries.map((ind) => (
                          <div key={ind} onClick={() => { setDetails({...details, industry: ind}); setIndustrySearch(ind); setShowIndustrySuggestions(false); }} className="p-3 hover:bg-indigo-500/10 cursor-pointer text-sm border-b border-white/5">
                            {ind}
                          </div>
                        ))}
                        {!filteredIndustries.includes(industrySearch) && (
                           <div onClick={() => setShowIndustrySuggestions(false)} className="p-3 bg-indigo-500/5 text-indigo-400 text-xs font-bold flex items-center gap-2 cursor-pointer">
                             <PlusCircle className="w-3 h-3" /> Use custom: "{industrySearch}"
                           </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Location Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Country</label>
                      <input
                        value={countrySearch}
                        onChange={(e) => { setCountrySearch(e.target.value); setShowCountrySuggestions(true); }}
                        onFocus={() => setShowCountrySuggestions(true)}
                        placeholder="Country"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 transition-all"
                      />
                      {showCountrySuggestions && filteredCountries.length > 0 && (
                        <div className="absolute z-[110] w-full mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                          {filteredCountries.map((c) => (
                            <div key={c.isoCode} onClick={() => { setSelectedCountry(c); setCountrySearch(c.name); setShowCountrySuggestions(false); setCitySearch(""); }} className="p-3 hover:bg-indigo-500/10 cursor-pointer text-sm">
                              {c.flag} {c.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">City</label>
                      <input
                        disabled={!selectedCountry}
                        value={citySearch}
                        onChange={(e) => { setCitySearch(e.target.value); setShowCitySuggestions(true); }}
                        placeholder="City"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-indigo-500 transition-all disabled:opacity-30"
                      />
                      {showCitySuggestions && filteredCities.length > 0 && (
                        <div className="absolute z-[110] w-full mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl max-h-40 overflow-y-auto">
                          {filteredCities.map((city) => (
                            <div key={city.name} onClick={() => { setCitySearch(city.name); setDetails({...details, location: `${city.name}, ${selectedCountry.name}`}); setShowCitySuggestions(false); }} className="p-3 hover:bg-indigo-500/10 cursor-pointer text-sm">
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
                  className="w-full h-14 md:h-16 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-base md:text-lg disabled:opacity-20 transition-all uppercase italic tracking-widest"
                >
                  Next Step
                </Button>
              </motion.div>
            ) : (
              <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white">Team Metrics</h2>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">How large is your current operation?</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setDetails({ ...details, teamSize: size })}
                        className={`p-4 rounded-xl border text-xs font-bold transition-all ${details.teamSize === size ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20"}`}
                      >
                        {size} Employees
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={handleFinish}
                    disabled={isLoading || !details.teamSize}
                    className="h-14 md:h-16 rounded-2xl font-black text-base md:text-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all uppercase italic tracking-widest"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Finish Setup"}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-white text-xs font-bold">
                    Back to Company Info
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}