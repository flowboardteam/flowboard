import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
}

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");

  useEffect(() => {
    async function fetchEngagements() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: engagements } = await supabase
          .from("workforce_members")
          .select("organization_id")
          .eq("email", user.email)
          .eq("is_active", true);

        const localContractKey = `global_talent_contracts_${user.id}`;
        const localData = localStorage.getItem(localContractKey);
        const localContracts = localData ? JSON.parse(localData) : [];

        let mapped: Company[] = [];

        if (engagements && engagements.length > 0) {
          const orgIds = engagements.map(e => e.organization_id);
          
          const { data: orgs } = await supabase
            .from("profiles")
            .select("id, full_name, company_name")
            .in("id", orgIds);

          mapped = (orgs || []).map(o => ({
            id: o.id,
            name: o.company_name || o.full_name || "Client Organization"
          }));
        }

        // Merge local contracts
        localContracts.forEach((lc: any) => {
          if (!mapped.some(m => m.id === lc.orgId)) {
            mapped.push({
              id: lc.orgId,
              name: lc.orgName
            });
          }
        });

        setCompanies(mapped);
        if (mapped.length > 0 && !selectedCompanyId) {
          setSelectedCompanyId(mapped[0].id);
        }
      } catch (err) {
        console.error("Engagement mapping failed", err);
      }
    }
    fetchEngagements();
  }, []);

  const handleSubmitInvoice = async () => {
    if (!amount) {
      toast({ title: "Amount Required", description: "Define payload specifications.", variant: "destructive" });
      return;
    }
    if (!selectedCompanyId) {
      toast({ title: "Company Required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const { data: profile } = await supabase
        .from("profiles")
        .select("system_prefs, full_name")
        .eq("id", user.id)
        .single();

      const existingInvoices = profile?.system_prefs?.raised_invoices || [];
      
      const newInvoice = {
        id: `INV-${Math.floor(Math.random() * 9000 + 1000)}`,
        invoice_number: invoiceNumber || `${Math.floor(Math.random() * 900 + 100)}`,
        amount: `$${parseFloat(amount).toLocaleString()}`,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        description: description || "General Contractor Services",
        status: "Pending",
        talent_name: profile?.full_name || "Active Contractor",
        talent_id: user.id,
        client_id: selectedCompanyId
      };

      const updatedInvoices = [newInvoice, ...existingInvoices];
      
      await supabase.from("profiles").update({
        system_prefs: {
          ...(profile?.system_prefs || {}),
          raised_invoices: updatedInvoices
        }
      }).eq("id", user.id);

      toast({ title: "Invoice Submitted", description: "Broadcast parameters loaded." });
      navigate("/talent/invoices");
    } catch (e) {
      console.error("Invoice submission error:", e);
      toast({ title: "Submission Failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] pb-20 text-[#1A1C21]">
      <div className="max-w-xl mx-auto pt-12 px-4 space-y-8">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#A079FF] hover:underline mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <h1 className="text-2xl font-black tracking-tight">Create Invoice</h1>
            <p className="text-xs font-medium text-slate-500 mt-1">Disburse service metrics to compliance panels.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Select Company</Label>
            {companies.length === 0 ? (
              <p className="text-xs text-amber-600 font-medium font-sans">No active engagements found. You cannot invoice clients until clearing workforce onboarding protocols.</p>
            ) : (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="text-xs border-slate-200 h-10"><SelectValue placeholder="Choose client" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-num" className="text-xs font-bold">Invoice Number (Optional)</Label>
            <Input 
              id="inv-num" 
              placeholder="e.g. 001" 
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="text-xs rounded-md border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-amt" className="text-xs font-bold">Invoice Amount ($)</Label>
            <Input 
              id="inv-amt" 
              type="number"
              placeholder="e.g. 2500" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xs rounded-md border-slate-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inv-desc" className="text-xs font-bold">Line Item Description</Label>
            <Textarea 
              id="inv-desc" 
              placeholder="Project milestones executed..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs rounded-md border-slate-200 h-24 resize-none"
            />
          </div>

          <Button 
            onClick={handleSubmitInvoice}
            disabled={saving || companies.length === 0}
            className="w-full bg-[#1A1C21] hover:bg-black text-white text-xs font-bold h-10 rounded-md"
          >
            {saving ? "Submitting..." : "Send to Client"} <Send className="w-3.5 h-3.5 ml-2" />
          </Button>
        </div>

      </div>
    </div>
  );
}
