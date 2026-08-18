import { useMemo, useState } from "react";
import { Search, Filter, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TRANSACTIONS = [];

export default function TransactionsPage() {
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase();
    return TRANSACTIONS.filter((transaction) =>
      transaction.reference.toLowerCase().includes(query) ||
      transaction.status.toLowerCase().includes(query) ||
      transaction.amount.toLowerCase().includes(query)
    );
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Transactions</h1>
            <p className="mt-2 text-sm text-slate-500">View all withdrawals and deposits for your account.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transaction reference..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="h-11 gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Transaction list</h2>
            <p className="text-sm text-slate-500">Total {filteredTransactions.length} items</p>
          </div>
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
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-base font-bold text-slate-950">No results found</p>
                      <p className="text-sm">Try changing your search terms or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.reference} className="border-b border-slate-200 hover:bg-slate-50 transition-all">
                    <td className="px-4 py-4 text-slate-900">{transaction.reference}</td>
                    <td className="px-4 py-4 text-slate-700">{transaction.status}</td>
                    <td className="px-4 py-4 text-slate-900">{transaction.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
