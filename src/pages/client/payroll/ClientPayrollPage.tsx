"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  History, Users, DollarSign, Settings,
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  Plus, ShieldAlert, Edit3, CheckCircle, UserPlus, UploadCloud, Trash2, FileCheck, XCircle, Eye
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useGroups } from "@/contexts/GroupContext";

// --- Interfaces ---
interface PayrollRecord {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: "Completed" | "Active";
  employeesPaid: number;
  type: string;
  employeesIncluded: Employee[];
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: "Active" | "Suspended" | "Terminated";
  bank: string;
  account: string;
  type: "Contractor" | "Full-time" | "Part-time";
}

interface SalaryComponent {
  id: string;
  name: string;
  type: "Earning" | "Deduction";
  amountType: "Percentage" | "Fixed";
  value: number;
  description: string;
}

interface Policy {
  id: string;
  roleName: string;
  baseSalary: number;
  taxProfile: string;
  allowances: string[];
}

interface ContractorInvoice {
  id: string;
  invoice_number: string;
  amount: string;
  date: string;
  description: string;
  status: "Pending" | "Approved" | "Denied";
  talent_name: string;
  talent_id: string;
  client_id?: string;
}

export default function ClientPayrollPage() {
  const { toast } = useToast();
  const { activeGroup } = useGroups();
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(true);
  
  // --- State Management ---
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);

  const [employees, setEmployees] = useState<Employee[]>([
    { id: "EMP-001", name: "Sarah Jenkins", role: "Web Designer", department: "Design", salary: 5500, status: "Active", bank: "Flowboard Wallet", account: "Acct-9901", type: "Full-time" },
    { id: "EMP-002", name: "Michael Kojo", role: "Marketer", department: "Marketing", salary: 4000, status: "Active", bank: "Flowboard Wallet", account: "Acct-2234", type: "Contractor" },
    { id: "EMP-003", name: "Kenneth Dedu", role: "Social Media Manager", department: "Marketing", salary: 3500, status: "Active", bank: "Flowboard Wallet", account: "Acct-0019", type: "Part-time" },
    { id: "EMP-004", name: "Anime World", role: "Software Engineer", department: "Engineering", salary: 8500, status: "Suspended", bank: "Flowboard Wallet", account: "Acct-7781", type: "Full-time" }
  ]);

  const [components, setComponents] = useState<SalaryComponent[]>([
    { id: "COMP-001", name: "Housing Allowance", type: "Earning", amountType: "Fixed", value: 500, description: "Standard housing tier" },
    { id: "COMP-002", name: "PAYE Tax", type: "Deduction", amountType: "Percentage", value: 15, description: "Statutory federal income tax" },
    { id: "COMP-003", name: "Pension Scheme", type: "Deduction", amountType: "Percentage", value: 5, description: "Retirement savings plan" }
  ]);

  const [policies, setPolicies] = useState<Policy[]>([
    { id: "POL-001", roleName: "Senior Engineer", baseSalary: 8000, taxProfile: "Tier 3 (15%)", allowances: ["Housing", "Medical"] },
    { id: "POL-002", roleName: "Associate Marketer", baseSalary: 3800, taxProfile: "Tier 1 (10%)", allowances: ["Transport"] }
  ]);

  const [contractorInvoices, setContractorInvoices] = useState<ContractorInvoice[]>([]);

  // Modals
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [payrollRunName, setPayrollRunName] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [empFilter, setEmpFilter] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [newTag, setNewTag] = useState("");
  const [selectedRun, setSelectedRun] = useState<PayrollRecord | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvingInvoiceId, setApprovingInvoiceId] = useState("");
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingRunId, setSchedulingRunId] = useState("");
  const [schedDateOnly, setSchedDateOnly] = useState("");
  const [schedHour, setSchedHour] = useState("12");
  const [schedMinute, setSchedMinute] = useState("00");
  const [schedAmpm, setSchedAmpm] = useState("AM");

  // Add New Employee Forms
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpSalary, setNewEmpSalary] = useState("");
  const [newEmpType, setNewEmpType] = useState<"Full-time" | "Contractor" | "Part-time" | "One-Time Item">("Full-time");

  const [compName, setCompName] = useState("");
  const [compType, setCompType] = useState<"Earning" | "Deduction">("Earning");
  const [compAmtType, setCompAmtType] = useState<"Percentage" | "Fixed">("Fixed");
  const [compValue, setCompValue] = useState("");
  const [compDesc, setCompDesc] = useState("");

  const initPayroll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const groupId = activeGroup?.id || "default-group";
      const localKey = `flowboard_payroll_${groupId}`;
      const localData = localStorage.getItem(localKey);
      
      let initialHistory: PayrollRecord[] = [];
      let initialEmployees: Employee[] = [];
      let initialComponents: SalaryComponent[] = [];
      let initialPolicies: Policy[] = [];
      let initialInvoices: ContractorInvoice[] = [];

      if (localData) {
        const parsed = JSON.parse(localData);
        initialHistory = parsed.history || [];
        initialEmployees = parsed.employees || [];
        initialComponents = parsed.components || [];
        initialPolicies = parsed.policies || [];
        initialInvoices = parsed.invoices || [];
      }

      // ── FETCH REMOTE INVOICES ──
      // 1. Get all workforce members for this organization
      const orgIds = [user.id];
      if (activeGroup?.id) orgIds.push(activeGroup.id);

      const { data: members } = await supabase
        .from("workforce_members")
        .select("profile_id")
        .in("organization_id", orgIds);

      if (members && members.length > 0) {
        const profileIds = members.map(m => m.profile_id);
        
        // 2. Fetch profiles for these members to check their system_prefs.raised_invoices
        const { data: talProfiles } = await supabase
          .from("profiles")
          .select("id, system_prefs")
          .in("id", profileIds);

        if (talProfiles) {
          talProfiles.forEach(p => {
            const remoteInvoices = p.system_prefs?.raised_invoices || [];
            remoteInvoices.forEach((ri: any) => {
              if (ri.client_id === user.id || ri.client_id === (activeGroup?.id || "default-group")) {
                if (!initialInvoices.some(li => li.id === ri.id)) {
                  initialInvoices.push(ri);
                }
              }
            });
          });
        }
      }

      setPayrollHistory(initialHistory);
      setEmployees(initialEmployees);
      setComponents(initialComponents);
      setPolicies(initialPolicies);
      setContractorInvoices(initialInvoices);
      
      if (initialInvoices.length > 0) {
        console.log(`[Payroll] Loaded ${initialInvoices.length} invoices for organization(s):`, orgIds);
      }
      
      const mergedData = {
        history: initialHistory,
        employees: initialEmployees,
        components: initialComponents,
        policies: initialPolicies,
        invoices: initialInvoices
      };
      localStorage.setItem(localKey, JSON.stringify(mergedData));

    } catch (e) {
      console.error("Payroll init failed", e);
    } finally {
      setLoading(false);
    }
  }, [activeGroup?.id]);

  useEffect(() => {
    initPayroll();
  }, [initPayroll]);

  useEffect(() => {
    const checkSchedules = async () => {
      let hasChanged = false;
      const now = Date.now();
      
      const updatedHistory = payrollHistory.map(pr => {
        if (pr.status === "Active" && pr.scheduledDate) {
          try {
            const parts = pr.scheduledDate.split(" ");
            if (parts.length >= 5) {
              const monthStr = parts[0].substring(0, 3);
              const dayStr = parts[1].replace(",", "");
              const yearStr = parts[2];
              const timeStr = parts[3];
              const ampm = parts[4];
              
              const [hourStr, minuteStr] = timeStr.split(":");
              let hour = parseInt(hourStr);
              const minute = parseInt(minuteStr);
              
              if (ampm === "PM" && hour < 12) hour += 12;
              if (ampm === "AM" && hour === 12) hour = 0;
              
              const months: Record<string, number> = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
              };
              
              const month = months[monthStr];
              if (month !== undefined) {
                const schedDate = new Date(parseInt(yearStr), month, parseInt(dayStr), hour, minute);
                if (now >= schedDate.getTime()) {
                  hasChanged = true;
                  return { ...pr, status: "Completed" as const };
                }
              }
            }
          } catch (e) {
            console.error("Schedule parsing failed", e);
          }
        }
        return pr;
      });
      
      if (hasChanged) {
        setPayrollHistory(updatedHistory);
        await syncState({ payroll_history: updatedHistory });
        toast({ title: "Auto-Disbursal Scheduled", description: "Auto-Disbursal Scheduled" });
      }
    };
    
    const interval = setInterval(checkSchedules, 4000);
    const invoiceInterval = setInterval(initPayroll, 10000); 
    return () => {
      clearInterval(interval);
      clearInterval(invoiceInterval);
    };
  }, [payrollHistory, initPayroll]);

  const syncState = async (updatedPayload: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("system_prefs").eq("id", user.id).single();
      
      await supabase.from("profiles").update({
        system_prefs: {
          ...(profile?.system_prefs || {}),
          ...updatedPayload
        }
      }).eq("id", user.id);
    } catch (err) {
      console.error("Database synchronization error:", err);
    }
  };

  const executePayrollRun = async () => {
    if (!payrollRunName) {
      toast({ title: "Name Required", variant: "destructive" });
      return;
    }

    const subset = employees.filter(e => selectedEmpIds.includes(e.id));
    const total = subset.reduce((sum, e) => sum + e.salary, 0);

    const newRecord: PayrollRecord = {
      id: `PR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: payrollRunName,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: `$${total.toLocaleString()}`,
      status: "Active",
      employeesPaid: subset.length,
      type: "Disbursement",
      employeesIncluded: subset
    };

    const updatedHistory = [newRecord, ...payrollHistory];
    setPayrollHistory(updatedHistory);
    await syncState({ payroll_history: updatedHistory });

    setPayrollRunName("");
    setSelectedEmpIds([]);
    setIsRunModalOpen(false);

    toast({ title: "Payroll Run Initiated", description: `Cycle '${newRecord.name}' deployed.` });
  };

  const allocateInvoiceToPayroll = async () => {
    if (!selectedPayrollRunId) {
      toast({ title: "Payroll Selection Required", variant: "destructive" });
      return;
    }

    const targetInvoice = contractorInvoices.find(i => i.id === approvingInvoiceId);
    if (!targetInvoice) return;

    const payrollToUpdate = payrollHistory.find(pr => pr.id === selectedPayrollRunId);
    if (payrollToUpdate) {
      const invoiceValue = parseFloat(targetInvoice.amount.replace("$", "").replace(",", "")) || 0;
      const oldTotal = parseFloat(payrollToUpdate.amount.replace("$", "").replace(",", "")) || 0;
      const newTotal = oldTotal + invoiceValue;

      const mockEmp: Employee = {
        id: targetInvoice.talent_id,
        name: targetInvoice.talent_name,
        role: "Contractor",
        department: "Contractors",
        salary: invoiceValue,
        status: "Active",
        bank: "Flowboard Wallet",
        account: "Acct-XXXX",
        type: "Contractor"
      };

      const updatedHistory = payrollHistory.map(pr => 
        pr.id === selectedPayrollRunId 
          ? { 
              ...pr, 
              amount: `$${newTotal.toLocaleString()}`,
              employeesPaid: pr.employeesPaid + 1,
              employeesIncluded: [...(pr.employeesIncluded || []), mockEmp]
            } 
          : pr
      );

      setPayrollHistory(updatedHistory);
      await syncState({ payroll_history: updatedHistory });
    }

    await updateInvoiceStatus(approvingInvoiceId, "Approved");
    setIsApprovalModalOpen(false);
    setApprovingInvoiceId("");
    setSelectedPayrollRunId("");
  };

  const toggleEmpInActiveRun = async (emp: Employee) => {
    if (!selectedRun) return;
    
    const alreadyIncluded = selectedRun.employeesIncluded?.some(e => e.id === emp.id) || false;
    let updatedIncluded = [];
    if (alreadyIncluded) {
      updatedIncluded = selectedRun.employeesIncluded.filter(e => e.id !== emp.id);
    } else {
      updatedIncluded = [...(selectedRun.employeesIncluded || []), emp];
    }
    
    const total = updatedIncluded.reduce((sum, e) => sum + e.salary, 0);
    
    const updatedRun = {
      ...selectedRun,
      employeesIncluded: updatedIncluded,
      amount: `$${total.toLocaleString()}`,
      employeesPaid: updatedIncluded.length
    };
    
    const updatedHistory = payrollHistory.map(pr => pr.id === selectedRun.id ? updatedRun : pr);
    setPayrollHistory(updatedHistory);
    setSelectedRun(updatedRun);
    await syncState({ payroll_history: updatedHistory });
  };

  const handleAddEmployee = async () => {
    if (!newEmpName || !newEmpRole) return;
    const newEmp: Employee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmpName,
      role: newEmpRole,
      department: "General",
      salary: parseFloat(newEmpSalary) || 3000,
      status: "Active",
      bank: "Flowboard Wallet",
      account: "Acct-9999",
      type: newEmpType
    };

    const updatedEmployees = [...employees, newEmp];
    setEmployees(updatedEmployees);
    await syncState({ payroll_employees: updatedEmployees });

    setNewEmpName("");
    setNewEmpRole("");
    setNewEmpSalary("");

    toast({ title: "Employee Added", description: `${newEmpName} onboarded.` });
  };

  const handleDeleteEmployee = async (empId: string) => {
    const updatedEmployees = employees.filter(e => e.id !== empId);
    setEmployees(updatedEmployees);
    await syncState({ payroll_employees: updatedEmployees });
    toast({ title: "Employee Removed" });
  };

  const handleAddSalaryComponent = async () => {
    if (!compName) return;
    const newComp: SalaryComponent = {
      id: `COMP-${Math.floor(100 + Math.random() * 900)}`,
      name: compName,
      type: compType,
      amountType: compAmtType,
      value: parseFloat(compValue) || 0,
      description: compDesc || "Allowance"
    };

    const updatedComponents = [...components, newComp];
    setComponents(updatedComponents);
    await syncState({ payroll_components: updatedComponents });

    setCompName("");
    setCompValue("");
    setCompDesc("");

    toast({ title: "Component Added" });
  };

  const updateInvoiceStatus = async (invId: string, newStatus: "Approved" | "Denied") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedInvoices = contractorInvoices.map(inv => 
        inv.id === invId ? { ...inv, status: newStatus } : inv
      );
      setContractorInvoices(updatedInvoices);

      const { data: profile } = await supabase.from("profiles").select("system_prefs").eq("id", user.id).single();
      const prefs = profile?.system_prefs || {};
      
      let approvedIds = prefs.approved_invoice_ids || [];
      let deniedIds = prefs.denied_invoice_ids || [];

      if (newStatus === "Approved") {
        if (!approvedIds.includes(invId)) approvedIds.push(invId);
        deniedIds = deniedIds.filter((id: string) => id !== invId);
      } else {
        if (!deniedIds.includes(invId)) deniedIds.push(invId);
        approvedIds = approvedIds.filter((id: string) => id !== invId);
      }

      await supabase.from("profiles").update({
        system_prefs: {
          ...prefs,
          approved_invoice_ids: approvedIds,
          denied_invoice_ids: deniedIds
        }
      }).eq("id", user.id);

      const targetInvoice = contractorInvoices.find(i => i.id === invId);
      if (targetInvoice) {
        const { data: tProfile } = await supabase.from("profiles").select("system_prefs").eq("id", targetInvoice.talent_id).single();
        if (tProfile) {
          const tInvoices = (tProfile.system_prefs?.raised_invoices || []).map((ti: any) => 
            ti.id === invId ? { ...ti, status: newStatus } : ti
          );
          await supabase.from("profiles").update({
            system_prefs: {
              ...(tProfile.system_prefs || {}),
              raised_invoices: tInvoices
            }
          }).eq("id", targetInvoice.talent_id);
        }
      }

      toast({ title: `Invoice ${newStatus}` });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const typeMatch = empFilter === "All" || e.type === empFilter;
    const tagMatch = tagFilter === "All" || (e.tags && e.tags.includes(tagFilter));
    return typeMatch && tagMatch;
  });

  if (loading) {
    return <div className="w-full p-8 text-slate-400 text-xs font-bold">Synchronizing parameters...</div>;
  }

  return (
    <div className="w-full p-8 bg-[#FAFAFB] min-h-screen font-sans text-[#1A1C21]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#1A1C21]">Payroll</h1>
          <p className="text-sm font-medium text-[#1A1C21]/60 mt-1">Send Bulk Payments in Seconds</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Run Payroll Modal */}
          <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-md shadow-sm px-6">
                Run Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Run Disbursements</DialogTitle>
                <DialogDescription className="text-xs">Pay team, vendors, and partners without delays.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Payroll Name</Label>
                  <Input 
                    placeholder="e.g. April 2025 Payroll / Nigeria Contractors" 
                    value={payrollRunName} 
                    onChange={(e) => setPayrollRunName(e.target.value)}
                    className="text-xs border-slate-200"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <Label className="text-xs font-bold">Select Recipients</Label>
                    <div className="flex gap-2">
                      <Select value={empFilter} onValueChange={setEmpFilter}>
                        <SelectTrigger className="text-xs border-slate-200 h-8 w-28"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="All" className="text-xs">All Staff</SelectItem>
                          <SelectItem value="Full-time" className="text-xs">Full-time</SelectItem>
                          <SelectItem value="Contractor" className="text-xs">Contractors</SelectItem>
                          <SelectItem value="Part-time" className="text-xs">Part-time</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={tagFilter} onValueChange={setTagFilter}>
                        <SelectTrigger className="text-xs border-slate-200 h-8 w-28"><SelectValue placeholder="Tag" /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="All" className="text-xs">All Tags</SelectItem>
                          {Array.from(new Set(employees.flatMap(e => e.tags || []))).map(tag => (
                            <SelectItem key={tag} value={tag} className="text-xs">{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 p-2 bg-slate-50/80 rounded-md border border-slate-100">
                    <Input 
                      placeholder="Create & assign tag to selected" 
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)}
                      className="text-xs h-7 border-slate-200 bg-white"
                    />
                    <Button 
                      onClick={async () => {
                        if (!newTag.trim()) return;
                        const updated = employees.map(e => 
                          selectedEmpIds.includes(e.id) 
                            ? { ...e, tags: Array.from(new Set([...(e.tags || []), newTag.trim()])) } 
                            : e
                        );
                        setEmployees(updated);
                        await syncState({ payroll_employees: updated });
                        setNewTag("");
                        toast({ title: "Tags Assigned", description: `Successfully associated tag.` });
                      }}
                      className="text-[10px] font-bold h-7 bg-[#1A1C21] hover:bg-black text-white rounded-md shadow-sm"
                    >
                      Apply Tag
                    </Button>
                  </div>

                  <div className="flex gap-2 pb-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedEmpIds(filteredEmployees.map(e => e.id))} 
                      className="text-[10px] font-bold h-7 px-2"
                    >
                      Select All Visible
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedEmpIds([])} 
                      className="text-[10px] font-bold h-7 px-2"
                    >
                      Deselect All
                    </Button>
                  </div>

                  <div className="border border-slate-100 rounded-md divide-y divide-slate-100 max-h-48 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                    {filteredEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center gap-3 py-1.5 px-2">
                        <Checkbox 
                          checked={selectedEmpIds.includes(emp.id)} 
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedEmpIds([...selectedEmpIds, emp.id]);
                            else setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                          }} 
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                          <span className="text-[10px] font-medium text-slate-500">{emp.role} • {emp.type}</span>
                          {emp.tags && emp.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {emp.tags.map(t => (
                                <span key={t} className="text-[8px] font-bold bg-slate-200/80 text-slate-600 px-1 rounded">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs font-bold text-slate-400">$</span>
                          <Input 
                            type="number"
                            value={emp.salary}
                            onChange={async (e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const updated = employees.map(item => item.id === emp.id ? { ...item, salary: val } : item);
                              setEmployees(updated);
                              await syncState({ payroll_employees: updated });
                            }}
                            className="text-xs h-8 w-24 border-slate-200 bg-white text-right font-bold text-[#1A1C21] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={executePayrollRun} className="w-full bg-[#1A1C21] text-xs font-bold">
                  Create Disbursements (${employees.filter(e => selectedEmpIds.includes(e.id)).reduce((sum, e) => sum + e.salary, 0).toLocaleString()})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Invoice Approval Allocator Dialog */}
          <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
            <DialogContent className="bg-white border-slate-200 rounded-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Approve & Allocate Invoice</DialogTitle>
                <DialogDescription className="text-xs">Select which active payroll run accounts for this invoice spend.</DialogDescription>
              </DialogHeader>
              
              <div className="py-3 space-y-2">
                <Label className="text-xs font-bold">Select Payroll Cycle</Label>
                {payrollHistory.filter(pr => pr.status === "Active").length === 0 ? (
                  <p className="text-xs text-amber-600 font-medium">No currently active payroll runs. Please launch a new payroll cycle first.</p>
                ) : (
                  <Select value={selectedPayrollRunId} onValueChange={setSelectedPayrollRunId}>
                    <SelectTrigger className="text-xs border-slate-200"><SelectValue placeholder="Choose target cycle" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {payrollHistory.filter(pr => pr.status === "Active").map(pr => (
                        <SelectItem key={pr.id} value={pr.id} className="text-xs">{pr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <DialogFooter>
                <Button 
                  disabled={payrollHistory.filter(pr => pr.status === "Active").length === 0}
                  onClick={allocateInvoiceToPayroll} 
                  className="w-full bg-[#1A1C21] text-xs font-bold"
                >
                  Confirm Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border border-[#EEEEF0] p-1 rounded-md mb-6 flex w-full md:w-auto max-w-3xl justify-start overflow-x-auto">
          <TabsTrigger value="history" className="font-bold text-xs rounded-sm data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <History className="w-3.5 h-3.5 mr-2" /> Payroll History
          </TabsTrigger>
          <TabsTrigger value="employees" className="font-bold text-xs rounded-sm data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <Users className="w-3.5 h-3.5 mr-2" /> Employees
          </TabsTrigger>
          <TabsTrigger value="invoices" className="font-bold text-xs rounded-sm data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <FileCheck className="w-3.5 h-3.5 mr-2" /> Contractor Invoices
          </TabsTrigger>
          <TabsTrigger value="components" className="font-bold text-xs rounded-sm data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <DollarSign className="w-3.5 h-3.5 mr-2" /> Salary Components
          </TabsTrigger>
          <TabsTrigger value="policies" className="font-bold text-xs rounded-sm data-[state=active]:bg-[#1A1C21] data-[state=active]:text-white">
            <Settings className="w-3.5 h-3.5 mr-2" /> Policies
          </TabsTrigger>
        </TabsList>

        {/* --- 1. PAYROLL HISTORY --- */}
        <TabsContent value="history">
          <Card className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Cycle Name</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Date</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Total Amount</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Recipients</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {payrollHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAFAFB]/30 transition-all">
                      <td className="px-6 py-4 text-xs font-bold text-[#1A1C21]">{rec.name}</td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/70 font-medium">{rec.date}</td>
                      <td className="px-6 py-4 text-xs font-bold">{rec.amount}</td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/60">{rec.employeesPaid} Individuals</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge className={`text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-none ${
                          rec.status === "Completed" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {rec.status === "Active" && (
                          <div className="flex items-center gap-2 justify-end">
                            {rec.scheduledDate ? (
                              <button 
                                onClick={() => {
                                  setSchedulingRunId(rec.id);
                                  setSchedDateOnly("");
                                  setSchedHour("12");
                                  setSchedMinute("00");
                                  setSchedAmpm("AM");
                                  setIsScheduleModalOpen(true);
                                }}
                                className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 flex items-center gap-1 hover:bg-slate-200/50 hover:text-[#1A1C21] transition-all cursor-pointer"
                              >
                                <Calendar className="w-3 h-3 text-slate-500" /> Scheduled
                              </button>
                            ) : (
                              <Button 
                                onClick={() => {
                                  setSchedulingRunId(rec.id);
                                  setSchedDateOnly("");
                                  setSchedHour("12");
                                  setSchedMinute("00");
                                  setSchedAmpm("AM");
                                  setIsScheduleModalOpen(true);
                                }}
                                variant="outline" 
                                className="text-xs font-bold h-8 border-[#EEEEF0] hover:bg-[#FAFAFB] text-[#1A1C21]"
                              >
                                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Schedule
                              </Button>
                            )}
                            {!rec.scheduledDate && (
                              <Button 
                                onClick={async () => {
                                  const updated = payrollHistory.map(pr => 
                                    pr.id === rec.id ? { ...pr, status: "Completed" as const } : pr
                                  );
                                  setPayrollHistory(updated);
                                  await syncState({ payroll_history: updated });
                                  toast({ title: "Auto-Disbursal Scheduled", description: "Auto-Disbursal Scheduled" });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-md"
                              >
                                Disburse
                              </Button>
                            )}
                          </div>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" onClick={() => setSelectedRun(rec)} className="text-xs font-bold text-[#A079FF] hover:bg-[#A079FF]/5 h-8 px-3">
                              <Eye className="w-3.5 h-3.5 mr-1.5" /> Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white border-slate-200 rounded-md max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-base font-bold">{selectedRun?.name}</DialogTitle>
                              <DialogDescription className="text-xs">Processed on {selectedRun?.date}</DialogDescription>
                            </DialogHeader>
                            <div className="py-2 space-y-4">
                              <div className="flex justify-between text-xs font-medium pb-2 border-b border-slate-100">
                                <span className="text-slate-500">Overall Ledger Total</span>
                                <span className="text-slate-900 font-bold">{selectedRun?.amount}</span>
                              </div>
                              
                              <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">Included Roster</span>
                                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50/30 rounded-md p-2 space-y-2 border border-slate-100">
                                  {selectedRun?.status === "Active" ? (
                                    (() => {
                                      const empIds = employees.map(e => e.id);
                                      const extraIncluded = (selectedRun.employeesIncluded || []).filter(e => !empIds.includes(e.id));
                                      const fullRoster = [...employees, ...extraIncluded];
                                      
                                      return fullRoster.map(emp => {
                                        const isChecked = selectedRun.employeesIncluded?.some(e => e.id === emp.id) || false;
                                        return (
                                          <div key={emp.id} className="flex items-center gap-3 py-1.5 px-1">
                                            <Checkbox 
                                              checked={isChecked} 
                                              onCheckedChange={() => toggleEmpInActiveRun(emp)} 
                                            />
                                            <div className="flex flex-col">
                                              <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                                              <span className="text-[10px] text-slate-500">{emp.role} • {emp.type}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 ml-auto">${emp.salary.toLocaleString()}</span>
                                          </div>
                                        );
                                      });
                                    })()
                                  ) : (
                                    (!selectedRun?.employeesIncluded || selectedRun?.employeesIncluded.length === 0) ? (
                                      <p className="text-xs text-slate-400 italic p-2">Detailed roster mapping unavailable.</p>
                                    ) : (
                                      selectedRun.employeesIncluded.map(emp => (
                                        <div key={emp.id} className="flex justify-between items-center py-2 px-1">
                                          <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                                            <span className="text-[10px] text-slate-500">{emp.role}</span>
                                          </div>
                                          <span className="text-xs font-bold text-slate-900">${emp.salary.toLocaleString()}</span>
                                        </div>
                                      ))
                                    )
                                  )}
                                </div>
                                
                                {selectedRun?.status === "Active" && (
                                  <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">Add New Recipient</span>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input 
                                        placeholder="Name" 
                                        value={newEmpName} 
                                        onChange={(e) => setNewEmpName(e.target.value)} 
                                        className="text-xs h-8 border-slate-200 bg-white" 
                                      />
                                      <Input 
                                        placeholder="Role" 
                                        value={newEmpRole} 
                                        onChange={(e) => setNewEmpRole(e.target.value)} 
                                        className="text-xs h-8 border-slate-200 bg-white" 
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <Input 
                                        placeholder="Salary ($)" 
                                        type="number"
                                        value={newEmpSalary} 
                                        onChange={(e) => setNewEmpSalary(e.target.value)} 
                                        className="text-xs h-8 border-slate-200 bg-white" 
                                      />
                                      <Select value={newEmpType} onValueChange={(v: any) => setNewEmpType(v)}>
                                        <SelectTrigger className="text-xs h-8 border-slate-200 bg-white text-[#1A1C21]"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200">
                                          <SelectItem value="Full-time" className="text-xs">Full-time</SelectItem>
                                          <SelectItem value="Contractor" className="text-xs">Contractor</SelectItem>
                                          <SelectItem value="Part-time" className="text-xs">Part-time</SelectItem>
                                          <SelectItem value="One-Time Item" className="text-xs">One-Time Item</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button 
                                      onClick={async () => {
                                        if (!newEmpName || !newEmpRole) return;
                                        const newEmp: Employee = {
                                          id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
                                          name: newEmpName,
                                          role: newEmpRole,
                                          department: "General",
                                          salary: parseFloat(newEmpSalary) || 3000,
                                          status: "Active",
                                          bank: "Flowboard Wallet",
                                          account: "Acct-9999",
                                          type: newEmpType
                                        };
                                        
                                        let updatedEmployees = employees;
                                        if (newEmpType !== "One-Time Item") {
                                          updatedEmployees = [...employees, newEmp];
                                          setEmployees(updatedEmployees);
                                        }
                                        
                                        const updatedIncluded = [...(selectedRun.employeesIncluded || []), newEmp];
                                        const total = updatedIncluded.reduce((sum, e) => sum + e.salary, 0);
                                        const updatedRun = {
                                          ...selectedRun,
                                          employeesIncluded: updatedIncluded,
                                          amount: `$${total.toLocaleString()}`,
                                          employeesPaid: updatedIncluded.length
                                        };
                                        
                                        const updatedHistory = payrollHistory.map(pr => pr.id === selectedRun.id ? updatedRun : pr);
                                        setPayrollHistory(updatedHistory);
                                        setSelectedRun(updatedRun);
                                        
                                        if (newEmpType !== "One-Time Item") {
                                          await syncState({ 
                                            payroll_employees: updatedEmployees,
                                            payroll_history: updatedHistory
                                          });
                                        } else {
                                          await syncState({ 
                                            payroll_history: updatedHistory
                                          });
                                        }
                                        
                                        setNewEmpName("");
                                        setNewEmpRole("");
                                        setNewEmpSalary("");
                                        toast({ title: "Recipient Added", description: `${newEmp.name} appended to cycle.` });
                                      }}
                                      className="h-8 bg-[#1A1C21] text-xs font-bold rounded-md"
                                    >
                                      Add to Run
                                    </Button>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
          <DialogContent className="bg-white border-slate-200 rounded-md max-w-xs">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-[#1A1C21]">Schedule Auto-Disbursal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-[#1A1C21]">Select Date</Label>
                <Input 
                  type="date" 
                  value={schedDateOnly}
                  className="text-xs h-8 bg-white border-slate-200 text-[#1A1C21]" 
                  onChange={(e) => setSchedDateOnly(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#1A1C21]">Select Time</Label>
                <div className="flex gap-2">
                  <Select value={schedHour} onValueChange={setSchedHour}>
                    <SelectTrigger className="text-xs h-8 border-slate-200 bg-white text-[#1A1C21]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hr => (
                        <SelectItem key={hr} value={hr} className="text-xs">{hr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={schedMinute} onValueChange={setSchedMinute}>
                    <SelectTrigger className="text-xs h-8 border-slate-200 bg-white text-[#1A1C21]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {["00", "15", "30", "45"].map(min => (
                        <SelectItem key={min} value={min} className="text-xs">{min}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={schedAmpm} onValueChange={setSchedAmpm}>
                    <SelectTrigger className="text-xs h-8 border-slate-200 bg-white text-[#1A1C21]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      <SelectItem value="AM" className="text-xs">AM</SelectItem>
                      <SelectItem value="PM" className="text-xs">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                disabled={!schedDateOnly}
                onClick={async () => {
                  const d = new Date(schedDateOnly);
                  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const combined = `${dateStr} ${schedHour}:${schedMinute} ${schedAmpm}`;
                  
                  try {
                    const parts = combined.split(" ");
                    if (parts.length >= 5) {
                      const monthStr = parts[0].substring(0, 3);
                      const dayStr = parts[1].replace(",", "");
                      const yearStr = parts[2];
                      const timeStr = parts[3];
                      const ampm = parts[4];
                      
                      const [hourStr, minuteStr] = timeStr.split(":");
                      let hour = parseInt(hourStr);
                      const minute = parseInt(minuteStr);
                      
                      if (ampm === "PM" && hour < 12) hour += 12;
                      if (ampm === "AM" && hour === 12) hour = 0;
                      
                      const months: Record<string, number> = {
                        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
                      };
                      
                      const month = months[monthStr];
                      if (month !== undefined) {
                        const schedDate = new Date(parseInt(yearStr), month, parseInt(dayStr), hour, minute);
                        if (schedDate.getTime() <= Date.now()) {
                          toast({ title: "Invalid Schedule", description: "Schedule time must be in the future.", variant: "destructive" });
                          return;
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Validation failed", e);
                  }
                  
                  const updated = payrollHistory.map(pr => 
                    pr.id === schedulingRunId ? { ...pr, scheduledDate: combined } : pr
                  );
                  setPayrollHistory(updated);
                  await syncState({ payroll_history: updated });
                  setIsScheduleModalOpen(false);
                  toast({ title: "Auto-Disbursal Scheduled", description: "Auto-Disbursal Scheduled" });
                }}
                className="w-full h-8 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-md"
              >
                Confirm Schedule
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- 2. EMPLOYEES --- */}
        <TabsContent value="employees">
          <Card className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#EEEEF0]">
              <div>
                <CardTitle className="text-base font-bold">Employee Roster</CardTitle>
                <CardDescription className="text-xs">Update bank routes reacting to offboarding flags.</CardDescription>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold rounded-md text-xs h-9 px-4">
                    <UserPlus className="w-3.5 h-3.5 mr-2" /> Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-[#EEEEF0] rounded-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Add Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Full Name</Label>
                      <Input placeholder="John Doe" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} className="text-xs rounded-md focus-visible:ring-[#A079FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Role Position</Label>
                      <Input placeholder="e.g. Lead Developer" value={newEmpRole} onChange={(e) => setNewEmpRole(e.target.value)} className="text-xs rounded-md focus-visible:ring-[#A079FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Base Compensation ($)</Label>
                      <Input type="number" placeholder="3500" value={newEmpSalary} onChange={(e) => setNewEmpSalary(e.target.value)} className="text-xs rounded-md focus-visible:ring-[#A079FF]" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Employment Type</Label>
                      <Select value={newEmpType} onValueChange={(v: any) => setNewEmpType(v)}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Contractor">Contractor</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEmployee} className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-md w-full">Save Record</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Employee</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Department</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Class</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Salary</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Banking Route</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAFAFB]/30 transition-all">
                      <td className="px-6 py-4 flex flex-col">
                        <span className="text-xs font-bold text-[#1A1C21]">{emp.name}</span>
                        <span className="text-[10px] text-[#1A1C21]/50">{emp.role}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/70 font-medium">{emp.department}</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest border-[#EEEEF0]">{emp.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">${emp.salary.toLocaleString()}</td>
                      <td className="px-6 py-4 flex flex-col">
                        <span className="text-xs text-[#1A1C21]/80 font-medium">{emp.bank}</span>
                        <span className="text-[10px] text-[#1A1C21]/40">{emp.account}</span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <Select 
                          value={emp.status} 
                          onValueChange={async (newStatus: "Active" | "Suspended" | "Terminated") => {
                            const updated = employees.map(e => e.id === emp.id ? { ...e, status: newStatus } : e);
                            setEmployees(updated);
                            await syncState({ payroll_employees: updated });
                            toast({ title: "Status Updated", description: `${emp.name} is now ${newStatus}.` });
                          }}
                        >
                          <SelectTrigger className={`h-7 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-none border-0 w-24 px-2 focus:ring-0 ${
                            emp.status === "Active" ? "bg-emerald-500/10 text-emerald-600" : 
                            emp.status === "Suspended" ? "bg-amber-500/10 text-amber-600" : 
                            "bg-slate-500/10 text-slate-600"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-100 min-w-[100px]">
                            <SelectItem value="Active" className="text-[10px] font-bold uppercase">Active</SelectItem>
                            <SelectItem value="Suspended" className="text-[10px] font-bold uppercase">Suspended</SelectItem>
                            <SelectItem value="Terminated" className="text-[10px] font-bold uppercase">Terminated</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right justify-end flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(emp.id)} className="hover:bg-red-50 h-8 w-8"><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 3. CONTRACTOR INVOICES --- */}
        <TabsContent value="invoices">
          <Card className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-[#EEEEF0]">
              <CardTitle className="text-base font-bold">HR Approval Ledger</CardTitle>
              <CardDescription className="text-xs">Review raised contractor invoices.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              {contractorInvoices.length === 0 ? (
                <p className="text-xs p-6 text-slate-400 font-bold">No contractor invoices raised.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Contractor</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Inv #</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest text-right">Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEF0]">
                    {contractorInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FAFAFB]/30">
                        <td className="px-6 py-4 text-xs font-bold">{inv.talent_name}</td>
                        <td className="px-6 py-4 text-xs font-medium text-[#1A1C21]/60">#{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-xs font-bold">{inv.amount}</td>
                        <td className="px-6 py-4 text-xs">
                          <Badge className={`text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-none ${
                            inv.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : 
                            inv.status === "Denied" ? "bg-red-500/10 text-red-600" : 
                            "bg-amber-500/10 text-amber-600"
                          }`}>{inv.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-1">
                          <Button 
                            disabled={inv.status !== "Pending"}
                            onClick={() => {
                              setApprovingInvoiceId(inv.id);
                              setIsApprovalModalOpen(true);
                            }} 
                            variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-50 border border-emerald-100 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          </Button>
                          <Button 
                            disabled={inv.status !== "Pending"}
                            onClick={() => updateInvoiceStatus(inv.id, "Denied")} 
                            variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 border border-red-100 disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 4. SALARY COMPONENTS --- */}
        <TabsContent value="components">
          <Card className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-[#EEEEF0] flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-bold">Earning & Deduction Architectures</CardTitle>
                <CardDescription className="text-xs">Manage gross calculation configurations.</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-[#1A1C21] hover:bg-black text-white font-bold rounded-md text-xs h-9 px-4">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Component
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-[#EEEEF0] rounded-md">
                  <DialogHeader><DialogTitle className="text-base font-bold">Add Salary Component</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <Label className="text-xs font-bold">Component Name</Label>
                    <Input value={compName} onChange={(e)=>setCompName(e.target.value)} className="text-xs border-slate-200" />
                    
                    <Label className="text-xs font-bold">Category</Label>
                    <Select value={compType} onValueChange={(v: any) => setCompType(v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Earning">Earning</SelectItem>
                        <SelectItem value="Deduction">Deduction</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label className="text-xs font-bold">Rate Type</Label>
                    <Select value={compAmtType} onValueChange={(v: any) => setCompAmtType(v)}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>

                    <Label className="text-xs font-bold">Amount / Rate</Label>
                    <Input type="number" value={compValue} onChange={(e)=>setCompValue(e.target.value)} className="text-xs border-slate-200" />

                    <Label className="text-xs font-bold">Description</Label>
                    <Input value={compDesc} onChange={(e)=>setCompDesc(e.target.value)} className="text-xs border-slate-200" />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSalaryComponent} className="w-full bg-[#1A1C21] text-xs font-bold">Save Component</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Name</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Type</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Value Type</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-widest">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {components.map((comp) => (
                    <tr key={comp.id} className="hover:bg-[#FAFAFB]/30">
                      <td className="px-6 py-4 text-xs font-bold text-[#1A1C21]">{comp.name}</td>
                      <td className="px-6 py-4 text-xs font-medium">
                        <span className={`flex items-center gap-1 ${comp.type === "Earning" ? "text-emerald-600" : "text-red-500"}`}>
                          {comp.type === "Earning" ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {comp.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/60">{comp.amountType}</td>
                      <td className="px-6 py-4 text-xs font-bold">{comp.amountType === "Percentage" ? `${comp.value}%` : `$${comp.value}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. COMPENSATION POLICIES --- */}
        <TabsContent value="policies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id} className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
                <CardHeader className="p-6 border-b border-[#EEEEF0] flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-sm font-bold">{policy.roleName}</CardTitle>
                    <CardDescription className="text-xs">Base Structure: ${policy.baseSalary.toLocaleString()}/mo</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit3 className="w-3.5 h-3.5 text-[#1A1C21]/50" /></Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#1A1C21]/40 tracking-wider">Statutory Deductions</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium"><ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> {policy.taxProfile}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
