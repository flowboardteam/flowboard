"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WithdrawAddOptions from "./WithdrawAddOptions";
import WithdrawBankFlow from "./WithdrawBankFlow";

export default function WithdrawPage() {
  const [accounts, setAccounts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<"international" | "foreign-exchange" | null>(null);

  const navigate = useNavigate();
  const selectedAccount = accounts && accounts.length > 0 ? accounts[0] : null;
  const flowBalancePercentage = 0;
  const bankPercentage = selectedAccount ? 100 : 0;

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setAccounts([]);
          setLoading(false);
          return;
        }

        // Try to fetch external accounts; if table doesn't exist, fallback to empty
        const { data, error } = await supabase
          .from("external_accounts")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.debug("external_accounts fetch error:", error.message);
          setAccounts([]);
        } else {
          setAccounts(data || []);
        }
      } catch (err) {
        console.error(err);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFB]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative h-[220px] rounded-2xl bg-[#A079FF]/10 overflow-hidden flex items-center group shadow-sm border border-[#A079FF]/30">
          <div className="p-8 text-[#1A1C21]">
            <h1 className="text-3xl font-bold">Withdraw</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-700">View external bank accounts and start a withdrawal.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.85fr]">
          <div className="rounded-3xl bg-white border border-[#EEEEF0] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Automatic withdrawals</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Automatic withdrawals distribution</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  Each time you receive a payment, your funds will be automatically withdrawn to the following accounts.
                </p>
              </div>
              <Button variant="outline" className="h-11 self-start whitespace-nowrap" onClick={() => setShowAdd(true)}>
                Add method
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Your Flow balance</p>
                <p className="mt-4 text-4xl font-extrabold text-slate-950">{flowBalancePercentage}%</p>
                <p className="mt-2 text-sm text-slate-500">will remain on your Flow balance</p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Destination account</p>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  {selectedAccount ? `${selectedAccount.bank_name} · ••${String(selectedAccount.last4)}` : "Bank account · Select bank"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedAccount ? `Auto-withdrawal: ${bankPercentage}%` : "Select a bank account to receive withdrawals."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-[#EEEEF0] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Summary</p>
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-slate-100">
                <div className="absolute inset-0 rounded-full border border-slate-200"></div>
                <div className="absolute inset-4 rounded-full border-8 border-emerald-500/80"></div>
                <div className="relative text-center">
                  <p className="text-3xl font-bold text-slate-950">{flowBalancePercentage}%</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">will remain</p>
                </div>
              </div>

              <div className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{selectedAccount ? `Bank account · ${selectedAccount.bank_name}` : "Bank account · Select bank"}</span>
                  <span>{bankPercentage}%</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>Your Flow balance</span>
                  <span>{flowBalancePercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          {loading ? (
            <div className="p-8 bg-white border border-[#EEEEF0] rounded-2xl">Loading...</div>
          ) : accounts && accounts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {accounts.map((acc) => (
                <div key={acc.id} className="rounded-2xl bg-white border border-[#EEEEF0] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-[#1A1C21]">{acc.bank_name} ••{String(acc.last4)}</p>
                      <p className="text-xs text-slate-400">Account: {acc.last4}</p>
                    </div>
                    <div className="text-sm font-black text-[#1A1C21]">$0.00</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-[#EEEEF0] p-8 text-center">
              <p className="text-lg font-bold text-[#1A1C21]">No external accounts yet</p>
              <p className="mt-2 text-sm text-slate-500">Add a bank account to enable withdrawals.</p>
              <div className="mt-6 flex justify-center">
                <Button className="flex items-center gap-2" onClick={() => setShowAdd(true)}>
                  <Plus className="w-4 h-4" /> Add account
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl bg-white border border-[#EEEEF0] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Transactions</h2>
              <p className="text-sm text-slate-500 mt-1">Total 0 items</p>
            </div>
            <Button variant="outline" className="h-11 whitespace-nowrap" onClick={() => navigate("/talent/transactions") }>
              View transactions
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-[0.2em] text-[0.65rem]">
                  <th className="px-4 py-3">Transaction reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-950">No results found</p>
                      <p className="text-sm">Try changing your search terms or filters</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {showAdd && !selectedFlow && (
          <WithdrawAddOptions
            onClose={() => setShowAdd(false)}
            onSelect={(id) => {
              if (id === "international") {
                setSelectedFlow("international");
              } else if (id === "foreign-exchange") {
                setSelectedFlow("foreign-exchange");
              } else {
                setShowAdd(false);
                alert(`Selected add account: ${id}`);
              }
            }}
          />
        )}

        {selectedFlow && (
          <WithdrawBankFlow
            flow={selectedFlow}
            onClose={() => {
              setSelectedFlow(null);
              setShowAdd(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
