"use client";

import { Building2, Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecruiterDashboard({ profile }: { profile: any }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome, {profile?.company_name || "Company"}
          </h1>
          <p className="text-slate-500 font-medium">Manage your hiring pipeline here.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl gap-2 px-6">
          <PlusCircle className="w-5 h-5" /> Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl">
          <Building2 className="text-blue-600 mb-4 w-8 h-8" />
          <h3 className="font-bold text-slate-900">Active Roles</h3>
          <p className="text-2xl font-black">0</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-3xl">
          <Users className="text-green-600 mb-4 w-8 h-8" />
          <h3 className="font-bold text-slate-900">Applications</h3>
          <p className="text-2xl font-black">0</p>
        </div>
      </div>
      
      <div className="h-64 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
        <p className="font-medium">No job postings found.</p>
      </div>
    </div>
  );
}