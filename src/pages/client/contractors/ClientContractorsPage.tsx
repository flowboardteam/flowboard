"use client";

import { useState } from "react";
import { 
  Users, Briefcase, Plus, Search, CheckCircle2, 
  AlertCircle, FileText, ArrowUpRight, DollarSign, 
  Calendar, ShieldCheck, Filter, Download, MoreVertical, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Contractor {
  id: string;
  name: string;
  email: string;
  role: string;
  country: string;
  countryCode: string;
  agreementType: "Monthly Retainer" | "Hourly" | "Fixed Scope";
  rate: number;
  rateUnit: string;
  paymentTerms: "Net 0" | "Net 15" | "Net 30" | "Bi-weekly";
  complianceStatus: "Verified" | "Action Required" | "In Review";
  status: "Active" | "Onboarding" | "Paused";
  startDate: string;
  sowDescription: string;
}

const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: "CTR-101",
    name: "Alex Rivera",
    email: "alex.rivera@dev.io",
    role: "Senior Frontend Engineer (React/Next.js)",
    country: "Nigeria",
    countryCode: "NG",
    agreementType: "Monthly Retainer",
    rate: 4200,
    rateUnit: "/month",
    paymentTerms: "Net 0",
    complianceStatus: "Verified",
    status: "Active",
    startDate: "Nov 01, 2025",
    sowDescription: "Lead frontend architecture, design system component migration, and performance optimization for web apps."
  },
  {
    id: "CTR-102",
    name: "Fatima Al-Sayed",
    email: "fatima.cloud@architect.me",
    role: "Cloud DevOps & Terraform Specialist",
    country: "Egypt",
    countryCode: "EG",
    agreementType: "Monthly Retainer",
    rate: 4800,
    rateUnit: "/month",
    paymentTerms: "Net 15",
    complianceStatus: "Verified",
    status: "Active",
    startDate: "Dec 15, 2025",
    sowDescription: "Automate multi-region AWS and Supabase disaster recovery scripts and continuous integration pipelines."
  },
  {
    id: "CTR-103",
    name: "Kofi Owusu",
    role: "Fullstack Python / FastAPI Engineer",
    email: "kofi.owusu@engineers.tech",
    country: "Ghana",
    countryCode: "GH",
    agreementType: "Hourly",
    rate: 35,
    rateUnit: "/hr",
    paymentTerms: "Bi-weekly",
    complianceStatus: "Verified",
    status: "Active",
    startDate: "Jan 10, 2026",
    sowDescription: "Microservices API engineering, queue workers, and vector embedding indexing pipeline maintenance."
  },
  {
    id: "CTR-104",
    name: "Mariana Santos",
    email: "mariana.ux@design.br",
    role: "UX Research & Product Strategist",
    country: "Brazil",
    countryCode: "BR",
    agreementType: "Fixed Scope",
    rate: 3600,
    rateUnit: " milestone",
    paymentTerms: "Net 0",
    complianceStatus: "Action Required",
    status: "Onboarding",
    startDate: "Oct 15, 2026",
    sowDescription: "Complete user research sprints, usability benchmarking, and interactive Figma prototyping for customer onboarding."
  }
];

export default function ClientContractorsPage() {
  const { toast } = useToast();
  const [contractors, setContractors] = useState<Contractor[]>(INITIAL_CONTRACTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);

  // New contractor form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCountry, setNewCountry] = useState("Nigeria");
  const [newAgreementType, setNewAgreementType] = useState<"Monthly Retainer" | "Hourly" | "Fixed Scope">("Monthly Retainer");
  const [newRate, setNewRate] = useState("");
  const [newTerms, setNewTerms] = useState<"Net 0" | "Net 15" | "Net 30" | "Bi-weekly">("Net 0");
  const [newSow, setNewSow] = useState("");

  const filteredContractors = contractors.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    const matchesType = typeFilter === "All" || c.agreementType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeCount = contractors.filter(c => c.status === "Active").length;
  const totalMonthlyRunRate = contractors.reduce((sum, c) => {
    if (c.agreementType === "Monthly Retainer") return sum + c.rate;
    if (c.agreementType === "Hourly") return sum + (c.rate * 160); // approx 160 hrs
    return sum + c.rate;
  }, 0);

  const handleAddContractor = () => {
    if (!newName || !newEmail || !newRole || !newRate) {
      toast({
        title: "Missing Fields",
        description: "Please complete all required contractor information.",
        variant: "destructive"
      });
      return;
    }

    const newCtr: Contractor = {
      id: `CTR-${Math.floor(100 + Math.random() * 900)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      country: newCountry,
      countryCode: newCountry === "Nigeria" ? "NG" : newCountry === "Ghana" ? "GH" : "GLOBAL",
      agreementType: newAgreementType,
      rate: parseFloat(newRate) || 3500,
      rateUnit: newAgreementType === "Hourly" ? "/hr" : "/month",
      paymentTerms: newTerms,
      complianceStatus: "In Review",
      status: "Onboarding",
      startDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sowDescription: newSow || "Standard software development and engineering consulting services."
    };

    setContractors([newCtr, ...contractors]);
    setIsAddModalOpen(false);

    setNewName("");
    setNewEmail("");
    setNewRole("");
    setNewRate("");
    setNewSow("");

    toast({
      title: "Contractor Agreement Created",
      description: `Contract and onboarding invitation sent to ${newCtr.name}.`
    });
  };

  const handleToggleStatus = (id: string) => {
    setContractors(contractors.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === "Active" ? "Paused" : "Active";
        toast({
          title: `Contractor ${nextStatus}`,
          description: `${c.name}'s contract status updated to ${nextStatus}.`
        });
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  return (
    <div className="w-full p-8 bg-[#FAFAFB] min-h-screen font-sans text-[#1A1C21]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#1A1C21]">Contractors</h1>
            <Badge className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold">
              Independent Agreements
            </Badge>
          </div>
          <p className="text-xs font-medium text-[#1A1C21]/60">
            Manage global independent contractors, agreements, SOW deliverables, tax compliance, and automated payouts.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-md shadow-sm px-5 h-9">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Contractor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Create Contractor Agreement</DialogTitle>
                <DialogDescription className="text-xs">
                  Generate localized consulting agreements, IP protection, and payment routing.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Full Name</Label>
                    <Input 
                      placeholder="e.g. Maya Lin" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Email Address</Label>
                    <Input 
                      type="email"
                      placeholder="maya@example.com" 
                      value={newEmail} 
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Role / Position</Label>
                    <Input 
                      placeholder="e.g. Lead React Engineer" 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Country</Label>
                    <Select value={newCountry} onValueChange={setNewCountry}>
                      <SelectTrigger className="text-xs border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                        <SelectItem value="Ghana">Ghana</SelectItem>
                        <SelectItem value="Kenya">Kenya</SelectItem>
                        <SelectItem value="South Africa">South Africa</SelectItem>
                        <SelectItem value="Egypt">Egypt</SelectItem>
                        <SelectItem value="Brazil">Brazil</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Philippines">Philippines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Agreement Type</Label>
                    <Select value={newAgreementType} onValueChange={(v: any) => setNewAgreementType(v)}>
                      <SelectTrigger className="text-xs border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Monthly Retainer">Monthly Retainer</SelectItem>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Fixed Scope">Fixed Scope</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Rate ($ USD)</Label>
                    <Input 
                      type="number"
                      placeholder="4000" 
                      value={newRate} 
                      onChange={(e) => setNewRate(e.target.value)}
                      className="text-xs border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Payout Terms</Label>
                    <Select value={newTerms} onValueChange={(v: any) => setNewTerms(v)}>
                      <SelectTrigger className="text-xs border-slate-200"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Net 0">Net 0 (Instant)</SelectItem>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Scope of Work (SOW)</Label>
                  <Textarea 
                    placeholder="Describe main responsibilities, milestones, and deliverable expectations..."
                    value={newSow}
                    onChange={(e) => setNewSow(e.target.value)}
                    className="text-xs border-slate-200 min-h-[80px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleAddContractor} className="w-full bg-[#1A1C21] hover:bg-black text-xs font-bold">
                  Generate Agreement & Invite
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Contractors</span>
            <Users className="w-4 h-4 text-[#A079FF]" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">{activeCount} Contractors</div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Direct consulting agreements</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">${totalMonthlyRunRate.toLocaleString()}</div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Across all active contracts</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance & Tax Forms</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">100% W-8BEN Signed</div>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Zero misclassification risk</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Invoices</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-[#1A1C21]">1 Pending Review</div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Ready for payroll cycle</p>
        </Card>
      </div>

      {/* Contractors Table Card */}
      <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none">
        <div className="p-4 border-b border-[#EEEEF0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search contractors, roles, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="text-xs h-8 w-36 border-slate-200"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Monthly Retainer">Monthly Retainer</SelectItem>
                <SelectItem value="Hourly">Hourly</SelectItem>
                <SelectItem value="Fixed Scope">Fixed Scope</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-xs h-8 w-32 border-slate-200"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Onboarding">Onboarding</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Contractor</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Country</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Agreement & Rate</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Payment Terms</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Compliance</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEEF0]">
              {filteredContractors.map((ctr) => (
                <tr key={ctr.id} className="hover:bg-[#FAFAFB]/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-[#1A1C21]">{ctr.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{ctr.role}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ctr.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-[#1A1C21]">{ctr.country}</div>
                    <div className="text-[10px] text-slate-400">Remote Contract</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-[#1A1C21]">
                      ${ctr.rate.toLocaleString()}<span className="text-slate-500 font-normal">{ctr.rateUnit}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{ctr.agreementType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-700 bg-slate-50">
                      {ctr.paymentTerms}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      {ctr.complianceStatus === "Verified" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className={ctr.complianceStatus === "Verified" ? "text-emerald-700 font-bold text-[11px]" : "text-amber-700 font-medium text-[11px]"}>
                        {ctr.complianceStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-none ${
                      ctr.status === "Active" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : ctr.status === "Onboarding"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {ctr.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedContractor(ctr)}
                        className="text-xs font-bold text-[#A079FF] hover:bg-[#A079FF]/10 h-7 px-2.5"
                      >
                        View SOW
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(ctr.id)}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 h-7 px-2"
                      >
                        {ctr.status === "Active" ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* SOW & Details Modal */}
      <Dialog open={!!selectedContractor} onOpenChange={(open) => !open && setSelectedContractor(null)}>
        <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{selectedContractor?.name}</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedContractor?.role} • {selectedContractor?.country}
            </DialogDescription>
          </DialogHeader>

          {selectedContractor && (
            <div className="py-3 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Compensation Rate</span>
                  <p className="font-bold text-slate-900 mt-0.5">${selectedContractor.rate.toLocaleString()} {selectedContractor.rateUnit}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Agreement Structure</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedContractor.agreementType}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Payment Schedule</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedContractor.paymentTerms}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Effective Since</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedContractor.startDate}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900">Scope of Work & Deliverables (SOW)</Label>
                <div className="p-3 bg-white border border-slate-200 rounded-md text-slate-700 leading-relaxed">
                  {selectedContractor.sowDescription}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900">Legal Documents & Compliance</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Independent Contractor Agreement (Signed)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">Proprietary Information & Inventions Agreement (PIIA)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-200">Signed</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedContractor(null)} variant="outline" className="w-full text-xs font-bold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
