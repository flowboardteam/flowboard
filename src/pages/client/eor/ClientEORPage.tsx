"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Building2, Globe, ShieldCheck, Users, Plus, 
  Search, CheckCircle2, AlertCircle, FileText, ArrowUpRight, 
  Clock, DollarSign, ChevronRight, HelpCircle, Download,
  LayoutList, Kanban, Filter, MapPin, Trash2, Calendar,
  Briefcase, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  COUNTRY_LIST, 
  CURRENCY_LIST, 
  UnifiedWorkforceMember, 
  fetchUnifiedWorkforce, 
  addUnifiedMember, 
  deleteUnifiedMember 
} from "@/lib/workforceSync";

interface CountryRule {
  country: string;
  code: string;
  probation: string;
  leaveDays: string;
  noticePeriod: string;
  employerTaxes: string;
  currency: string;
}

const COUNTRY_COMPLIANCE_DATA: CountryRule[] = [
  { country: "Nigeria", code: "NG", probation: "3 months", leaveDays: "21 days", noticePeriod: "1 month", employerTaxes: "10% Pension + 1% ITF", currency: "NGN/USD" },
  { country: "Ghana", code: "GH", probation: "6 months", leaveDays: "15 days", noticePeriod: "1 month", employerTaxes: "13% SSNIT", currency: "GHS/USD" },
  { country: "Kenya", code: "KE", probation: "6 months", leaveDays: "21 days", noticePeriod: "1 month", employerTaxes: "NSSF + NHIF tier", currency: "KES/USD" },
  { country: "South Africa", code: "ZA", probation: "3 months", leaveDays: "21 consecutive", noticePeriod: "2-4 weeks", employerTaxes: "1% UIF + SDL", currency: "ZAR" },
  { country: "United Kingdom", code: "GB", probation: "3-6 months", leaveDays: "28 days (statutory)", noticePeriod: "1-3 months", employerTaxes: "13.8% Secondary NI", currency: "GBP" },
  { country: "Brazil", code: "BR", probation: "90 days (max)", leaveDays: "30 days (CLT)", noticePeriod: "30-90 days", employerTaxes: "8% FGTS + INSS", currency: "BRL" },
  { country: "Germany", code: "DE", probation: "6 months", leaveDays: "20-25 days", noticePeriod: "4 weeks to 7 mos", employerTaxes: "~20% Social Security", currency: "EUR" },
  { country: "Philippines", code: "PH", probation: "6 months", leaveDays: "5-15 days", noticePeriod: "30 days", employerTaxes: "SSS + PhilHealth + 13th mo", currency: "PHP/USD" }
];

export default function ClientEORPage() {
  const { toast } = useToast();
  const [allMembers, setAllMembers] = useState<UnifiedWorkforceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [kanbanGrouping, setKanbanGrouping] = useState<"status" | "country">("status");
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<UnifiedWorkforceMember | null>(null);

  // New hire form state
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidateRole, setCandidateRole] = useState("");
  const [candidateDepartment, setCandidateDepartment] = useState("Engineering");
  const [candidateCountry, setCandidateCountry] = useState("Nigeria");
  const [candidateCurrency, setCandidateCurrency] = useState("USD");
  const [candidateSalary, setCandidateSalary] = useState("");
  const [candidateBenefits, setCandidateBenefits] = useState("Standard Statutory + Pension");
  const [candidateStartDate, setCandidateStartDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedWorkforce();
      setAllMembers(data);
    } catch (e) {
      console.warn("Failed to load workforce:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };
    window.addEventListener("workforce_updated", handleSync);
    return () => window.removeEventListener("workforce_updated", handleSync);
  }, []);

  // Filter for EOR employees only
  const eorEmployees = useMemo(() => {
    return allMembers.filter((m) => m.employment_model === "eor");
  }, [allMembers]);

  const filteredEmployees = useMemo(() => {
    return eorEmployees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        emp.full_name.toLowerCase().includes(q) ||
        (emp.role_title && emp.role_title.toLowerCase().includes(q)) ||
        (emp.location && emp.location.toLowerCase().includes(q)) ||
        (emp.eor_settings?.country && emp.eor_settings.country.toLowerCase().includes(q));

      const matchesCountry = 
        countryFilter === "All" || 
        emp.eor_settings?.country === countryFilter ||
        emp.location === countryFilter;

      return matchesSearch && matchesCountry;
    });
  }, [eorEmployees, searchQuery, countryFilter]);

  // Dynamic Metrics
  const activeStaffCount = eorEmployees.length;
  const uniqueCountriesCount = new Set(
    eorEmployees.map((e) => e.eor_settings?.country || e.location || "Global")
  ).size;
  const totalMonthlySpend = eorEmployees.reduce((sum, e) => sum + (e.payment_monthly || 0), 0);

  // Available countries from added staff
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    eorEmployees.forEach((e) => {
      const c = e.eor_settings?.country || e.location;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [eorEmployees]);

  const handleCountrySelectChange = (cName: string) => {
    setCandidateCountry(cName);
    const found = COUNTRY_LIST.find((c) => c.name === cName);
    if (found) {
      setCandidateCurrency(found.currency);
    }
  };

  const handleCreateEORHire = async () => {
    if (!candidateName.trim() || !candidateRole.trim() || !candidateSalary.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide candidate full name, job title, and salary.",
        variant: "destructive"
      });
      return;
    }

    const countryObj = COUNTRY_LIST.find((c) => c.name === candidateCountry);

    try {
      await addUnifiedMember({
        full_name: candidateName.trim(),
        email: candidateEmail.trim() || null,
        role_title: candidateRole.trim(),
        department: candidateDepartment,
        location: candidateCountry,
        start_date: candidateStartDate,
        payment_monthly: parseFloat(candidateSalary) || 0,
        payment_currency: candidateCurrency,
        employment_model: "eor",
        status: "Active",
        eor_settings: {
          country: candidateCountry,
          countryCode: countryObj?.code || "GL",
          entity: countryObj?.entity || `Flowboard Global EOR (${candidateCountry})`,
          benefitsTier: candidateBenefits,
          probationPeriod: "3 months",
          noticePeriod: "1 month"
        }
      });

      setIsHireModalOpen(false);
      setCandidateName("");
      setCandidateEmail("");
      setCandidateRole("");
      setCandidateSalary("");

      toast({
        title: "EOR Talent Added ✓",
        description: `${candidateName} has been enrolled under Flowboard EOR in ${candidateCountry}.`
      });

      await loadData();
    } catch (err: any) {
      toast({
        title: "Error adding talent",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    await deleteUnifiedMember(id);
    toast({
      title: "Employee Removed",
      description: `${name} has been removed from EOR roster.`
    });
    setSelectedEmp(null);
    await loadData();
  };

  // Helper formatting
  const fmtCurrency = (amount: number | null, curr: string = "USD") => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-[#FAFAFB] min-h-screen font-sans text-[#1A1C21]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1A1C21]">Employer of Record (EOR) Services</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
              100% Compliant
            </Badge>
          </div>
          <p className="text-xs font-normal text-[#1A1C21]/60">
            Legally hire, onboard, and pay global full-time employees in 150+ countries without establishing local legal entities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/client/workforce">
            <Button variant="outline" className="border-slate-200 text-xs font-bold rounded-lg h-9">
              <Users className="w-3.5 h-3.5 mr-1.5" /> View Full Team
            </Button>
          </Link>

          <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-lg shadow-sm px-4 h-9">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> + Hire with EOR
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-xl max-w-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Hire via Flowboard EOR
                </DialogTitle>
                <DialogDescription className="text-xs">
                  We handle localized labor law compliance, employment contracts, payroll tax withholding, and statutory benefits.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Candidate Full Name *</Label>
                  <Input 
                    placeholder="e.g. Chinedu Eze" 
                    value={candidateName} 
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="text-xs border-slate-200 h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Work Email</Label>
                    <Input 
                      placeholder="chinedu@example.com" 
                      type="email"
                      value={candidateEmail} 
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Department</Label>
                    <Select value={candidateDepartment} onValueChange={setCandidateDepartment}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Job Title *</Label>
                  <Input 
                    placeholder="e.g. Senior AI Systems Engineer" 
                    value={candidateRole} 
                    onChange={(e) => setCandidateRole(e.target.value)}
                    className="text-xs border-slate-200 h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Country of Residence *</Label>
                    <Select value={candidateCountry} onValueChange={handleCountrySelectChange}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white max-h-60">
                        {COUNTRY_LIST.map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            <span className="mr-1.5">{c.flag}</span> {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">EOR Legal Entity</Label>
                    <div className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-3 py-2 truncate">
                      {COUNTRY_LIST.find((c) => c.name === candidateCountry)?.entity || "Flowboard Global EOR"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Monthly Gross Salary *</Label>
                    <Input 
                      placeholder="e.g. 6000" 
                      type="number"
                      value={candidateSalary} 
                      onChange={(e) => setCandidateSalary(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Currency *</Label>
                    <Select value={candidateCurrency} onValueChange={setCandidateCurrency}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white max-h-60">
                        {CURRENCY_LIST.map((cur) => (
                          <SelectItem key={cur.code} value={cur.code}>
                            {cur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Statutory Benefits Package</Label>
                  <Select value={candidateBenefits} onValueChange={setCandidateBenefits}>
                    <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Standard Statutory + Pension">Standard (Statutory Minimum + Pension)</SelectItem>
                      <SelectItem value="Premium (Health + Pension + Tech)">Premium (Private Health + Pension + Tech Allowance)</SelectItem>
                      <SelectItem value="Comprehensive Global Coverage">Comprehensive (Full Medical + Dental + Wellness)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Start Date</Label>
                  <Input 
                    type="date"
                    value={candidateStartDate} 
                    onChange={(e) => setCandidateStartDate(e.target.value)}
                    className="text-xs border-slate-200 h-9"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button variant="outline" onClick={() => setIsHireModalOpen(false)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button onClick={handleCreateEORHire} className="bg-[#1A1C21] hover:bg-black text-white text-xs font-bold h-9">
                  Confirm & Enrol EOR Talent
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row (Dynamic based on added EOR staff) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active EOR Staff</span>
            <Users className="w-4 h-4 text-[#A079FF]" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">{activeStaffCount} Individuals</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Full-time statutory employees</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active Jurisdictions</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">{uniqueCountriesCount} Countries</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">Local labor contracts active</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Compliance Guarantee</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">100% Protected</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">Zero misclassification liability</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Monthly EOR Payroll</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">${totalMonthlySpend.toLocaleString()}/mo</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">Includes tax & benefits routing</p>
        </Card>
      </div>

      {/* Main Tabs Section */}
      <Tabs defaultValue="team" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <TabsList className="bg-white border border-[#EEEEF0] p-1 rounded-lg flex">
            <TabsTrigger value="team" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
              <Users className="w-3.5 h-3.5 mr-1.5" /> EOR Employees ({activeStaffCount})
            </TabsTrigger>
            <TabsTrigger value="coverage" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
              <Globe className="w-3.5 h-3.5 mr-1.5" /> Country Coverage & Rules
            </TabsTrigger>
            <TabsTrigger value="benefits" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Global Benefits
            </TabsTrigger>
          </TabsList>

          {/* List vs Kanban toggle button (shown on team tab) */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "list" 
                  ? "bg-[#1A1C21] text-white shadow-xs" 
                  : "text-slate-500 hover:text-black hover:bg-slate-50"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "kanban" 
                  ? "bg-[#1A1C21] text-white shadow-xs" 
                  : "text-slate-500 hover:text-black hover:bg-slate-50"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        </div>

        {/* Tab 1: EOR Employee Roster */}
        <TabsContent value="team" className="mt-0">
          
          {/* Controls Bar */}
          <div className="bg-white border border-[#EEEEF0] rounded-xl p-3 mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search EOR team members by name, role, country..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 border-slate-200 w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="text-xs h-8 w-40 border-slate-200">
                    <MapPin className="w-3 h-3 text-slate-400 mr-1" />
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="All">All Countries</SelectItem>
                    {availableCountries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    {availableCountries.length === 0 && (
                      COUNTRY_LIST.slice(0, 6).map((c) => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {viewMode === "kanban" && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold text-[11px]">Group by:</span>
                <button
                  onClick={() => setKanbanGrouping("status")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    kanbanGrouping === "status" ? "bg-slate-200 text-black" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => setKanbanGrouping("country")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                    kanbanGrouping === "country" ? "bg-slate-200 text-black" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  Country
                </button>
              </div>
            )}
          </div>

          {/* If No EOR Employees -> BLANK / CLEAN EMPTY STATE */}
          {filteredEmployees.length === 0 ? (
            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center mb-4 text-[#1A1C21]">
                <ShieldCheck className="w-8 h-8 text-[#1A1C21]" />
              </div>
              <h3 className="text-base font-bold text-[#1A1C21] tracking-tight mb-1">
                {searchQuery || countryFilter !== "All" ? "No matching EOR employees found" : "No EOR employees added yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                {searchQuery || countryFilter !== "All"
                  ? "Try adjusting your search terms or country filter to find what you're looking for."
                  : "When talent is added to your workforce and identified as EOR, their localized legal contracts, benefits, and tax withholding appear here."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button 
                  onClick={() => setIsHireModalOpen(true)}
                  className="bg-[#1A1C21] hover:bg-black text-white text-xs font-bold px-5 h-9"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> + Hire with EOR
                </Button>
                <Link to="/client/workforce">
                  <Button variant="outline" className="border-slate-200 text-xs font-bold h-9">
                    Manage Full Team
                  </Button>
                </Link>
              </div>
            </Card>
          ) : viewMode === "list" ? (
            /* LIST VIEW */
            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/80">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Employee</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Country & Entity</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Gross Salary</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Benefits Package</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEF0]">
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#FAFAFB]/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                              {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#1A1C21]">{emp.full_name}</div>
                              <div className="text-[10px] font-medium text-slate-500">{emp.role_title || "Team Member"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-[#1A1C21] flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {emp.eor_settings?.country || emp.location || "Global"}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {emp.eor_settings?.entity || "Flowboard Global EOR"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold">
                            {fmtCurrency(emp.payment_monthly, emp.payment_currency)}/mo
                          </div>
                          <div className="text-[10px] text-slate-400">Paid via {emp.payment_currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-700 font-medium">
                            {emp.eor_settings?.benefitsTier || "Standard Statutory + Pension"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-none ${
                            emp.status === "Active" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedEmp(emp)}
                            className="text-xs font-bold text-[#A079FF] hover:bg-[#A079FF]/10 h-7 px-2.5"
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            /* KANBAN VIEW */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kanbanGrouping === "status" ? (
                // Columns by Status
                (["Active", "Onboarding", "In Review"] as const).map((colStatus) => {
                  const items = filteredEmployees.filter((e) => e.status === colStatus);
                  return (
                    <div key={colStatus} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            colStatus === "Active" ? "bg-emerald-500" : colStatus === "Onboarding" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{colStatus}</h4>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5">
                          {items.length}
                        </Badge>
                      </div>

                      <div className="space-y-3 flex-1">
                        {items.map((emp) => (
                          <div 
                            key={emp.id}
                            onClick={() => setSelectedEmp(emp)}
                            className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 leading-snug">{emp.full_name}</h5>
                                <p className="text-[11px] text-slate-500">{emp.role_title || "Team Member"}</p>
                              </div>
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                {emp.eor_settings?.country || emp.location || "Global"}
                              </span>
                            </div>

                            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                              <span className="font-bold text-slate-800">
                                {fmtCurrency(emp.payment_monthly, emp.payment_currency)}/mo
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {emp.eor_settings?.benefitsTier?.split(" ")[0] || "Standard"}
                              </span>
                            </div>
                          </div>
                        ))}

                        {items.length === 0 && (
                          <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-xs font-medium">
                            No employees in {colStatus.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Columns by Country
                (availableCountries.length > 0 ? availableCountries : ["Nigeria", "Ghana", "Kenya"]).map((cName) => {
                  const items = filteredEmployees.filter(
                    (e) => (e.eor_settings?.country || e.location) === cName
                  );
                  return (
                    <div key={cName} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-600" />
                          <h4 className="text-xs font-bold text-slate-800">{cName}</h4>
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5">
                          {items.length}
                        </Badge>
                      </div>

                      <div className="space-y-3 flex-1">
                        {items.map((emp) => (
                          <div 
                            key={emp.id}
                            onClick={() => setSelectedEmp(emp)}
                            className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-bold text-slate-900">{emp.full_name}</h5>
                                <p className="text-[11px] text-slate-500">{emp.role_title || "Team Member"}</p>
                              </div>
                              <Badge className={`text-[9px] font-bold ${
                                emp.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}>
                                {emp.status}
                              </Badge>
                            </div>

                            <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                              <span className="font-bold text-slate-800">
                                {fmtCurrency(emp.payment_monthly, emp.payment_currency)}/mo
                              </span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                                {emp.eor_settings?.entity || "Global EOR"}
                              </span>
                            </div>
                          </div>
                        ))}

                        {items.length === 0 && (
                          <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-xs font-medium">
                            No employees in {cName}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Country Coverage */}
        <TabsContent value="coverage">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNTRY_COMPLIANCE_DATA.map((rule) => (
              <Card key={rule.code} className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black">{rule.country}</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-500">{rule.code}</Badge>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">Direct Entity</Badge>
                </div>

                <div className="space-y-2 py-2 text-xs border-y border-slate-100 my-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard Probation</span>
                    <span className="font-bold text-[#1A1C21]">{rule.probation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statutory Annual Leave</span>
                    <span className="font-bold text-[#1A1C21]">{rule.leaveDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Notice Period</span>
                    <span className="font-bold text-[#1A1C21]">{rule.noticePeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employer Contributions</span>
                    <span className="font-bold text-[#1A1C21] text-right">{rule.employerTaxes}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCandidateCountry(rule.country);
                    const c = COUNTRY_LIST.find((x) => x.name === rule.country);
                    if (c) setCandidateCurrency(c.currency);
                    setIsHireModalOpen(true);
                  }}
                  className="w-full text-xs font-bold border-slate-200 hover:bg-slate-50 h-8 mt-2"
                >
                  Hire in {rule.country}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Global Benefits */}
        <TabsContent value="benefits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1C21]">Mandatory Statutory Benefits</h3>
                  <p className="text-xs text-slate-500">Automatically compliant in all 150+ jurisdictions</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>State Pension & Social Security withholdings and remissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Workers' compensation and occupational health insurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Statutory paid sick leave, maternity, and paternity coverages</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-[#A079FF]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1C21]">Supplemental Tech & Healthcare Add-ons</h3>
                  <p className="text-xs text-slate-500">Attract world-class engineers with tier-one perks</p>
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A079FF] shrink-0 mt-0.5" />
                  <span>Private Inpatient & Outpatient International Health Insurance (SafetyWing/Bupa)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A079FF] shrink-0 mt-0.5" />
                  <span>Home-office equipment and remote hardware allowance stipends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A079FF] shrink-0 mt-0.5" />
                  <span>Mental wellness consultations and continuous professional development credits</span>
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Employee Details Modal */}
      {selectedEmp && (
        <Dialog open={!!selectedEmp} onOpenChange={(open) => !open && setSelectedEmp(null)}>
          <DialogContent className="bg-white border-slate-200 rounded-xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>{selectedEmp.full_name}</span>
                <Badge className="text-[9px] font-bold uppercase">{selectedEmp.status}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedEmp.role_title} · {selectedEmp.eor_settings?.country || selectedEmp.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Legal Entity</span>
                  <span className="font-bold text-slate-800">{selectedEmp.eor_settings?.entity || "Flowboard Global EOR"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Compensation</span>
                  <span className="font-bold text-slate-800">{fmtCurrency(selectedEmp.payment_monthly, selectedEmp.payment_currency)}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Currency</span>
                  <span className="font-bold text-slate-800">{selectedEmp.payment_currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department</span>
                  <span className="font-bold text-slate-800">{selectedEmp.department || "Engineering"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Benefits Tier</span>
                  <span className="font-bold text-slate-800">{selectedEmp.eor_settings?.benefitsTier || "Standard Statutory"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-bold text-slate-800">{selectedEmp.start_date || "Immediate"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between w-full">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteEmployee(selectedEmp.id, selectedEmp.full_name)}
                className="text-xs h-8"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove from EOR
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedEmp(null)}
                className="text-xs h-8"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
