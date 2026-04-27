import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: string;
  date: string;
  status: "Pending" | "Approved" | "Denied";
  description: string;
}

export default function TalentInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWorkforce, setIsWorkforce] = useState(false);

  useEffect(() => {
    async function checkWorkforce() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check workforce membership
        const { data: membership } = await supabase
          .from("workforce_members")
          .select("*")
          .eq("email", user.email)
          .eq("is_active", true);

        if (membership && membership.length > 0) {
          setIsWorkforce(true);
        }

        // Fetch raised invoices from profile fallback
        const { data: profile } = await supabase
          .from("profiles")
          .select("system_prefs")
          .eq("id", user.id)
          .single();

        if (profile?.system_prefs?.raised_invoices) {
          const talentInvs = profile.system_prefs.raised_invoices;
          
          const resolved = await Promise.all(talentInvs.map(async (inv: any) => {
            if (!inv.client_id) return inv;
            try {
              const { data: cProf } = await supabase
                .from("profiles")
                .select("system_prefs")
                .eq("id", inv.client_id)
                .single();
              
              if (cProf?.system_prefs) {
                const prefs = cProf.system_prefs;
                if (prefs.approved_invoice_ids?.includes(inv.id)) return { ...inv, status: "Approved" };
                if (prefs.denied_invoice_ids?.includes(inv.id)) return { ...inv, status: "Denied" };
              }
            } catch (err) {
              console.error("Fallback resolution error", err);
            }
            return inv;
          }));

          setInvoices(resolved);
        }
      } catch (e) {
        console.error("Failed to fetch invoice payload", e);
      } finally {
        setLoading(false);
      }
    }
    checkWorkforce();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Invoices</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Manage and raise invoices for active organizational engagements.
          </p>
        </div>
        {isWorkforce && (
          <Link
            to="/talent/invoices/create"
            className="flex items-center gap-2 bg-[#A079FF] text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-[#8B5CF6] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        )}
      </div>

      {!isWorkforce ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600 mb-3" />
          <h3 className="text-base font-black text-amber-900 mb-1">Access Restricted</h3>
          <p className="text-sm font-medium text-amber-700 max-w-md mx-auto">
            Only contractors onboarded into the Active Workforce are cleared to raise compliance ledgers.
          </p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-[#A079FF]/10 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#A079FF]" />
          </div>
          <h3 className="text-lg font-black text-[var(--text-main)] mb-2">No invoices yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto font-medium">
            You haven't created any invoices yet. Click below to generate automated payslips.
          </p>
          <Link
            to="/talent/invoices/create"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-slate-800 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Plus className="w-4 h-4" />
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">#{inv.invoice_number}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{inv.amount}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 truncate max-w-[200px]">{inv.description}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                      inv.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                      inv.status === "Denied" ? "bg-red-100 text-red-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
