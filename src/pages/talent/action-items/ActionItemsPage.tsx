"use client";

import React from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function ActionItemsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFB]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="relative h-[240px] rounded-2xl bg-[#A079FF]/10 overflow-hidden flex items-center group shadow-sm border border-[#A079FF]/30">
          <div className="p-8 text-[#1A1C21]">
            <h1 className="text-3xl font-bold">Action Items</h1>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-700">To-dos and documents that require your attention.</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 md:w-1/2 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2029&auto=format&fit=crop')] bg-cover opacity-10" />
        </div>

        <div className="mt-6">
          <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
            <div className="max-w-4xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Sign your Professional Services Agreement</p>
                    <p className="mt-1 text-xs text-slate-500">This document has been signed. You can review it in Documents.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">Jul 18, 2026, 00:14</div>
                  <button className="rounded-full p-2 text-slate-400 hover:bg-slate-50">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
