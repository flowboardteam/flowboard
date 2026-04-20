import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const FILTER_OPTIONS = {
  types: ["Full-time", "Contract", "Freelance", "Part-time"],
  locations: ["Remote", "On-site", "Hybrid"],
  salaries: ["Under $5k", "$5k - $10k", "$10k - $20k", "Over $20k"],
  experience: ["Junior", "Mid-level", "Senior", "Lead / Staff"],
  departments: ["Engineering", "Design", "Product", "Operations", "Marketing", "Finance", "Human Resources", "Sales"]
};

// Premium Sample Roles for "Client Accounts"
const SAMPLE_ROLES = [
  {
    id: "sample-1",
    title: "Senior Full-stack Engineer",
    description: "Build robust, scalable systems that power the next generation of cloud infrastructure. You'll work across the stack with React, Node.js, and PostgreSQL to deliver high-impact features for our growing user base.",
    type: "Full-time",
    location: "Remote",
    salary: "$12k - $18k",
    experience_level: "Senior",
    department: "Engineering",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    created_at: new Date().toISOString(),
    organization: {
      company_name: "Bolt Systems",
      avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=bolt"
    }
  },
  {
    id: "sample-2",
    title: "Product Designer",
    description: "Lead the design direction for our core platform and customer portals. We're looking for a designer who balances deep user empathy with a sharp eye for modern, minimalist aesthetics and complex workflows.",
    type: "Contract",
    location: "Hybrid",
    salary: "$8k - $12k",
    experience_level: "Mid-level",
    department: "Design",
    skills: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    organization: {
      company_name: "Aether Dynamics",
      avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=aether"
    }
  },
  {
    id: "sample-3",
    title: "AI Integration Specialist",
    description: "Architect and implement AI-driven workflows using the latest LLM technologies. You will collaborate with product teams to embed intelligent features that simplify complex operations for founders.",
    type: "Full-time",
    location: "Remote",
    salary: "$15k - $22k",
    experience_level: "Senior",
    department: "Engineering",
    skills: ["Claude API", "Python", "Vector Databases", "Prompt Engineering"],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    organization: {
      company_name: "Flowboard",
      avatar_url: "https://api.dicebear.com/7.x/identicon/svg?seed=flowboard"
    }
  }
];

export default function TalentJobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  
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
         const { data, error } = await supabase
          .from("roles")
          .select("*, organization:profiles!organization_id(company_name, avatar_url)")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
          setDebugError(error.message);
          // Still show samples if DB fails
          setJobs(SAMPLE_ROLES);
        } else {
          console.log(`[JobBoard] Fetched ${data?.length || 0} live jobs from Supabase`, data);
          setDebugError(null);
          // Merge with samples, avoiding ID collisions and giving priority to live data
          const liveIds = new Set((data || []).map(j => j.id));
          const filteredSamples = SAMPLE_ROLES.filter(s => !liveIds.has(s.id));
          setJobs([...(data || []), ...filteredSamples]);
        }

        // Extract unique skills from combined set
        const allPossibleJobs = [...(data || []), ...SAMPLE_ROLES];
        const skillsSet = new Set<string>();
        allPossibleJobs.forEach(job => {
          if (job.skills) job.skills.forEach((s: string) => skillsSet.add(s));
        });
        setAvailableSkills(Array.from(skillsSet).sort().slice(0, 15));

        // Auto-select first job on desktop
        if (allPossibleJobs.length > 0 && !selectedJob) {
          setSelectedJob(allPossibleJobs[0]);
        }
      } catch (err) {
        console.error("Hard fetch error:", err);
        setJobs(SAMPLE_ROLES);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

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
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#F0EFE9] font-jakarta">
      {/* Search & Header Section */}
      <div className="flex-shrink-0 border-b border-[#E8E6DF] bg-[#F9F8F5] px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#272522]">Find jobs</h1>
              {debugError && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">
                  Database Error: {debugError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-2xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#272522]/30 group-focus-within:text-[#F4845F] transition-colors" />
              <input
                type="text"
                placeholder="Search by role, skill, or company..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8E6DF] rounded-none text-sm font-medium focus:outline-none focus:border-[#F4845F] transition-all placeholder:text-[#272522]/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`rounded-none border-[#E8E6DF] h-[46px] px-6 font-bold text-[10px] tracking-widest hover:bg-[#F0EFE9] ${(selectedTypes.length > 0 || selectedLocations.length > 0 || selectedSalaries.length > 0 || selectedSkills.length > 0 || selectedExperience.length > 0 || selectedDepartments.length > 0) ? 'border-[#F4845F] text-[#F4845F]' : ''}`}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                  {(selectedTypes.length + selectedLocations.length + selectedSalaries.length + selectedSkills.length + selectedExperience.length + selectedDepartments.length) > 0 && (
                    <span className="ml-2 bg-[#F4845F] text-white w-4 h-4 flex items-center justify-center text-[8px] font-black">
                      {selectedTypes.length + selectedLocations.length + selectedSalaries.length + selectedSkills.length + selectedExperience.length + selectedDepartments.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-none border-[#E8E6DF] shadow-2xl" align="end">
                <div className="p-4 border-b border-[#E8E6DF] bg-[#F9F8F5]">
                  <h3 className="text-xs font-black tracking-widest text-[#272522]">Filter jobs</h3>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="p-6 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Department</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.departments.map(dept => (
                          <label key={dept} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#272522]">
                            <Checkbox 
                              checked={selectedDepartments.includes(dept)}
                              onCheckedChange={() => toggleFilter("departments", dept)}
                              className="rounded-none border-[#E8E6DF] data-[state=checked]:bg-[#F4845F] data-[state=checked]:border-[#F4845F]" 
                            />
                            {dept}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Role type</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.types.map(type => (
                          <label key={type} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#272522]">
                            <Checkbox 
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleFilter("types", type)}
                              className="rounded-none border-[#E8E6DF] data-[state=checked]:bg-[#F4845F] data-[state=checked]:border-[#F4845F]" 
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Experience level</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.experience.map(exp => (
                          <label key={exp} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#272522]">
                            <Checkbox 
                              checked={selectedExperience.includes(exp)}
                              onCheckedChange={() => toggleFilter("experience", exp)}
                              className="rounded-none border-[#E8E6DF] data-[state=checked]:bg-[#F4845F] data-[state=checked]:border-[#F4845F]" 
                            />
                            {exp}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Salary range</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.salaries.map(sal => (
                          <label key={sal} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#272522]">
                            <Checkbox 
                              checked={selectedSalaries.includes(sal)}
                              onCheckedChange={() => toggleFilter("salaries", sal)}
                              className="rounded-none border-[#E8E6DF] data-[state=checked]:bg-[#F4845F] data-[state=checked]:border-[#F4845F]" 
                            />
                            {sal}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Location</h4>
                      <div className="space-y-3">
                        {FILTER_OPTIONS.locations.map(loc => (
                          <label key={loc} className="flex items-center gap-3 group cursor-pointer text-sm font-bold text-[#272522]">
                            <Checkbox 
                              checked={selectedLocations.includes(loc)}
                              onCheckedChange={() => toggleFilter("locations", loc)}
                              className="rounded-none border-[#E8E6DF] data-[state=checked]:bg-[#F4845F] data-[state=checked]:border-[#F4845F]" 
                            />
                            {loc}
                          </label>
                        ))}
                      </div>
                    </div>

                    {availableSkills.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black tracking-widest text-[#272522]/40">Required expertise</h4>
                        <div className="flex flex-wrap gap-2">
                          {availableSkills.map(skill => (
                            <Badge 
                              key={skill}
                              onClick={() => toggleFilter("skills", skill)}
                              className={`rounded-none cursor-pointer transition-colors px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
                                selectedSkills.includes(skill) 
                                ? 'bg-[#F4845F] text-white border-[#FC5C3A]' 
                                : 'bg-white text-[#272522] border-[#E8E6DF] hover:border-[#F4845F]'
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
                <div className="p-4 bg-[#F9F8F5] border-t border-[#E8E6DF] flex justify-between gap-4">
                  <Button 
                    variant="link" 
                    onClick={clearFilters} 
                    className="text-[10px] font-black uppercase tracking-widest text-[#272522]/40 p-0 h-auto hover:text-[#F4845F]"
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
        <div className="flex-shrink-0 bg-white border-b border-[#E8E6DF] px-6 py-3 flex gap-2 flex-wrap max-w-[1600px] mx-auto w-full">
          {[...selectedTypes, ...selectedLocations, ...selectedSalaries, ...selectedSkills, ...selectedExperience, ...selectedDepartments].map(val => (
            <Badge key={val} className="rounded-none bg-[#F0EFE9] text-[#272522] border-[#E8E6DF] hover:bg-white flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest">
              {val}
              <X 
                className="w-3 h-3 cursor-pointer text-[#F4845F]" 
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
            className="text-[10px] font-black tracking-widest text-[#F4845F] ml-2 h-auto p-0"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Main Split Pane Layout */}
      <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
        {/* Left Side: Job List */}
        <div className="w-full md:w-[450px] border-r border-[#E8E6DF] bg-white flex flex-col">
          <div className="p-4 border-b border-[#E8E6DF] bg-[#F9F8F5]/50 flex justify-between items-center text-[10px] font-bold tracking-widest text-[#272522]/60">
            <span>{filteredJobs.length} jobs available</span>
            <div className="flex items-center gap-2">
              <span>Sort: Recent</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y divide-[#E8E6DF]">
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-[#F4845F] animate-spin mx-auto mb-4" />
                  <p className="text-[10px] font-bold tracking-widest text-[#272522]/40">Syncing cloud...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-6 cursor-pointer transition-all relative group ${
                      selectedJob?.id === job.id 
                        ? "bg-[#F0EFE9] border-l-4 border-l-[#F4845F]" 
                        : "hover:bg-[#F9F8F5] border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-[#F9F8F5] border border-[#E8E6DF] flex items-center justify-center shrink-0">
                        {job.organization?.avatar_url ? (
                          <img src={job.organization.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <Briefcase className="w-6 h-6 text-[#272522]/20" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-bold text-[#272522] group-hover:text-[#F4845F] transition-colors leading-tight">
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-[11px] font-medium text-[#272522]/70 tracking-wide">
                          {job.organization?.company_name || "Enterprise"}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#272522]/40">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#208838]">
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
                  <div className="w-16 h-16 bg-[#F9F8F5] mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-[#272522]/10" />
                  </div>
                  <h3 className="text-base font-bold text-[#272522]">No jobs found</h3>
                  <p className="text-sm text-[#272522]/50 mt-2 leading-relaxed">
                    Adjust your filters to discover more opportunities.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Side: Job Details */}
        <div className="hidden md:flex flex-1 bg-[#F0EFE9] overflow-hidden">
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
                      <div className="space-y-6">
                        <div className="w-20 h-20 bg-white border border-[#E8E6DF] flex items-center justify-center shadow-sm">
                          {selectedJob.organization?.avatar_url ? (
                            <img src={selectedJob.organization.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <Building2 className="w-10 h-10 text-[#272522]/10" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <h2 className="text-4xl font-black text-[#272522] tracking-tighter leading-none">
                            {selectedJob.title}
                          </h2>
                          <div className="flex items-center gap-4 text-sm font-bold tracking-widest text-[#F4845F]">
                            <span>{selectedJob.organization?.company_name}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8E6DF]" />
                            <span className="text-[#272522]/50">{selectedJob.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-none border-[#E8E6DF] bg-white text-[#272522] hover:bg-[#F9F8F5]">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-none border-[#E8E6DF] bg-white text-[#272522] hover:bg-[#F9F8F5]">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-10 mb-12">
                      <div className="p-6 bg-white border border-[#E8E6DF] space-y-1">
                        <span className="text-[10px] font-black text-[#272522]/30 tracking-widest">Compensation</span>
                        <p className="text-lg font-bold text-[#208838] tracking-tight">{selectedJob.salary || "Competitive"}</p>
                      </div>
                      <div className="p-6 bg-white border border-[#E8E6DF] space-y-1">
                        <span className="text-[10px] font-black text-[#272522]/30 tracking-widest">Job type</span>
                        <p className="text-lg font-bold text-[#272522] tracking-tight truncate">{selectedJob.type || "Full-Time"}</p>
                      </div>
                      <div className="p-6 bg-white border border-[#E8E6DF] space-y-1">
                        <span className="text-[10px] font-black text-[#272522]/30 tracking-widest">Timezone</span>
                        <p className="text-lg font-bold text-[#272522] tracking-tight">Global / Remote</p>
                      </div>
                    </div>

                    {/* Mission Overview */}
                    <div className="grid grid-cols-1 gap-12">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-[2px] w-8 bg-[#FC5C3A]" />
                          <h4 className="text-[11px] font-black tracking-[0.2em] text-[#272522]">Job brief</h4>
                        </div>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-[#272522]/80 leading-loose font-medium text-lg">
                            {selectedJob.description || "As a key member of the team, you will drive innovation and excellence in your role. We are looking for ambitious individuals who are ready to make a significant impact on our global operations."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-[2px] w-8 bg-[#FC5C3A]" />
                          <h4 className="text-[11px] font-black tracking-[0.2em] text-[#272522]">Key objectives</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["Optimize workflow system", "Scale infrastructure", "Collaborate with cross-functional teams", "Mentor junior contributors"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white border border-[#E8E6DF]">
                              <CheckCircle2 className="w-4 h-4 text-[#208838]" />
                              <span className="text-sm font-bold text-[#272522] tracking-wide">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-[2px] w-8 bg-[#FC5C3A]" />
                          <h4 className="text-[11px] font-black tracking-[0.2em] text-[#272522]">Required expertise</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedJob.skills || ["React", "TypeScript", "Node.js", "PostgreSQL", "System Design"]).map((skill: string) => (
                            <span key={skill} className="px-5 py-2.5 bg-white border border-[#E8E6DF] text-[#111] text-[11px] font-black tracking-widest hover:border-[#F4845F] hover:text-[#F4845F] transition-colors cursor-default">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 bg-[#F9F8F5] border-t border-[#E8E6DF]">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 text-[#272522]/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold tracking-widest">Posted 2 days ago</span>
                    </div>
                    <Button 
                      onClick={() => navigate(`/jobs/${selectedJob.id}`)}
                      className="bg-[#F4845F] hover:bg-[#e67b58] text-white rounded-none px-10 py-6 h-auto font-black text-xs tracking-[0.2em] group shadow-xl transition-colors"
                    >
                      Apply
                      <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                <div className="w-24 h-24 bg-white border border-[#E8E6DF] flex items-center justify-center mb-6">
                  <Globe className="w-12 h-12 text-[#272522]" />
                </div>
                <h2 className="text-xl font-black text-[#272522]">Select a job</h2>
                <p className="text-sm font-medium mt-4 max-w-sm text-[#272522]/60">
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
