// hooks/usePayroll.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useGroups } from "@/contexts/GroupContext";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: "Active" | "Suspended" | "Terminated";
  bank: string;
  account: string;
  type: "Contractor" | "Full-time" | "Part-time";
  tags?: string[];
  workforce_member_id?: string;
}

export interface PayrollRecord {
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
  notes?: string;
}

export interface SalaryComponent {
  id: string;
  name: string;
  type: "Earning" | "Deduction";
  amountType: "Percentage" | "Fixed";
  value: number;
  description: string;
}

export interface Policy {
  id: string;
  roleName: string;
  baseSalary: number;
  taxProfile: string;
  allowances: string[];
}

export interface ContractorInvoice {
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

export function usePayroll() {
  const { toast } = useToast();
  const { activeGroup, organizationId } = useGroups();
  const [loading, setLoading] = useState(true);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [contractorInvoices, setContractorInvoices] = useState<ContractorInvoice[]>([]);

  // Load workforce members as employees from database
// In loadWorkforceMembers function, add:
const loadWorkforceMembers = useCallback(async () => {
  if (!organizationId || !activeGroup) {
    console.log("No organization or active group for loading employees");
    return [];
  }

  console.log("Loading workforce members for:", { organizationId, groupId: activeGroup.id });

  try {
    const { data: members, error } = await supabase
      .from("workforce_members")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("group_id", activeGroup.id)
      .eq("is_active", true);

    if (error) throw error;
    
    console.log("Found workforce members:", members);

    const formattedEmployees: Employee[] = (members || []).map((member: any) => ({
      id: member.id,
      name: member.full_name,
      role: member.role_title || "Team Member",
      department: member.department || "General",
      salary: member.payment_monthly || 0,
      status: member.is_active ? "Active" : "Suspended",
      bank: "Flowboard Wallet",
      account: "Acct-XXXX",
      type: member.member_type === "hired_contract" ? "Contractor" : 
            member.member_type === "hired_full_time" ? "Full-time" : "Part-time",
      workforce_member_id: member.id,
      tags: []
    }));

    console.log("Formatted employees:", formattedEmployees);
    setEmployees(formattedEmployees);
    return formattedEmployees;
  } catch (error) {
    console.error("Error loading workforce members:", error);
    return [];
  }
}, [organizationId, activeGroup]);

  // Load payroll runs from database
  const loadPayrollRuns = useCallback(async () => {
    if (!organizationId || !activeGroup) return;

    try {
      // First get all payroll runs for this group
      const { data: runs, error: runsError } = await supabase
        .from("payroll_runs")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("group_id", activeGroup.id)
        .order("created_at", { ascending: false });

      if (runsError) throw runsError;

      if (!runs || runs.length === 0) {
        setPayrollHistory([]);
        return;
      }

      // Get all payroll items for these runs
      const runIds = runs.map((r: any) => r.id);
      const { data: items, error: itemsError } = await supabase
        .from("payroll_items")
        .select("*, workforce_members(*)")
        .in("payroll_run_id", runIds);

      if (itemsError) throw itemsError;

      // Transform to frontend format
      const formattedRuns: PayrollRecord[] = runs.map((run: any) => {
        const runItems = (items || []).filter((item: any) => item.payroll_run_id === run.id);
        const totalAmount = runItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        
        const employeesIncluded: Employee[] = runItems.map((item: any) => ({
          id: item.workforce_member_id,
          name: item.workforce_members?.full_name || "Unknown",
          role: item.workforce_members?.role_title || "",
          department: item.workforce_members?.department || "",
          salary: item.amount || 0,
          status: "Active",
          bank: "Flowboard Wallet",
          account: "Acct-XXXX",
          type: item.workforce_members?.member_type === "hired_contract" ? "Contractor" : "Full-time",
          workforce_member_id: item.workforce_member_id
        }));

        return {
          id: run.id,
          name: run.notes || `Payroll Run ${new Date(run.period_start).toLocaleDateString()}`,
          date: new Date(run.created_at).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric" 
          }),
          amount: `$${totalAmount.toLocaleString()}`,
          status: run.status === "completed" ? "Completed" : 
                  run.status === "pending" ? "Active" : 
                  run.status,
          employeesPaid: runItems.length,
          type: "Disbursement",
          employeesIncluded,
          period_start: run.period_start,
          period_end: run.period_end,
          notes: run.notes
        };
      });

      setPayrollHistory(formattedRuns);
    } catch (error) {
      console.error("Error loading payroll runs:", error);
    }
  }, [organizationId, activeGroup]);

  // Load contractor invoices (from hire_inquiries or similar)
  const loadContractorInvoices = useCallback(async () => {
    if (!organizationId || !activeGroup) return;

    try {
      // Get contractor invoices from workforce_members with contractor type
      const { data: contractors, error } = await supabase
        .from("workforce_members")
        .select("*, profiles!workforce_members_profile_id_fkey(full_name, email)")
        .eq("organization_id", organizationId)
        .eq("group_id", activeGroup.id)
        .eq("member_type", "hired_contract");

      if (error) throw error;

      // Transform to invoice format (mock invoices for demo)
      const invoices: ContractorInvoice[] = (contractors || []).map((contractor: any, index: number) => ({
        id: contractor.id,
        invoice_number: `INV-${String(index + 1).padStart(4, "0")}`,
        amount: `$${(contractor.payment_monthly || 0).toLocaleString()}`,
        date: new Date().toLocaleDateString(),
        description: `Monthly payment for ${contractor.role_title || "services"}`,
        status: "Pending",
        talent_name: contractor.full_name,
        talent_id: contractor.profile_id || contractor.id,
        client_id: organizationId
      }));

      setContractorInvoices(invoices);
    } catch (error) {
      console.error("Error loading contractor invoices:", error);
    }
  }, [organizationId, activeGroup]);

  // Create a new payroll run
  const runPayroll = async (runName: string, selectedEmployees: Employee[], periodStart: Date, periodEnd: Date) => {
    if (!organizationId || !activeGroup) {
      toast({ title: "Error", description: "No organization or group selected", variant: "destructive" });
      return;
    }

    if (!runName || selectedEmployees.length === 0) {
      toast({ title: "Error", description: "Please provide a name and select employees", variant: "destructive" });
      return;
    }

    try {
      const totalNet = selectedEmployees.reduce((sum, emp) => sum + emp.salary, 0);

      // Insert payroll run
      const { data: payrollRun, error: runError } = await supabase
        .from("payroll_runs")
        .insert({
          organization_id: organizationId,
          group_id: activeGroup.id,
          period_start: periodStart.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          status: "pending",
          total_gross: totalNet,
          total_net: totalNet,
          notes: runName
        })
        .select()
        .single();

      if (runError) throw runError;

      // Insert payroll items for each employee
      const payrollItems = selectedEmployees.map(emp => ({
        payroll_run_id: payrollRun.id,
        workforce_member_id: emp.workforce_member_id || emp.id,
        organization_id: organizationId,
        group_id: activeGroup.id,
        amount: emp.salary,
        status: "pending",
        currency: "USD"
      }));

      const { error: itemsError } = await supabase
        .from("payroll_items")
        .insert(payrollItems);

      if (itemsError) throw itemsError;

      toast({ title: "Success", description: `Payroll run "${runName}" created successfully` });
      
      // Reload data
      await loadPayrollRuns();
      
      return payrollRun;
    } catch (error: any) {
      console.error("Error running payroll:", error);
      toast({ title: "Error", description: error.message || "Failed to create payroll run", variant: "destructive" });
      throw error;
    }
  };

  // Update payroll run status
  const updatePayrollStatus = async (runId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("payroll_runs")
        .update({ status })
        .eq("id", runId);

      if (error) throw error;
      
      // Also update all payroll items
      await supabase
        .from("payroll_items")
        .update({ status })
        .eq("payroll_run_id", runId);

      toast({ title: "Success", description: `Payroll status updated to ${status}` });
      await loadPayrollRuns();
    } catch (error: any) {
      console.error("Error updating payroll status:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Add a new employee (workforce member)
  const addEmployee = async (emp: Omit<Employee, "id" | "workforce_member_id">) => {
    if (!organizationId || !activeGroup) {
      toast({ title: "Error", description: "No organization or group selected", variant: "destructive" });
      return;
    }

    try {
      const { data: newMember, error } = await supabase
        .from("workforce_members")
        .insert({
          organization_id: organizationId,
          group_id: activeGroup.id,
          full_name: emp.name,
          role_title: emp.role,
          department: emp.department,
          payment_monthly: emp.salary,
          member_type: emp.type === "Contractor" ? "hired_contract" : 
                       emp.type === "Full-time" ? "hired_full_time" : "employee",
          is_active: true,
          start_date: new Date().toISOString().split("T")[0]
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Success", description: `${emp.name} added to workforce` });
      await loadWorkforceMembers();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Delete an employee (soft delete)
  const deleteEmployee = async (empId: string) => {
    try {
      const { error } = await supabase
        .from("workforce_members")
        .update({ is_active: false })
        .eq("id", empId);

      if (error) throw error;

      toast({ title: "Success", description: "Employee removed" });
      await loadWorkforceMembers();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Update employee salary
  const updateEmployeeSalary = async (employeeId: string, newSalary: number) => {
    try {
      const { error } = await supabase
        .from("workforce_members")
        .update({ payment_monthly: newSalary })
        .eq("id", employeeId);

      if (error) throw error;
      
      await loadWorkforceMembers();
    } catch (error: any) {
      console.error("Error updating salary:", error);
    }
  };

  // Update invoice status
  const updateInvoiceStatus = async (invId: string, newStatus: "Approved" | "Denied") => {
    try {
      // In a real app, you'd update an invoices table
      setContractorInvoices(prev => 
        prev.map(inv => inv.id === invId ? { ...inv, status: newStatus } : inv)
      );
      
      toast({ title: "Success", description: `Invoice ${newStatus}` });
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Export payroll to CSV
  const exportPayrollCsv = (payrollRun: PayrollRecord) => {
    const headers = ["Employee Name", "Role", "Department", "Amount", "Status"];
    const rows = payrollRun.employeesIncluded.map(emp => [
      emp.name,
      emp.role,
      emp.department,
      emp.salary,
      payrollRun.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll_${payrollRun.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export Complete", description: "CSV file downloaded" });
  };

  // Load components and policies from localStorage or system_prefs
  const loadComponentsAndPolicies = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("system_prefs")
        .eq("id", user.id)
        .single();

      const prefs = profile?.system_prefs || {};
      setComponents(prefs.payroll_components || []);
      setPolicies(prefs.payroll_policies || [
        {
          id: "1",
          roleName: "Standard Employee",
          baseSalary: 3000,
          taxProfile: "Standard Withholding (15%)",
          allowances: ["Health Insurance", "Transport"]
        },
        {
          id: "2",
          roleName: "Contractor",
          baseSalary: 0,
          taxProfile: "Self-Employment (0% withholding)",
          allowances: []
        }
      ]);
    } catch (error) {
      console.error("Error loading components:", error);
    }
  }, []);

  // Save components
  const saveComponents = async (newComponents: SalaryComponent[]) => {
    setComponents(newComponents);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("system_prefs")
        .eq("id", user.id)
        .single();

      await supabase
        .from("profiles")
        .update({
          system_prefs: {
            ...(profile?.system_prefs || {}),
            payroll_components: newComponents
          }
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error saving components:", error);
    }
  };

  // Initial load
  const initPayroll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadWorkforceMembers(),
        loadPayrollRuns(),
        loadContractorInvoices(),
        loadComponentsAndPolicies()
      ]);
    } catch (error) {
      console.error("Error initializing payroll:", error);
    } finally {
      setLoading(false);
    }
  }, [loadWorkforceMembers, loadPayrollRuns, loadContractorInvoices, loadComponentsAndPolicies]);

  // Refresh when active group changes
  useEffect(() => {
    if (organizationId && activeGroup) {
      initPayroll();
    }
  }, [organizationId, activeGroup?.id]);

  return {
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
    saveComponents,
    refreshData: initPayroll
  };
}