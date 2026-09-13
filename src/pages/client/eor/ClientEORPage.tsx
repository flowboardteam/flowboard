"use client";

import { useState } from "react";
import { 
  Building2, Globe, ShieldCheck, Users, Plus, 
  Search, CheckCircle2, AlertCircle, FileText, ArrowUpRight, 
  Clock, DollarSign, ChevronRight, HelpCircle, Download
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

interface EOREmployee {
  id: string;
  name: string;
  role: string;
  country: string;
  countryCode: string;
  entity: string;
  status: "Active" | "Onboarding" | "In Review";
  salary: number;
  currency: string;
  benefitsTier: string;
  startDate: string;
}

interface CountryRule {
  country: string;
  code: string;
  probation: string;
  leaveDays: string;
  noticePeriod: string;
  employerTaxes: string;
  currency: string;
}

const INITIAL_EOR_EMPLOYEES: EOREmployee[] = [
  {
    id: "EOR-001",
    name: "Amara Diallo",
    role: "Senior AI Engineer",
    country: "Nigeria",
    countryCode: "NG",
    entity: "Flowboard Global EOR Ltd (NG)",
    status: "Active",
    salary: 6500,
    currency: "USD",
    benefitsTier: "Premium (Health + Pension + Tech)",
    startDate: "Jan 15, 2026"
  },
  {
    id: "EOR-002",
    name: "Kofi Mensah",
    role: "Staff DevOps Architect",
    country: "Ghana",
    countryCode: "GH",
    entity: "Flowboard West Africa EOR",
    status: "Active",
    salary: 5800,
    currency: "USD",
    benefitsTier: "Standard Health + Pension",
    startDate: "Feb 01, 2026"
  },
  {
    id: "EOR-003",
    name: "Elena Rostova",
    role: "Principal Product Designer",
    country: "United Kingdom",
    countryCode: "GB",
    entity: "Flowboard Europe EOR Ltd",
    status: "Active",
    salary: 7200,
    currency: "GBP",
    benefitsTier: "UK Statutory + Private Medical",
    startDate: "Nov 10, 2025"
  },
  {
    id: "EOR-004",
    name: "Lucas Silva",
    role: "Fullstack Python Engineer",
    country: "Brazil",
    countryCode: "BR",
    entity: "Flowboard LatAm EOR Ltda",
    status: "Onboarding",
    salary: 4900,
    currency: "USD",
    benefitsTier: "CLT Standard + Meal Voucher",
    startDate: "Oct 01, 2026"
  }
];

const COUNTRY_COMPLIANCE_DATA: CountryRule[] = [
  { country: "Nigeria", code: "NG", probation: "3 months", leaveDays: "21 days", noticePeriod: "1 month", employerTaxes: "10% Pension + 1% ITF", currency: "NGN / USD" },
  { country: "Ghana", code: "GH", probation: "6 months", leaveDays: "15 days", noticePeriod: "1 month", employerTaxes: "13% SSNIT", currency: "GHS / USD" },
  { country: "Kenya", code: "KE", probation: "6 months", leaveDays: "21 days", noticePeriod: "1 month", employerTaxes: "NSSF + NHIF tier", currency: "KES / USD" },
  { country: "South Africa", code: "ZA", probation: "3 months", leaveDays: "21 consecutive", noticePeriod: "2-4 weeks", employerTaxes: "1% UIF + SDL", currency: "ZAR" },
  { country: "United Kingdom", code: "GB", probation: "3-6 months", leaveDays: "28 days (statutory)", noticePeriod: "1-3 months", employerTaxes: "13.8% Secondary NI", currency: "GBP" },
  { country: "Brazil", code: "BR", probation: "90 days (max)", leaveDays: "30 days (CLT)", noticePeriod: "30-90 days", employerTaxes: "8% FGTS + INSS", currency: "BRL" },
  { country: "Germany", code: "DE", probation: "6 months", leaveDays: "20-25 days", noticePeriod: "4 weeks to 7 mos", employerTaxes: "~20% Social Security", currency: "EUR" },
  { country: "Philippines", code: "PH", probation: "6 months", leaveDays: "5-15 days", noticePeriod: "30 days", employerTaxes: "SSS + PhilHealth + 13th mo", currency: "PHP / USD" },
];

export default function ClientEORPage() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<EOREmployee[]>(INITIAL_EOR_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EOREmployee | null>(null);

  // New hire form state
  const [candidateName, setCandidateName] = useState("");
  const [candidateRole, setCandidateRole] = useState("");
  const [candidateCountry, setCandidateCountry] = useState("Nigeria");
  const [candidateSalary, setCandidateSalary] = useState("");
  const [candidateBenefits, setCandidateBenefits] = useState("Standard Health + Pension");
  const [candidateStartDate, setCandidateStartDate] = useState("");

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === "All" || emp.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const totalMonthlySpend = employees.reduce((sum, e) => sum + e.salary, 0);

  const handleCreateEORHire = () => {
    if (!candidateName || !candidateRole || !candidateSalary) {
      toast({
        title: "Missing Information",
        description: "Please provide candidate name, role, and salary.",
        variant: "destructive"
      });
      return;
    }

    const newEmp: EOREmployee = {
      id: `EOR-00${employees.length + 1}`,
      name: candidateName,
      role: candidateRole,
      country: candidateCountry,
      countryCode: candidateCountry === "Nigeria" ? "NG" : candidateCountry === "Ghana" ? "GH" : candidateCountry === "Kenya" ? "KE" : "GLOBAL",
      entity: `Flowboard Global EOR (${candidateCountry})`,
      status: "Onboarding",
      salary: parseFloat(candidateSalary) || 4500,
      currency: "USD",
      benefitsTier: candidateBenefits,
      startDate: candidateStartDate || "Nov 01, 2026"
    };

    setEmployees([newEmp, ...employees]);
    setIsHireModalOpen(false);
    setCandidateName("");
    setCandidateRole("");
    setCandidateSalary("");
    setCandidateStartDate("");

    toast({
      title: "EOR Onboarding Initiated",
      description: `We are setting up legal employment and localized contracts for ${newEmp.name} in ${newEmp.country}.`
    });
  };

  return (
    <div className="w-full p-8 bg-[#FAFAFB] min-h-screen font-sans text-[#1A1C21]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1C21]">Employer of Record (EOR) Services</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              100% Compliant
            </Badge>
          </div>
          <p className="text-xs font-medium text-[#1A1C21]/60">
            Legally hire, onboard, and pay global full-time employees in 150+ countries without establishing local legal entities.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isHireModalOpen} onOpenChange={setIsHireModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-md shadow-sm px-5 h-9">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Hire with EOR
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Hire via Flowboard EOR</DialogTitle>
                <DialogDescription className="text-xs">
                  We handle local labor law compliance, employment contracts, payroll tax withholding, and statutory benefits.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Candidate Full Name</Label>
                  <Input 
                    placeholder="e.g. Chinedu Eze" 
                    value={candidateName} 
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="text-xs border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Job Title</Label>
                    <Input 
                      placeholder="e.g. Senior Backend Engineer" 
                      value={candidateRole} 
                      onChange={(e) => setCandidateRole(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Country of Residence</Label>
                    <Select value={candidateCountry} onValueChange={setCandidateCountry}>
                      <SelectTrigger className="text-xs border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Gross Monthly Salary ($ USD)</Label>
                    <Input 
                      type="number"
                      placeholder="5000" 
                      value={candidateSalary} 
                      onChange={(e) => setCandidateSalary(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Target Start Date</Label>
                    <Input 
                      type="date"
                      value={candidateStartDate} 
                      onChange={(e) => setCandidateStartDate(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Benefits & Coverage Tier</Label>
                  <Select value={candidateBenefits} onValueChange={setCandidateBenefits}>
                    <SelectTrigger className="text-xs border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Standard Health + Pension">Standard Local Health & Pension</SelectItem>
                      <SelectItem value="Premium (Health + Pension + Tech)">Premium (Private Medical + Tech Equipment Allowance)</SelectItem>
                      <SelectItem value="Executive Comprehensive">Executive Comprehensive Suite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCreateEORHire} className="w-full bg-[#1A1C21] hover:bg-black text-xs font-bold">
                  Submit Onboarding Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active EOR Staff</span>
            <Users className="w-4 h-4 text-[#A079FF]" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">{employees.length} Individuals</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Full-time statutory employees</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jurisdictions</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">
            {new Set(employees.map(e => e.country)).size} Countries
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Local labor contracts active</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Guarantee</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">100% Protected</div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Zero misclassification liability</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly EOR Payroll</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">${totalMonthlySpend.toLocaleString()}/mo</div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Includes tax & benefits routing</p>
        </Card>
      </div>

      {/* Main Tabs Section */}
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="bg-white border border-[#EEEEF0] p-1 rounded-lg mb-6 flex w-full md:w-auto max-w-xl justify-start">
          <TabsTrigger value="team" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <Users className="w-3.5 h-3.5 mr-1.5" /> EOR Employees ({employees.length})
          </TabsTrigger>
          <TabsTrigger value="coverage" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <Globe className="w-3.5 h-3.5 mr-1.5" /> Country Coverage & Rules
          </TabsTrigger>
          <TabsTrigger value="benefits" className="font-bold text-xs rounded-md data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Global Benefits
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: EOR Employee Roster */}
        <TabsContent value="team">
          <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none">
            <div className="p-4 border-b border-[#EEEEF0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search EOR team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="text-xs h-8 w-36 border-slate-200"><SelectValue placeholder="Country" /></SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="All">All Countries</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
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
                    <tr key={emp.id} className="hover:bg-[#FAFAFB]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#1A1C21]">{emp.name}</div>
                        <div className="text-[10px] font-medium text-slate-500">{emp.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-[#1A1C21]">{emp.country}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{emp.entity}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold">${emp.salary.toLocaleString()}/mo</div>
                        <div className="text-[10px] text-slate-400">Paid in {emp.currency}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-700 font-medium">{emp.benefitsTier}</span>
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
        </TabsContent>

        {/* Tab 2: Country Coverage */}
        <TabsContent value="coverage">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNTRY_COMPLIANCE_DATA.map((rule) => (
              <Card key={rule.code} className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black">{rule.country}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{rule.code}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold text-emerald-600 border-emerald-200 bg-emerald-50">
                    Direct Entity
                  </Badge>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Standard Probation</span>
                    <span className="font-bold text-slate-800">{rule.probation}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Statutory Annual Leave</span>
                    <span className="font-bold text-slate-800">{rule.leaveDays}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Notice Period</span>
                    <span className="font-bold text-slate-800">{rule.noticePeriod}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 font-medium">Employer Contributions</span>
                    <span className="font-bold text-slate-800 text-[11px] text-right">{rule.employerTaxes}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setCandidateCountry(rule.country);
                    setIsHireModalOpen(true);
                  }}
                  variant="outline" 
                  className="w-full mt-4 h-8 text-xs font-bold border-slate-200 hover:bg-slate-50"
                >
                  Hire in {rule.country}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: Benefits Management */}
        <TabsContent value="benefits">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-[#A079FF]/10 text-[#A079FF] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1C21]">Global Health & Dental</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Comprehensive inpatient, outpatient, and emergency medical insurance adapted to local top-tier networks.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-slate-700">Included in all packages</Badge>
            </Card>

            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1C21]">Statutory Pensions & Social Security</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Automated computation and remittance to local pension boards, SSNIT, ITF, and government funds.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-blue-700">100% Tax Compliant</Badge>
            </Card>

            <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1C21]">Workstation & Tech Allowances</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Disburse localized stipends for laptops, ergonomic workstations, and high-speed internet.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-700">Customizable</Badge>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={!!selectedEmp} onOpenChange={(open) => !open && setSelectedEmp(null)}>
        <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{selectedEmp?.name}</DialogTitle>
            <DialogDescription className="text-xs">{selectedEmp?.role} • {selectedEmp?.country}</DialogDescription>
          </DialogHeader>

          {selectedEmp && (
            <div className="py-2 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Legal Employer of Record:</span>
                <span className="font-bold text-slate-900">{selectedEmp.entity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gross Monthly Compensation:</span>
                <span className="font-bold text-slate-900">${selectedEmp.salary.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Employment Type:</span>
                <span className="font-bold text-slate-900">Indefinite Full-Time (Compliant)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Benefits Package:</span>
                <span className="font-bold text-slate-900">{selectedEmp.benefitsTier}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-bold text-slate-900">{selectedEmp.startDate}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedEmp(null)} variant="outline" className="w-full text-xs font-bold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
