import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Filter, 
  Loader2, 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  ChevronRight,
  Clock,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle2,
  Globe,
  ArrowUpRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Active Filters
const FILTER_OPTIONS = {
  types: ["Full-time", "Contract", "Freelance", "Part-time"],
  locations: ["Remote", "On-site", "Hybrid"],
  salaries: ["Under $5k", "$5k - $10k", "$10k - $20k", "Over $20k"],
  experience: ["Junior", "Mid-level", "Senior", "Lead / Staff"],
  departments: ["Engineering", "Design", "Product", "Operations", "Marketing", "Finance", "Human Resources", "Sales"]
};

export default function TalentJobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleIdFromQuery = searchParams.get("role");

  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();
  
  // Filter State
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSalaries, setSelectedSalaries] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        
        // Parallelize main queries
        const [sessionRes, rolesRes, clientsRes] = await Promise.all([
          supabase.auth.getSession(),
          supabase.from("roles").select("*").order("created_at", { ascending: false }).limit(200),
          supabase.from("profiles").select("*").limit(200)
        ]);

        const session = sessionRes.data?.session;
        if (session?.user) {
          setUser(session.user);
          // Parallelize user-specific queries
          const [profileRes, appsRes] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", session.user.id).single(),
            supabase.from("job_applications").select("role_id").eq("talent_id", session.user.id)
          ]);
          
          setProfile(profileRes.data);
          
          const localKey = `job_applications_${session.user.id}`;
          const existing = localStorage.getItem(localKey);
          const localApps = existing ? JSON.parse(existing) : [];

          const appliedIds = [...new Set([...(appsRes.data?.map(a => a.role_id) || []), ...localApps])];
          setAppliedJobs(appliedIds);
        }

        const rolesData = rolesRes.data;
        const rolesError = rolesRes.error;
        const clientsData = clientsRes.data;

        let liveJobs: any[] = [];

        if (rolesError) {
          console.error("Supabase fetch error:", rolesError);
          setDebugError(rolesError.message);
        } else {
          // Add accessible roles from roles table
          if (rolesData && rolesData.length > 0) {
            rolesData.forEach((job: any) => {
              if (job.status === "open") liveJobs.push(job);
            });
          }

          // Map organization profiles
          const orgIds = [...new Set(liveJobs.map(r => r.organization_id).filter(Boolean))];
          let profileMap: any = {};
          
          if (orgIds.length > 0) {
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, company_name, avatar_url")
              .in("id", orgIds);
            
            profileMap = (profilesData || []).reduce((acc: any, p: any) => {
              acc[p.id] = { company_name: p.company_name, avatar_url: p.avatar_url };
              return acc;
            }, {});
          }

          liveJobs = liveJobs.map(r => ({ ...r, organization: profileMap[r.organization_id] || null }));

          // Workaround: Read jobs from client profiles (RLS fallback)
          if (clientsData && clientsData.length > 0) {
            clientsData.forEach((client: any) => {
              const profileJobs = client.system_prefs?.public_jobs || [];
              profileJobs.forEach((job: any) => {
                if (job.status === "open" && !liveJobs.some(j => j.id === job.id)) {
                  liveJobs.push({
                    ...job,
                    organization_id: client.id,
                    organization: {
                      company_name: job.organization_name || client.company_name || "Enterprise",
                      avatar_url: job.organization_avatar || client.avatar_url
                    }
                  });
                }
              });
            });
          }

          // Sort all live jobs by created_at desc
          liveJobs.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

          console.log(`[JobBoard] Aggregated ${liveJobs.length} live jobs from DB`, liveJobs);
          setDebugError(null);
        }

        setJobs(liveJobs);

        // Extract unique skills from combined set
        const skillsSet = new Set<string>();
        liveJobs.forEach(job => {
          if (job.skills) job.skills.forEach((s: string) => skillsSet.add(s));
        });
        setAvailableSkills(Array.from(skillsSet).sort().slice(0, 15));

        // Auto-select first job on desktop or from query param
        if (liveJobs.length > 0 && !selectedJob) {
          const preselected = roleIdFromQuery ? liveJobs.find(j => j.id === roleIdFromQuery) : null;
          setSelectedJob(preselected || liveJobs[0]);
        }
      } catch (err) {
        console.error("Hard fetch error:", err);
        setJobs(SAMPLE_ROLES);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [roleIdFromQuery]);

  const handleApply = async (job: any) => {
    if (!user || profile?.role_type !== "talent") {
       toast({
         title: "Talent Profile Required",
         description: "You must be signed in as talent to apply for jobs."
       });
       return;
    }
    
    setApplying(true);
    try {
      const { error: appErr } = await supabase.from("job_applications").insert({
        role_id: job.id,
        talent_id: user.id,
        status: 'pending'
      });

      if (appErr) {
        console.warn("Supabase job_applications save failed, falling back locally:", appErr);
        const localKey = `job_applications_${user.id}`;
        const existing = localStorage.getItem(localKey);
        let apps = existing ? JSON.parse(existing) : [];
        if (!apps.includes(job.id)) {
          apps.push(job.id);
          localStorage.setItem(localKey, JSON.stringify(apps));
        }
      }

      const newShortlistEntry = {
        id: crypto.randomUUID(),
        role_id: job.id,
        organization_id: job.organization_id || "fallback-org", // Must have some value, but if not UUID, supabase fails
        talent_id: user.id,
        talent_name: profile.full_name || user.email,
        talent_avatar: profile.avatar_url,
        talent_role: profile.primary_role,
        talent_location: profile.location,
        talent_skills: profile.skills || [],
        talent_level: profile.experience_level,
        talent_rate: profile.expected_rate || "",
        talent_bio: profile.bio,
        status: "shortlisted",
        overall_score: 95,
        ai_breakdown: { note: "Applied directly via talent dashboard" }
      };

      const { error: shortlistErr } = await supabase.from("role_shortlist").insert(newShortlistEntry);
      
      if (shortlistErr) {
        console.warn("Shortlist sync failed, sending via notification fallback:", shortlistErr);
        if (job.organization_id) {
           // 1. Cross-user fallback via Notifications
           await supabase.from("notifications").insert({
             user_id: job.organization_id,
             type: "job_application",
             title: "New Job Application",
             message: `[APP_DATA:${JSON.stringify(newShortlistEntry)}]`,
             is_read: false
           });

           // 2. Local fallback for immediate UI feedback if needed
           const localKey = `flowboard_local_shortlist_${job.organization_id}`;
           const existing = localStorage.getItem(localKey);
           const localList = existing ? JSON.parse(existing) : [];
           if (!localList.some((a: any) => a.talent_id === user.id && a.role_id === job.id)) {
             localList.push(newShortlistEntry);
             localStorage.setItem(localKey, JSON.stringify(localList));
           }
        }
      }

      setAppliedJobs(prev => [...prev, job.id]);
      toast({
        title: "Application Sent! 🚀",
        description: `Your profile has been shared with ${job.organization?.company_name || 'the organization'}.`,
      });
    } catch (err) {
      console.error("Apply error:", err);
      toast({
        variant: "destructive",
        title: "Application failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setApplying(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.organization?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(job.location);
    const matchesExperience = selectedExperience.length === 0 || selectedExperience.some(exp => job.experience_level?.includes(exp));
    const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(job.department);
    
    // Salary matching (simplified)
    const matchesSalary = selectedSalaries.length === 0 || selectedSalaries.some(range => {
      const salaryNum = parseInt(job.salary?.replace(/[^0-9]/g, "") || "0");
      if (range === "Under $5k") return salaryNum < 5000;
      if (range === "$5k - $10k") return salaryNum >= 5000 && salaryNum <= 10000;
      if (range === "$10k - $20k") return salaryNum > 10000 && salaryNum <= 20000;
      if (range === "Over $20k") return salaryNum > 20000;
      return false;
    });

    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.every(skill => job.skills?.includes(skill));

    return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesDepartment && matchesSalary && matchesSkills;
  });

  const toggleFilter = (type: "types" | "locations" | "salaries" | "skills" | "experience" | "departments", value: string) => {
    const setState = {
      types: setSelectedTypes,
      locations: setSelectedLocations,
      salaries: setSelectedSalaries,
      skills: setSelectedSkills,
      experience: setSelectedExperience,
      departments: setSelectedDepartments
    }[type];

    setState((prev: string[]) => 
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedSalaries([]);
    setSelectedExperience([]);
    setSelectedDepartments([]);
    setSelectedSkills([]);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-slate-50 font-jakarta">
      {/* Search & Header Section */}
      <div className="flex-shrink-0 border-b border-[#EEEEF0] bg-white px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#1A1C21]">Find jobs</h1>
              {debugError && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                  Database Error: {debugError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A1C21]/30 group-focus-within:text-[#1A1C21] transition-colors" />
              <input
                type="text"
                placeholder="Search by role, skill, or company..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#EEEEF0] rounded-2xl text-sm font-medium focus:outline-none focus:border-[#A079FF] transition-all placeholder:text-[#1A1C21]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`rounded-xl border-[#EEEEF0] h-[46px] px-6 font-bold text-[10px] tracking-widest hover:bg-slate-50 ${(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedSalaries.length > 0 || selectedSkills.length > 0 || selectedExperience.length > 0 || selectedDepartments.length > 0) ? 'border-[#A079FF] text-[#1A1C21]' : ''}`}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {(selectedTypes.length + selectedLocations.length + selectedSalaries.length + selectedSkills.length + selectedExperience.length + selectedDepartments.length) > 0 && (
                    <span className="ml-2 bg-[#A079FF] text-white w-4 h-4 flex items-center justify-center text-[8px] font-black">
                      {selectedTypes.length + selectedLocations.length + selectedSalaries.length + selectedSkills.length + selectedExperience.length + selectedDepartments.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl border-[#EEEEF0] shadow-2xl" align="end">
                <div className="p-4 border-b border-[#EEEEF0] bg-white">
                  <h3 className="text-xs font-black tracking-widest text-[#1A1C21]">Filter jobs</h3>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Department</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.departments.map(dept => (
                          <label key={dept} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#1A1C21]">
                            <Checkbox 
                              checked={selectedDepartments.includes(dept)}
                              onCheckedChange={() => toggleFilter("departments", dept)}
                              className="rounded-md border-[#EEEEF0] data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" 
                            />
                            {dept}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Role type</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.types.map(type => (
                          <label key={type} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#1A1C21]">
                            <Checkbox 
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleFilter("types", type)}
                              className="rounded-md border-[#EEEEF0] data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" 
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Experience level</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.experience.map(exp => (
                          <label key={exp} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#1A1C21]">
                            <Checkbox 
                              checked={selectedExperience.includes(exp)}
                              onCheckedChange={() => toggleFilter("experience", exp)}
                              className="rounded-md border-[#EEEEF0] data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" 
                            />
                            {exp}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Salary range</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.salaries.map(sal => (
                          <label key={sal} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#1A1C21]">
                            <Checkbox 
                              checked={selectedSalaries.includes(sal)}
                              onCheckedChange={() => toggleFilter("salaries", sal)}
                              className="rounded-md border-[#EEEEF0] data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" 
                            />
                            {sal}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Location</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.locations.map(loc => (
                          <label key={loc} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#1A1C21]">
                            <Checkbox 
                              checked={selectedLocations.includes(loc)}
                              onCheckedChange={() => toggleFilter("locations", loc)}
                              className="rounded-md border-[#EEEEF0] data-[state=checked]:bg-[#A079FF] data-[state=checked]:border-[#A079FF]" 
                            />
                            {loc}
                          </label>
                        ))}
                      </div>
                    </div>

                    {availableSkills.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black tracking-widest text-[#1A1C21]/40">Required expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableSkills.map(skill => (
                            <Badge 
                              key={skill}
                              onClick={() => toggleFilter("skills", skill)}
                              className={`rounded-lg cursor-pointer transition-colors px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
                                selectedSkills.includes(skill) 
                                ? 'bg-[#A079FF] text-white border-[#A079FF]' 
                                : 'bg-white text-[#1A1C21] border-[#EEEEF0] hover:border-[#A079FF]'
                              }`}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 bg-white border-t border-[#EEEEF0] flex justify-between gap-4">
                  <Button 
                    variant="link" 
                    onClick={clearFilters} 
                    className="text-[10px] font-black uppercase tracking-widest text-[#1A1C21]/40 p-0 h-auto hover:text-[#1A1C21]"
                  >
                    Clear all
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedSalaries.length > 0 || selectedSkills.length > 0 || selectedExperience.length > 0 || selectedDepartments.length > 0) && (
        <div className="flex-shrink-0 bg-white border-b border-[#EEEEF0] px-6 py-3 flex gap-2 flex-wrap max-w-[1600px] mx-auto w-full">
          {[...selectedTypes, ...selectedLocations, ...selectedSalaries, ...selectedSkills, ...selectedExperience, ...selectedDepartments].map(val => (
            <Badge key={val} className="rounded-lg bg-slate-50 text-[#1A1C21] border-[#EEEEF0] hover:bg-white flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              {val}
              <X 
                className="w-3 h-3 cursor-pointer text-[#1A1C21]" 
                onClick={() => {
                  if (selectedTypes.includes(val)) setSelectedTypes(prev => prev.filter(v => v !== val));
                  else if (selectedLocations.includes(val)) setSelectedLocations(prev => prev.filter(v => v !== val));
                  else if (selectedSalaries.includes(val)) setSelectedSalaries(prev => prev.filter(v => v !== val));
                  else if (selectedExperience.includes(val)) setSelectedExperience(prev => prev.filter(v => v !== val));
                  else if (selectedDepartments.includes(val)) setSelectedDepartments(prev => prev.filter(v => v !== val));
                  else setSelectedSkills(prev => prev.filter(v => v !== val));
                }}
              />
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="text-[10px] font-black tracking-widest text-[#1A1C21] ml-2 h-auto p-0"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Main Split Pane Layout */}
      <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left Side: Job List */}
        <div className="w-full md:w-[450px] border-r border-[#EEEEF0] bg-white flex flex-col">
          <div className="p-4 border-b border-[#EEEEF0] bg-white/50 flex justify-between items-center text-[10px] font-bold tracking-widest text-[#1A1C21]/60">
            <span>{filteredJobs.length} jobs available</span>
            <div className="flex items-center gap-2">
              <span>Sort: Recent</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-[#EEEEF0]">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-[#1A1C21] animate-spin mx-auto mb-4" />
                  <p className="text-[10px] font-bold tracking-widest text-[#1A1C21]/40">Syncing cloud...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-6 cursor-pointer transition-all relative group ${
                      selectedJob?.id === job.id 
                        ? "bg-white border-l-4 border-l-[#A079FF]" 
                        : "hover:bg-[#A079FF]/5 border-l-4 border-l-transparent hover:border-l-[#A079FF]"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-white border border-[#EEEEF0] flex items-center justify-center shrink-0 rounded-full overflow-hidden">
                        {job.organization?.avatar_url ? (
                          <img src={job.organization.avatar_url} className="w-8 h-8 object-contain" alt="" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-[#1A1C21]/20" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-bold text-[#1A1C21] group-hover:text-[#1A1C21] transition-colors leading-tight">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-[11px] font-medium text-[#1A1C21]/70 tracking-wide">
                          {job.organization?.company_name || "Enterprise"}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1C21]/40">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1C21]">
                            <MapPin className="w-3 h-3 opacity-0" /> {/* Spacer to align with location icon */}
                            {job.salary || "Competitive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 px-10 text-center">
                  <div className="w-16 h-16 bg-white mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-[#1A1C21]/10" />
                  </div>
                  <h3 className="text-base font-bold text-[#1A1C21]">No jobs found</h3>
                  <p className="text-sm text-[#1A1C21]/50 mt-2 leading-relaxed">
                    Adjust your filters to discover more opportunities.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Job Details */}
        <div className="hidden md:flex flex-1 bg-white overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full flex flex-col"
              >
                <ScrollArea className="flex-1">
                  <div className="p-10 max-w-4xl">
                    {/* Detail Header */}
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white border border-[#EEEEF0] flex items-center justify-center shadow-sm rounded-full overflow-hidden shrink-0">
                          {selectedJob.organization?.avatar_url ? (
                            <img src={selectedJob.organization.avatar_url} className="w-8 h-8 object-contain" alt="" />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#1A1C21]/10" />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <h2 className="text-2xl font-black text-[#1A1C21] tracking-tighter leading-none">
                            {selectedJob.title}
                          </h2>
                          <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-[#1A1C21]">
                            <span>{selectedJob.organization?.company_name}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EEEEF0]" />
                            <span className="text-[#1A1C21]/50">{selectedJob.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-xl border-[#EEEEF0] bg-white text-[#1A1C21] hover:bg-white">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl border-[#EEEEF0] bg-white text-[#1A1C21] hover:bg-white">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-10 mb-12">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#1A1C21]/30 tracking-widest">Compensation</span>
                        <p className="text-lg font-bold text-[#1A1C21] tracking-tight">{selectedJob.salary || "Competitive"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#1A1C21]/30 tracking-widest">Job type</span>
                        <p className="text-lg font-bold text-[#1A1C21] tracking-tight truncate">{selectedJob.type || "Full-Time"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-[#1A1C21]/30 tracking-widest">Timezone</span>
                        <p className="text-lg font-bold text-[#1A1C21] tracking-tight">Global / Remote</p>
                      </div>
                    </div>

                    {/* Mission Overview */}
                    <div className="grid grid-cols-1 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black tracking-tight text-[#1A1C21]">Job brief</h4>
                        </div>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-[#1A1C21]/80 leading-loose font-medium text-lg">
                            {selectedJob.description || "As a key member of the team, you will drive innovation and excellence in your role. We are looking for ambitious individuals who are ready to make a significant impact on our global operations."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black tracking-tight text-[#1A1C21]">Key objectives</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          {["Optimize workflow system", "Scale infrastructure", "Collaborate with cross-functional teams", "Mentor junior contributors"].map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-[#1A1C21] shrink-0 mt-0.5" />
                              <span className="text-sm font-medium text-[#1A1C21]/80 leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <h4 className="text-xl font-black tracking-tight text-[#1A1C21]">Required expertise</h4>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                          {(selectedJob.skills || ["React", "TypeScript", "Node.js", "PostgreSQL", "System Design"]).map((skill: string) => (
                            <div key={skill} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-[#1A1C21] rounded-full" />
                              <span className="text-sm font-bold text-[#1A1C21] tracking-wide">
                                {skill}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 bg-white border-t border-[#EEEEF0]">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 text-[#1A1C21]/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold tracking-widest">Posted 2 days ago</span>
                    </div>
                    <Button 
                      disabled={appliedJobs.includes(selectedJob.id) || applying}
                      onClick={() => handleApply(selectedJob)}
                      className={`rounded-xl px-10 py-6 h-auto font-black text-xs tracking-[0.2em] group shadow-xl transition-colors ${
                        appliedJobs.includes(selectedJob.id)
                          ? "bg-[#EEEEF0] text-[#1A1C21]/50 cursor-default"
                          : "bg-[#A079FF] hover:bg-[#A079FF]/90 text-white"
                      }`}
                    >
                      {applying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : appliedJobs.includes(selectedJob.id) ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Applied</>
                      ) : (
                        <>Apply <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                <div className="w-24 h-24 bg-white border border-[#EEEEF0] flex items-center justify-center mb-6 rounded-full overflow-hidden">
                  <Globe className="w-12 h-12 text-[#1A1C21]" />
                </div>
                <h2 className="text-xl font-black text-[#1A1C21]">Select a job</h2>
                <p className="text-sm font-medium mt-4 max-w-sm text-[#1A1C21]/60">
                  Select an opportunity from the left panel to view full job details and start the application process.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
