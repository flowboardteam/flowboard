"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  History, Users, DollarSign, Settings,
  ArrowUpRight, ArrowDownRight, Calendar, Download,
  Plus, ShieldAlert, Edit3, CheckCircle, UserPlus, UploadCloud, Trash2, FileCheck, XCircle, Eye, Clock
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
import { useGroups } from "@/contexts/GroupContext";
import { usePayroll } from "@/hooks/usePayroll";

// --- Interfaces ---
interface PayrollRecord {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: "Completed" | "Active" | "pending" | "processing" | "failed";
  employeesPaid: number;
  type: string;
  employeesIncluded: Employee[];
  scheduledDate?: string;
  period_start?: string;
  period_end?: string;
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
  type: "Contractor" | "Full-time" | "Part-time" | "One-Time Item";
  tags?: string[];
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

// Fallback demo data to ensure immediate interactivity
const DEFAULT_DEMO_EMPLOYEES: Employee[] = [
  { id: "EMP-001", name: "Sarah Jenkins", role: "Web Designer", department: "Design", salary: 5500, status: "Active", bank: "Flowboard Wallet", account: "Acct-9901", type: "Full-time", tags: ["Design", "Frontend"] },
  { id: "EMP-002", name: "Michael Kojo", role: "Marketer", department: "Marketing", salary: 4000, status: "Active", bank: "Flowboard Wallet", account: "Acct-2234", type: "Contractor", tags: ["Growth", "Acquisition"] },
  { id: "EMP-003", name: "Kenneth Dedu", role: "Social Media Manager", department: "Marketing", salary: 3500, status: "Active", bank: "Flowboard Wallet", account: "Acct-0019", type: "Part-time", tags: ["Marketing"] },
  { id: "EMP-004", name: "Anime World", role: "Software Engineer", department: "Engineering", salary: 8500, status: "Active", bank: "Flowboard Wallet", account: "Acct-7781", type: "Full-time", tags: ["Fullstack", "AI"] }
];

const DEFAULT_DEMO_PAYROLL: PayrollRecord[] = [
  {
    id: "PAY-ACTIVE-001",
    name: "October 2025 Regular Cycle",
    date: "Oct 28, 2025",
    amount: "$13,000",
    status: "Active",
    employeesPaid: 3,
    type: "Regular",
    employeesIncluded: [
      { id: "EMP-001", name: "Sarah Jenkins", role: "Web Designer", department: "Design", salary: 5500, status: "Active", bank: "Flowboard Wallet", account: "Acct-9901", type: "Full-time" },
      { id: "EMP-002", name: "Michael Kojo", role: "Marketer", department: "Marketing", salary: 4000, status: "Active", bank: "Flowboard Wallet", account: "Acct-2234", type: "Contractor" },
      { id: "EMP-003", name: "Kenneth Dedu", role: "Social Media Manager", department: "Marketing", salary: 3500, status: "Active", bank: "Flowboard Wallet", account: "Acct-0019", type: "Part-time" }
    ]
  },
  {
    id: "PAY-COMP-002",
    name: "September 2025 Regular Cycle",
    date: "Sep 28, 2025",
    amount: "$13,000",
    status: "Completed",
    employeesPaid: 3,
    type: "Regular",
    employeesIncluded: [
      { id: "EMP-001", name: "Sarah Jenkins", role: "Web Designer", department: "Design", salary: 5500, status: "Active", bank: "Flowboard Wallet", account: "Acct-9901", type: "Full-time" },
      { id: "EMP-002", name: "Michael Kojo", role: "Marketer", department: "Marketing", salary: 4000, status: "Active", bank: "Flowboard Wallet", account: "Acct-2234", type: "Contractor" },
      { id: "EMP-003", name: "Kenneth Dedu", role: "Social Media Manager", department: "Marketing", salary: 3500, status: "Active", bank: "Flowboard Wallet", account: "Acct-0019", type: "Part-time" }
    ]
  }
];

const DEFAULT_DEMO_INVOICES: ContractorInvoice[] = [
  {
    id: "INV-001",
    invoice_number: "INV-2025-001",
    talent_name: "Alex Rivera",
    talent_id: "TAL-001",
    amount: "$2,400",
    date: "Oct 15, 2025",
    description: "Frontend Next.js component migration sprint",
    status: "Pending"
  },
  {
    id: "INV-002",
    invoice_number: "INV-2025-002",
    talent_name: "Fatima Al-Sayed",
    talent_id: "TAL-002",
    amount: "$3,800",
    date: "Oct 12, 2025",
    description: "Cloud Architecture & Terraform automation",
    status: "Approved"
  }
];

export default function ClientPayrollPage() {
  const { toast } = useToast();
  const { activeGroup } = useGroups();
  
  const {
    loading,
    payrollHistory,
    setPayrollHistory,
    employees,
    setEmployees,
    components,
    setComponents,
    policies,
    contractorInvoices,
    initPayroll,
    runPayroll,
    addEmployee,
    deleteEmployee,
    updateInvoiceStatus,
    updateEmployeeSalary,
    updatePayrollStatus,
    exportPayrollCsv,
  } = usePayroll();

  const [activeTab, setActiveTab] = useState("history");

  // Determine active lists with fallback for instant interactivity
  const displayEmployees = employees && employees.length > 0 ? employees : DEFAULT_DEMO_EMPLOYEES;
  const displayPayrollHistory = payrollHistory && payrollHistory.length > 0 ? payrollHistory : DEFAULT_DEMO_PAYROLL;
  const displayInvoices = contractorInvoices && contractorInvoices.length > 0 ? contractorInvoices : DEFAULT_DEMO_INVOICES;

  // Modals
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [payrollRunName, setPayrollRunName] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [empFilter, setEmpFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
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

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      initPayroll();
    }, 30000);
    return () => clearInterval(interval);
  }, [initPayroll]);

  // Schedule auto-checker effect
  useEffect(() => {
    const checkSchedules = async () => {
      let hasChanged = false;
      const now = Date.now();
      
      const updatedHistory = displayPayrollHistory.map(pr => {
        if ((pr.status === "Active" || pr.status === "pending") && pr.scheduledDate) {
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
                  updatePayrollStatus(pr.id, "completed");
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
        toast({ title: "Auto-Disbursal Completed", description: "Scheduled payroll has been disbursed." });
      }
    };
    
    const interval = setInterval(checkSchedules, 5000);
    return () => clearInterval(interval);
  }, [displayPayrollHistory, updatePayrollStatus, setPayrollHistory, toast]);

  const executePayrollRun = async () => {
    if (!payrollRunName) {
      toast({ title: "Name Required", description: "Please enter a payroll run name.", variant: "destructive" });
      return;
    }

    const subset = displayEmployees.filter(e => selectedEmpIds.includes(e.id));
    
    if (subset.length === 0) {
      toast({ title: "No Employees Selected", description: "Please select at least one recipient.", variant: "destructive" });
      return;
    }
    
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const totalSalary = subset.reduce((sum, e) => sum + e.salary, 0);

    const newRun: PayrollRecord = {
      id: `PAY-${Date.now()}`,
      name: payrollRunName,
      date: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: `$${totalSalary.toLocaleString()}`,
      status: "Active",
      employeesPaid: subset.length,
      type: "Regular",
      employeesIncluded: subset,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString()
    };

    try {
      await runPayroll(payrollRunName, subset, periodStart, periodEnd);
    } catch (error) {
      console.log("Remote runPayroll fallback", error);
    }

    setPayrollHistory([newRun, ...displayPayrollHistory]);
    setPayrollRunName("");
    setSelectedEmpIds([]);
    setIsRunModalOpen(false);

    toast({ 
      title: "Payroll Run Initiated", 
      description: `Payroll cycle "${payrollRunName}" created successfully.` 
    });
  };

  const allocateInvoiceToPayroll = async () => {
    const targetInvoice = displayInvoices.find(i => i.id === approvingInvoiceId);
    if (!targetInvoice) {
      setIsApprovalModalOpen(false);
      return;
    }

    if (selectedPayrollRunId) {
      const targetRun = displayPayrollHistory.find(pr => pr.id === selectedPayrollRunId);
      if (targetRun) {
        const cleanAmountStr = (targetInvoice.amount || "0").replace(/[^0-9.]/g, "");
        const invoiceValue = parseFloat(cleanAmountStr) || 0;
        const currentTotal = parseFloat((targetRun.amount || "$0").replace(/[^0-9.]/g, "")) || 0;
        const newTotal = currentTotal + invoiceValue;

        const mockEmp: Employee = {
          id: targetInvoice.talent_id || `TAL-${Date.now()}`,
          name: targetInvoice.talent_name,
          role: "Contractor",
          department: "Contractors",
          salary: invoiceValue,
          status: "Active",
          bank: "Flowboard Wallet",
          account: "Acct-XXXX",
          type: "Contractor"
        };

        const updatedHistory = displayPayrollHistory.map(pr => 
          pr.id === selectedPayrollRunId 
            ? { 
                ...pr, 
                amount: `$${newTotal.toLocaleString()}`,
                employeesPaid: (pr.employeesPaid || 0) + 1,
                employeesIncluded: [...(pr.employeesIncluded || []), mockEmp]
              } 
            : pr
        );
        setPayrollHistory(updatedHistory);
      }
    }

    try {
      await updateInvoiceStatus(approvingInvoiceId, "Approved");
    } catch (err) {
      console.log("Invoice status update fallback", err);
    }

    setIsApprovalModalOpen(false);
    setApprovingInvoiceId("");
    setSelectedPayrollRunId("");
    toast({ 
      title: "Invoice Approved", 
      description: selectedPayrollRunId 
        ? `Invoice for ${targetInvoice.talent_name} approved and allocated to payroll.`
        : `Invoice for ${targetInvoice.talent_name} approved.`
    });
  };

  const toggleEmpInActiveRun = async (emp: Employee) => {
    if (!selectedRun) return;
    
    const alreadyIncluded = selectedRun.employeesIncluded?.some(e => e.id === emp.id) || false;
    let updatedIncluded: Employee[] = [];
    if (alreadyIncluded) {
      updatedIncluded = (selectedRun.employeesIncluded || []).filter(e => e.id !== emp.id);
    } else {
      updatedIncluded = [...(selectedRun.employeesIncluded || []), emp];
    }
    
    const total = updatedIncluded.reduce((sum, e) => sum + e.salary, 0);
    
    const updatedRun: PayrollRecord = {
      ...selectedRun,
      employeesIncluded: updatedIncluded,
      amount: `$${total.toLocaleString()}`,
      employeesPaid: updatedIncluded.length
    };
    
    const updatedHistory = displayPayrollHistory.map(pr => pr.id === selectedRun.id ? updatedRun : pr);
    setPayrollHistory(updatedHistory);
    setSelectedRun(updatedRun);
  };

  const handleAddRecipientToActiveRun = () => {
    if (!selectedRun || !newEmpName || !newEmpRole) return;
    const salaryVal = parseFloat(newEmpSalary) || 3000;
    const newEmp: Employee = {
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: newEmpName,
      role: newEmpRole,
      department: "General",
      salary: salaryVal,
      status: "Active",
      bank: "Flowboard Wallet",
      account: "Acct-9999",
      type: newEmpType
    };
    
    if (newEmpType !== "One-Time Item") {
      setEmployees([...displayEmployees, newEmp]);
    }
    
    const updatedIncluded = [...(selectedRun.employeesIncluded || []), newEmp];
    const total = updatedIncluded.reduce((sum, e) => sum + e.salary, 0);
    const updatedRun: PayrollRecord = {
      ...selectedRun,
      employeesIncluded: updatedIncluded,
      amount: `$${total.toLocaleString()}`,
      employeesPaid: updatedIncluded.length
    };
    
    const updatedHistory = displayPayrollHistory.map(pr => pr.id === selectedRun.id ? updatedRun : pr);
    setPayrollHistory(updatedHistory);
    setSelectedRun(updatedRun);
    
    setNewEmpName("");
    setNewEmpRole("");
    setNewEmpSalary("");
    toast({ title: "Recipient Added", description: `${newEmp.name} added to ${selectedRun.name}.` });
  };

  const handleConfirmSchedule = () => {
    if (!schedDateOnly) {
      toast({ title: "Date Required", description: "Please pick a schedule date.", variant: "destructive" });
      return;
    }
    const d = new Date(schedDateOnly);
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const combined = `${dateStr} ${schedHour}:${schedMinute} ${schedAmpm}`;
    
    const updated = displayPayrollHistory.map(pr => 
      pr.id === schedulingRunId ? { ...pr, scheduledDate: combined } : pr
    );
    setPayrollHistory(updated);
    setIsScheduleModalOpen(false);
    toast({ title: "Auto-Disbursal Scheduled", description: `Payroll will auto-disburse on ${combined}.` });
  };

  const handleClearSchedule = () => {
    const updated = displayPayrollHistory.map(pr => 
      pr.id === schedulingRunId ? { ...pr, scheduledDate: undefined } : pr
    );
    setPayrollHistory(updated);
    setIsScheduleModalOpen(false);
    toast({ title: "Schedule Removed", description: "Scheduled auto-disbursal has been cleared." });
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

    try {
      await addEmployee(newEmp);
    } catch (err) {
      console.log("Add employee fallback", err);
    }

    setEmployees([...displayEmployees, newEmp]);
    setNewEmpName("");
    setNewEmpRole("");
    setNewEmpSalary("");
    toast({ title: "Employee Added", description: `${newEmp.name} has been added to the roster.` });
  };

  const handleDeleteEmployee = async (empId: string) => {
    try {
      await deleteEmployee(empId);
    } catch (err) {
      console.log("Delete employee fallback", err);
    }
    setEmployees(displayEmployees.filter(e => e.id !== empId));
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

    setCompName("");
    setCompValue("");
    setCompDesc("");

    toast({ title: "Component Added" });
  };

  const filteredEmployees = displayEmployees.filter(e => {
    const typeMatch = empFilter === "All" || e.type === empFilter;
    const tagMatch = tagFilter === "All" || (e.tags && e.tags.includes(tagFilter));
    return typeMatch && tagMatch;
  });

  return (
    <div className="w-full p-8 bg-[#FAFAFB] min-h-screen font-sans text-[#1A1C21]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#1A1C21]">Payroll</h1>
          <p className="text-sm font-medium text-[#1A1C21]/60 mt-1">Send Bulk Payments in Seconds</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Run Payroll Button & Modal */}
          <Button 
            onClick={() => setIsRunModalOpen(true)}
            className="bg-[#1A1C21] hover:bg-black text-white font-bold text-xs rounded-md shadow-sm px-6 h-9"
          >
            Run Payroll
          </Button>

          {/* Run Payroll Dialog */}
          <Dialog open={isRunModalOpen} onOpenChange={setIsRunModalOpen}>
            <DialogContent className="bg-white border-[#EEEEF0] rounded-md max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Run Disbursements</DialogTitle>
                <DialogDescription className="text-xs">Pay team, vendors, and partners without delays.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Payroll Name</Label>
                  <Input 
                    placeholder="e.g. November 2025 Payroll" 
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
                          {Array.from(new Set(displayEmployees.flatMap(e => e.tags || []))).map(tag => (
                            <SelectItem key={tag} value={tag} className="text-xs">{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pb-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setSelectedEmpIds(filteredEmployees.map(e => e.id))} 
                      className="text-[10px] font-bold h-7 px-2"
                    >
                      Select All Visible
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => setSelectedEmpIds([])} 
                      className="text-[10px] font-bold h-7 px-2"
                    >
                      Deselect All
                    </Button>
                  </div>

                  <div className="border border-slate-100 rounded-md divide-y divide-slate-100 max-h-52 overflow-y-auto bg-slate-50/50">
                    {filteredEmployees.map(emp => (
                      <div key={emp.id} className="flex items-center gap-3 py-2 px-3">
                        <Checkbox 
                          checked={selectedEmpIds.includes(emp.id)} 
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedEmpIds([...selectedEmpIds, emp.id]);
                            else setSelectedEmpIds(selectedEmpIds.filter(id => id !== emp.id));
                          }} 
                        />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] font-medium text-slate-500">{emp.role} • {emp.type}</div>
                        </div>
                        <div className="text-xs font-bold">${emp.salary.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={executePayrollRun} className="w-full bg-[#1A1C21] hover:bg-black text-xs font-bold">
                  Create Disbursements (${displayEmployees.filter(e => selectedEmpIds.includes(e.id)).reduce((sum, e) => sum + e.salary, 0).toLocaleString()})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Invoice Approval & Allocator Dialog */}
          <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
            <DialogContent className="bg-white border-slate-200 rounded-md">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Approve & Allocate Invoice</DialogTitle>
                <DialogDescription className="text-xs">Confirm contractor invoice approval and optional cycle allocation.</DialogDescription>
              </DialogHeader>
              
              <div className="py-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Select Active Payroll Cycle (Optional)</Label>
                  {displayPayrollHistory.filter(pr => pr.status === "Active" || pr.status === "pending").length === 0 ? (
                    <p className="text-xs text-amber-600 font-medium">No active payroll cycle currently running. This invoice will be approved independently.</p>
                  ) : (
                    <Select value={selectedPayrollRunId} onValueChange={setSelectedPayrollRunId}>
                      <SelectTrigger className="text-xs border-slate-200 bg-white">
                        <SelectValue placeholder="Choose cycle to allocate spend (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {displayPayrollHistory.filter(pr => pr.status === "Active" || pr.status === "pending").map(pr => (
                          <SelectItem key={pr.id} value={pr.id} className="text-xs">{pr.name} ({pr.amount})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Approved contractor payouts will be marked as approved and routed through your disbursements ledger.
                </p>
              </div>

              <DialogFooter>
                <Button 
                  onClick={allocateInvoiceToPayroll} 
                  className="w-full bg-[#1A1C21] hover:bg-black text-xs font-bold"
                >
                  Confirm Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Schedule Auto-Disbursal Dialog */}
          <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
            <DialogContent className="bg-white border-slate-200 rounded-md max-w-xs">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold text-[#1A1C21]">Schedule Auto-Disbursal</DialogTitle>
                <DialogDescription className="text-xs">Set automated disbursement date & time.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
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
                
                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    disabled={!schedDateOnly}
                    onClick={handleConfirmSchedule}
                    className="w-full h-8 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-md"
                  >
                    Confirm Schedule
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={handleClearSchedule}
                    className="w-full h-7 text-xs text-slate-500 hover:text-red-600"
                  >
                    Clear Schedule
                  </Button>
                </div>
              </div>
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
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Cycle Name</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Date</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Total Amount</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Recipients</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Status</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {displayPayrollHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAFAFB]/30 transition-all">
                      <td className="px-6 py-4 text-xs font-bold text-[#1A1C21]">
                        <div>{rec.name}</div>
                        {rec.scheduledDate && (
                          <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Scheduled: {rec.scheduledDate}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/70 font-medium">{rec.date}</td>
                      <td className="px-6 py-4 text-xs font-bold">{rec.amount}</td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/60">{rec.employeesPaid} Individuals</td>
                      <td className="px-6 py-4 text-xs">
                        <Badge className={`text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-none ${
                          rec.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                          rec.status === "Active" || rec.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-slate-500/10 text-slate-600"
                        }`}>
                          {rec.status === "Completed" ? "Completed" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(rec.status === "Active" || rec.status === "pending") && (
                            <>
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
                                  className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200 flex items-center gap-1 hover:bg-amber-100 transition-all cursor-pointer"
                                >
                                  <Calendar className="w-3 h-3 text-amber-600" /> Scheduled
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

                              <Button 
                                onClick={async () => {
                                  await updatePayrollStatus(rec.id, 'completed');
                                  const updated = displayPayrollHistory.map(pr => 
                                    pr.id === rec.id ? { ...pr, status: "Completed" as const, scheduledDate: undefined } : pr
                                  );
                                  setPayrollHistory(updated);
                                  toast({ title: "Payroll Disbursed", description: "Disbursement completed successfully." });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 rounded-md"
                              >
                                Disburse
                              </Button>
                            </>
                          )}

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                onClick={() => setSelectedRun(rec)} 
                                className="text-xs font-bold text-[#A079FF] hover:bg-[#A079FF]/5 h-8 px-3"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" /> Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white border-slate-200 rounded-md max-w-md max-h-[85vh] overflow-y-auto">
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
                                  <span className="text-[10px] font-black uppercase text-slate-400">Included Recipients</span>
                                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50 rounded-md p-2 space-y-1 border border-slate-100">
                                    {(selectedRun?.status === "Active" || selectedRun?.status === "pending") ? (
                                      (() => {
                                        const empIds = displayEmployees.map(e => e.id);
                                        const extraIncluded = (selectedRun.employeesIncluded || []).filter(e => !empIds.includes(e.id));
                                        const fullRoster = [...displayEmployees, ...extraIncluded];
                                        
                                        return fullRoster.map(emp => {
                                          const isChecked = selectedRun.employeesIncluded?.some(e => e.id === emp.id) || false;
                                          return (
                                            <div key={emp.id} className="flex items-center gap-3 py-1.5 px-1">
                                              <Checkbox 
                                                checked={isChecked} 
                                                onCheckedChange={() => toggleEmpInActiveRun(emp)} 
                                              />
                                              <div className="flex flex-col flex-1">
                                                <span className="text-xs font-bold text-slate-900">{emp.name}</span>
                                                <span className="text-[10px] text-slate-500">{emp.role} • {emp.type}</span>
                                              </div>
                                              <span className="text-xs font-bold text-slate-900">${emp.salary.toLocaleString()}</span>
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
                                  
                                  {(selectedRun?.status === "Active" || selectedRun?.status === "pending") && (
                                    <div className="pt-3 border-t border-slate-100 space-y-2">
                                      <span className="text-[10px] font-black uppercase text-slate-400">Add Recipient to Cycle</span>
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
                                          placeholder="Amount ($)" 
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
                                        type="button"
                                        onClick={handleAddRecipientToActiveRun}
                                        className="w-full h-8 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-md"
                                      >
                                        Add to Run
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 2. EMPLOYEES --- */}
        <TabsContent value="employees">
          <Card className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#EEEEF0]">
              <div>
                <CardTitle className="text-base font-bold">Employee Roster</CardTitle>
                <CardDescription className="text-xs">Manage your workforce members and contractor rates.</CardDescription>
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
                    <DialogDescription className="text-xs">Add a new workforce member to your payroll roster.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Full Name</Label>
                      <Input placeholder="John Doe" value={newEmpName} onChange={(e) => setNewEmpName(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Role Position</Label>
                      <Input placeholder="e.g. Lead Developer" value={newEmpRole} onChange={(e) => setNewEmpRole(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Base Compensation ($)</Label>
                      <Input type="number" placeholder="3500" value={newEmpSalary} onChange={(e) => setNewEmpSalary(e.target.value)} className="text-xs" />
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
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Employee</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Role</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Type</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Salary</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {displayEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAFAFB]/30 transition-all">
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#1A1C21]">{emp.name}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#1A1C21]/70">{emp.role}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[9px] font-bold uppercase">{emp.type}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">${emp.salary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(emp.id)} className="hover:bg-red-50 h-8 w-8">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
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
              <CardTitle className="text-base font-bold">Contractor Invoices</CardTitle>
              <CardDescription className="text-xs">Review, allocate, and approve contractor invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {displayInvoices.length === 0 ? (
                <p className="text-xs p-6 text-slate-400 font-bold">No contractor invoices found.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Contractor</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Invoice #</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Amount</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Status</th>
                      <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEEEF0]">
                    {displayInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#FAFAFB]/30">
                        <td className="px-6 py-4 text-xs font-bold">{inv.talent_name}</td>
                        <td className="px-6 py-4 text-xs">#{inv.invoice_number}</td>
                        <td className="px-6 py-4 text-xs font-bold">{inv.amount}</td>
                        <td className="px-6 py-4">
                          <Badge className={`text-[9px] font-bold uppercase ${
                            inv.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                            inv.status === "Denied" ? "bg-red-500/10 text-red-600" : 
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>{inv.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            disabled={inv.status !== "Pending"}
                            onClick={() => {
                              setApprovingInvoiceId(inv.id);
                              setIsApprovalModalOpen(true);
                            }} 
                            variant="ghost" 
                            className="h-8 px-3 text-slate-900 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
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
            <CardHeader className="px-6 pt-6 pb-4 border-b border-[#EEEEF0] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Salary Components</CardTitle>
                <CardDescription className="text-xs">Manage earnings and deductions.</CardDescription>
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
                    <Input value={compName} onChange={(e)=>setCompName(e.target.value)} className="text-xs" />
                    
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
                    <Input type="number" value={compValue} onChange={(e)=>setCompValue(e.target.value)} className="text-xs" />

                    <Label className="text-xs font-bold">Description</Label>
                    <Input value={compDesc} onChange={(e)=>setCompDesc(e.target.value)} className="text-xs" />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddSalaryComponent} className="w-full bg-[#1A1C21] text-xs font-bold">Save Component</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EEEEF0] bg-[#FAFAFB]/60">
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Name</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Type</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Value Type</th>
                    <th className="px-6 py-3 text-[10px] font-black uppercase text-[#1A1C21]/40">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEF0]">
                  {components.map((comp) => (
                    <tr key={comp.id}>
                      <td className="px-6 py-4 text-xs font-bold">{comp.name}</td>
                      <td className="px-6 py-4 text-xs">{comp.type}</td>
                      <td className="px-6 py-4 text-xs">{comp.amountType}</td>
                      <td className="px-6 py-4 text-xs font-bold">{comp.amountType === "Percentage" ? `${comp.value}%` : `$${comp.value}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- 5. POLICIES --- */}
        <TabsContent value="policies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy) => (
              <Card key={policy.id} className="bg-white border border-[#EEEEF0] rounded-md shadow-none">
                <CardHeader className="p-6 border-b border-[#EEEEF0]">
                  <CardTitle className="text-sm font-bold">{policy.roleName}</CardTitle>
                  <CardDescription className="text-xs">Base: ${policy.baseSalary.toLocaleString()}/mo</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-xs text-slate-600">{policy.taxProfile}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}