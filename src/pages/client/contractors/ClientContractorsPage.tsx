"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Users, Briefcase, Plus, Search, CheckCircle2, 
  AlertCircle, FileText, ArrowUpRight, DollarSign, 
  Calendar, ShieldCheck, Filter, Download, MoreVertical, 
  CreditCard, LayoutList, Kanban, MapPin, Trash2
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
import { 
  COUNTRY_LIST, 
  CURRENCY_LIST, 
  UnifiedWorkforceMember, 
  fetchUnifiedWorkforce, 
  addUnifiedMember, 
  deleteUnifiedMember 
} from "@/lib/workforceSync";

export default function ClientContractorsPage() {
  const { toast } = useToast();
  const [allMembers, setAllMembers] = useState<UnifiedWorkforceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [agreementFilter, setAgreementFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [kanbanGrouping, setKanbanGrouping] = useState<"status" | "agreement">("status");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<UnifiedWorkforceMember | null>(null);

  // New contractor form state
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDepartment, setNewDepartment] = useState("Engineering");
  const [newCountry, setNewCountry] = useState("Nigeria");
  const [newAgreementType, setNewAgreementType] = useState<"Monthly Retainer" | "Hourly" | "Fixed Scope">("Monthly Retainer");
  const [newRate, setNewRate] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newPaymentTerms, setNewPaymentTerms] = useState<"Net 0" | "Net 15" | "Net 30" | "Bi-weekly">("Net 0");
  const [newSow, setNewSow] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUnifiedWorkforce();
      setAllMembers(data);
    } catch (e) {
      console.warn("Failed to load contractors:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener("workforce_updated", handleSync);
    return () => window.removeEventListener("workforce_updated", handleSync);
  }, []);

  const contractors = useMemo(() => {
    return allMembers.filter((m) => m.employment_model === "contractor");
  }, [allMembers]);

  const filteredContractors = useMemo(() => {
    return contractors.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        c.full_name.toLowerCase().includes(q) ||
        (c.role_title && c.role_title.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q));

      const agrType = c.contractor_settings?.agreementType || "Monthly Retainer";
      const matchesAgreement = agreementFilter === "All" || agrType === agreementFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;

      return matchesSearch && matchesAgreement && matchesStatus;
    });
  }, [contractors, searchQuery, agreementFilter, statusFilter]);

  // Metrics
  const activeCount = contractors.filter((c) => c.status === "Active").length;
  const estimatedMonthlySpend = contractors.reduce((sum, c) => {
    return sum + (c.payment_monthly || 0);
  }, 0);

  const handleCreateContractor = async () => {
    if (!newFullName.trim() || !newRole.trim() || !newRate.trim()) {
      toast({
        title: "Incomplete details",
        description: "Please enter contractor full name, job title, and rate.",
        variant: "destructive"
      });
      return;
    }

    try {
      await addUnifiedMember({
        full_name: newFullName.trim(),
        email: newEmail.trim() || null,
        role_title: newRole.trim(),
        department: newDepartment,
        location: newCountry,
        start_date: newStartDate,
        payment_monthly: parseFloat(newRate) || 0,
        payment_currency: newCurrency,
        employment_model: "contractor",
        status: "Active",
        contractor_settings: {
          agreementType: newAgreementType,
          paymentTerms: newPaymentTerms,
          rateUnit: newAgreementType === "Hourly" ? "/hr" : newAgreementType === "Monthly Retainer" ? "/month" : " milestone",
          sowDescription: newSow.trim() || "Independent contractor services as specified in project milestone SOW.",
          complianceStatus: "Verified"
        }
      });

      setIsAddModalOpen(false);
      setNewFullName("");
      setNewEmail("");
      setNewRole("");
      setNewRate("");
      setNewSow("");

      toast({
        title: "Contractor Added ✓",
        description: `${newFullName} has been added to your contractors roster.`
      });

      await loadData();
    } catch (err: any) {
      toast({
        title: "Error adding contractor",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteContractor = async (id: string, name: string) => {
    await deleteUnifiedMember(id);
    toast({
      title: "Contractor Removed",
      description: `${name} has been removed from your contractor roster.`
    });
    setSelectedContractor(null);
    await loadData();
  };

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
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#1A1C21]">Contractors & SOW Management</h1>
            <Badge className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-medium">
              Automated W-8BEN & Tax
            </Badge>
          </div>
          <p className="text-xs font-normal text-[#1A1C21]/60">
            Manage global independent contractors, execute automated ICAs, review statement of works, and streamline invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/client/workforce">
            <Button variant="outline" className="border-slate-200 text-xs font-bold rounded-lg h-9">
              <Users className="w-3.5 h-3.5 mr-1.5" /> View Full Team
            </Button>
          </Link>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-lg shadow-sm px-4 h-9">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> + Add Contractor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-xl max-w-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-900" />
                  Onboard Global Contractor
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Generate localized Independent Contractor Agreements (ICA) and establish automated milestone payouts.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 py-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Contractor Full Name *</Label>
                  <Input 
                    placeholder="e.g. Alex Rivera" 
                    value={newFullName} 
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="text-xs border-slate-200 h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Email Address</Label>
                    <Input 
                      placeholder="alex@dev.io" 
                      type="email"
                      value={newEmail} 
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Department</Label>
                    <Select value={newDepartment} onValueChange={setNewDepartment}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Product">Product</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Job Title / Role *</Label>
                    <Input 
                      placeholder="e.g. Lead Frontend Architect" 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Country of Tax Residence</Label>
                    <Select value={newCountry} onValueChange={setNewCountry}>
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
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Agreement Structure</Label>
                    <Select value={newAgreementType} onValueChange={(val: any) => setNewAgreementType(val)}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Monthly Retainer">Monthly Retainer</SelectItem>
                        <SelectItem value="Hourly">Hourly</SelectItem>
                        <SelectItem value="Fixed Scope">Fixed Scope</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Rate / Amount *</Label>
                    <Input 
                      placeholder="e.g. 4500" 
                      type="number"
                      value={newRate} 
                      onChange={(e) => setNewRate(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Currency</Label>
                    <Select value={newCurrency} onValueChange={setNewCurrency}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        {CURRENCY_LIST.slice(0, 6).map((cur) => (
                          <SelectItem key={cur.code} value={cur.code}>{cur.code} ({cur.symbol})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Payment Terms</Label>
                    <Select value={newPaymentTerms} onValueChange={(val: any) => setNewPaymentTerms(val)}>
                      <SelectTrigger className="text-xs border-slate-200 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Net 0">Immediate (Net 0)</SelectItem>
                        <SelectItem value="Net 15">Net 15 days</SelectItem>
                        <SelectItem value="Net 30">Net 30 days</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly cadence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">Start Date</Label>
                    <Input 
                      type="date"
                      value={newStartDate} 
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="text-xs border-slate-200 h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold">Statement of Work (SOW) Scope</Label>
                  <Textarea 
                    placeholder="Brief outline of deliverables and milestones..."
                    value={newSow}
                    onChange={(e) => setNewSow(e.target.value)}
                    className="text-xs border-slate-200 h-16 resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="text-xs h-9">
                  Cancel
                </Button>
                <Button onClick={handleCreateContractor} className="bg-[#1A1C21] hover:bg-black text-white text-xs font-bold h-9">
                  Save Contractor
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row (Dynamic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Active Contractors</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">{activeCount} Contractors</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">Independent service agreements</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Estimated Monthly Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">${estimatedMonthlySpend.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Retainers & fixed scopes</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tax & Legal Compliance</span>
            <ShieldCheck className="w-4 h-4 text-[#A079FF]" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">W-8BEN / ICA Active</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">Direct IP assignment clauses</p>
        </Card>

        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Pending Invoices</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-medium text-[#1A1C21]">0 Invoices Due</div>
          <p className="text-[10px] text-slate-500 font-normal mt-1">All contractor payouts current</p>
        </Card>
      </div>

      {/* Controls Bar & View Switcher */}
      <div className="bg-white border border-[#EEEEF0] rounded-xl p-3 mb-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search contractors by name, role, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 border-slate-200 w-full"
            />
          </div>

          <Select value={agreementFilter} onValueChange={setAgreementFilter}>
            <SelectTrigger className="text-xs h-8 w-36 border-slate-200">
              <SelectValue placeholder="Agreement" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All Agreements</SelectItem>
              <SelectItem value="Monthly Retainer">Monthly Retainer</SelectItem>
              <SelectItem value="Hourly">Hourly</SelectItem>
              <SelectItem value="Fixed Scope">Fixed Scope</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-xs h-8 w-32 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Onboarding">Onboarding</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-3">
          {viewMode === "kanban" && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Group:</span>
              <button
                onClick={() => setKanbanGrouping("status")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  kanbanGrouping === "status" ? "bg-slate-200 text-black" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setKanbanGrouping("agreement")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  kanbanGrouping === "agreement" ? "bg-slate-200 text-black" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Structure
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === "list" 
                  ? "bg-white text-black shadow-xs" 
                  : "text-slate-500 hover:text-black"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === "kanban" 
                  ? "bg-white text-black shadow-xs" 
                  : "text-slate-500 hover:text-black"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredContractors.length === 0 ? (
        <Card className="bg-white border border-[#EEEEF0] rounded-xl shadow-none py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 mx-auto flex items-center justify-center mb-4 text-[#1A1C21]">
            <Briefcase className="w-8 h-8 text-[#1A1C21]" />
          </div>
          <h3 className="text-base font-bold text-[#1A1C21] tracking-tight mb-1">
            {searchQuery || agreementFilter !== "All" || statusFilter !== "All" 
              ? "No matching contractors found" 
              : "No contractors added yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {searchQuery || agreementFilter !== "All" || statusFilter !== "All"
              ? "Try adjusting your filters or search keywords to find specific contractors."
              : "When talent is added to your workforce as an independent contractor, their SOWs, payment terms, and signed agreements appear here."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#1A1C21] hover:bg-black text-white text-xs font-bold px-5 h-9"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> + Add Contractor
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
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Contractor</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Country</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Agreement Structure</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Rate & Terms</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase text-[#1A1C21]/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEEF0]">
                {filteredContractors.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFB]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {c.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1A1C21]">{c.full_name}</div>
                          <div className="text-[10px] text-slate-400">{c.role_title || "Contractor"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-[#1A1C21] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {c.location || "Global"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs border-slate-200 font-semibold bg-slate-50">
                        {c.contractor_settings?.agreementType || "Monthly Retainer"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-[#1A1C21]">
                        {fmtCurrency(c.payment_monthly, c.payment_currency)}{c.contractor_settings?.rateUnit || "/mo"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.contractor_settings?.paymentTerms || "Net 0"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-none ${
                        c.status === "Active" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedContractor(c)}
                        className="text-xs font-bold text-[#A079FF] hover:bg-[#A079FF]/10 h-7 px-2.5"
                      >
                        SOW & Terms
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
            (["Active", "Onboarding", "Paused"] as const).map((colStatus) => {
              const items = filteredContractors.filter((c) => c.status === colStatus);
              return (
                <div key={colStatus} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        colStatus === "Active" ? "bg-emerald-500" : colStatus === "Onboarding" ? "bg-amber-500" : "bg-slate-400"
                      }`} />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{colStatus}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5">
                      {items.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 flex-1">
                    {items.map((c) => (
                      <div 
                        key={c.id}
                        onClick={() => setSelectedContractor(c)}
                        className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 leading-snug">{c.full_name}</h5>
                            <p className="text-[11px] text-slate-500">{c.role_title || "Contractor"}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {c.location || "Global"}
                          </span>
                        </div>

                        <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-800">
                            {fmtCurrency(c.payment_monthly, c.payment_currency)}{c.contractor_settings?.rateUnit || "/mo"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {c.contractor_settings?.agreementType || "Retainer"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-xs font-medium">
                        No contractors in {colStatus.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            (["Monthly Retainer", "Hourly", "Fixed Scope"] as const).map((agrType) => {
              const items = filteredContractors.filter(
                (c) => (c.contractor_settings?.agreementType || "Monthly Retainer") === agrType
              );
              return (
                <div key={agrType} className="bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-600" />
                      <h4 className="text-xs font-bold text-slate-800">{agrType}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5">
                      {items.length}
                    </Badge>
                  </div>

                  <div className="space-y-3 flex-1">
                    {items.map((c) => (
                      <div 
                        key={c.id}
                        onClick={() => setSelectedContractor(c)}
                        className="bg-white border border-slate-200/90 rounded-lg p-3.5 shadow-xs hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{c.full_name}</h5>
                            <p className="text-[11px] text-slate-500">{c.role_title || "Contractor"}</p>
                          </div>
                          <Badge className={`text-[9px] font-bold ${
                            c.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {c.status}
                          </Badge>
                        </div>

                        <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                          <span className="font-bold text-slate-800">
                            {fmtCurrency(c.payment_monthly, c.payment_currency)}{c.contractor_settings?.rateUnit || "/mo"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {c.contractor_settings?.paymentTerms || "Net 0"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="p-6 border border-dashed border-slate-300 rounded-lg text-center text-slate-400 text-xs font-medium">
                        No contractors under {agrType.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Contractor Details & SOW Modal */}
      {selectedContractor && (
        <Dialog open={!!selectedContractor} onOpenChange={(open) => !open && setSelectedContractor(null)}>
          <DialogContent className="bg-white border-slate-200 rounded-xl max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center justify-between">
                <span>{selectedContractor.full_name}</span>
                <Badge className="text-[9px] font-bold uppercase">{selectedContractor.status}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedContractor.role_title} · {selectedContractor.location}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement Type</span>
                  <span className="font-bold text-slate-800">{selectedContractor.contractor_settings?.agreementType || "Monthly Retainer"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rate / Compensation</span>
                  <span className="font-bold text-slate-800">
                    {fmtCurrency(selectedContractor.payment_monthly, selectedContractor.payment_currency)}{selectedContractor.contractor_settings?.rateUnit || "/mo"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Terms</span>
                  <span className="font-bold text-slate-800">{selectedContractor.contractor_settings?.paymentTerms || "Net 0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Compliance Status</span>
                  <span className="font-bold text-emerald-600">W-8BEN Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Start Date</span>
                  <span className="font-bold text-slate-800">{selectedContractor.start_date || "Immediate"}</span>
                </div>
              </div>

              <div>
                <Label className="text-[11px] font-bold text-slate-600">Statement of Work (SOW)</Label>
                <p className="mt-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200 leading-relaxed">
                  {selectedContractor.contractor_settings?.sowDescription || "Standard independent software engineering and product consulting agreement."}
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between w-full">
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDeleteContractor(selectedContractor.id, selectedContractor.full_name)}
                className="text-xs h-8"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove Contractor
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedContractor(null)}
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
