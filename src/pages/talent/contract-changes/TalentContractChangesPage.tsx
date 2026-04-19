"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft, Loader2, CheckCircle2, XCircle, Clock,
  DollarSign, Calendar, Briefcase, Building2, X, RefreshCw,
  AlertCircle, TrendingUp, Pencil, Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface ChangeRequest {
  id: string;
  organization_id: string;
  change_types: string[];
  proposed_member_type: string | null;
  proposed_salary: number | null;
  proposed_role_title: string | null;
  proposed_department: string | null;
  proposed_end_date: string | null;
  proposed_start_date: string | null;
  current_member_type: string | null;
  current_salary: number | null;
  current_role_title: string | null;
  current_department: string | null;
  current_end_date: string | null;
  message: string | null;
  status: string;
  decline_reason: string | null;
  responded_at: string | null;
  created_at: string;
  org_profile?: { full_name: string; avatar_url: string | null; company_name: string | null } | null;
}

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;icon:any}> = {
  pending:   {label:"Awaiting response",color:"text-amber-600", bg:"bg-amber-500/10 border-amber-500/20",   icon:Clock       },
  viewed:    {label:"Viewed",           color:"text-blue-600",  bg:"bg-blue-500/10 border-blue-500/20",     icon:Clock       },
  accepted:  {label:"Accepted",         color:"text-emerald-600",bg:"bg-emerald-500/10 border-emerald-500/20",icon:CheckCircle2},
  declined:  {label:"Declined",         color:"text-red-500",   bg:"bg-red-500/10 border-red-500/20",       icon:XCircle     },
  withdrawn: {label:"Withdrawn",        color:"text-slate-500", bg:"bg-slate-500/10 border-slate-500/20",   icon:XCircle     },
};

const TYPE_LABELS: Record<string,string> = {
  employee:"Employee",hired_full_time:"Full-time hire",hired_contract:"Contractor",
};
const TYPE_COLORS: Record<string,string> = {
  employee:"bg-blue-500/10 text-blue-600 border-blue-500/20",
  hired_full_time:"bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  hired_contract:"bg-amber-500/10 text-amber-600 border-amber-500/20",
};

const CHANGE_ICONS: Record<string,any> = {
  member_type:ArrowRightLeft, salary:DollarSign, role_title:Pencil,
  department:Building2, end_date:Calendar,
};
const CHANGE_LABELS: Record<string,string> = {
  member_type:"Contract type", salary:"Salary", role_title:"Role title",
  department:"Department", end_date:"Contract end date",
};

function fmtDate(iso:string|null){
  if(!iso)return"—";
  return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}
function fmtCurrency(a:number|null,c="USD"){
  if(!a)return"Not specified";
  return new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:0}).format(a)+"/mo";
}
function getInitials(n:string){return n?.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)??"?";}

// ─── Change summary: show what's actually changing ────────────────────────────
function ChangeSummary({req}:{req:ChangeRequest}){
  const changes:Array<{key:string;from:string|null;to:string|null}> = [];

  if(req.change_types.includes("member_type") && req.proposed_member_type)
    changes.push({key:"member_type",from:req.current_member_type,to:req.proposed_member_type});
  if(req.change_types.includes("salary") && req.proposed_salary)
    changes.push({key:"salary",from:req.current_salary?fmtCurrency(req.current_salary):null,to:fmtCurrency(req.proposed_salary)});
  if(req.change_types.includes("role_title") && req.proposed_role_title)
    changes.push({key:"role_title",from:req.current_role_title,to:req.proposed_role_title});
  if(req.change_types.includes("department") && req.proposed_department)
    changes.push({key:"department",from:req.current_department,to:req.proposed_department});
  if(req.change_types.includes("end_date") && req.proposed_end_date)
    changes.push({key:"end_date",from:req.current_end_date?fmtDate(req.current_end_date):"No end date",to:fmtDate(req.proposed_end_date)});

  return(
    <div className="space-y-2">
      {changes.map(c=>{
        const Icon=CHANGE_ICONS[c.key]??Info;
        return(
          <div key={c.key} className="flex items-center gap-3 p-3 rounded-none bg-slate-500/5 border border-[var(--border-color)]">
            <Icon className="w-4 h-4 text-slate-400 shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{CHANGE_LABELS[c.key]}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {c.from&&<span className="text-[10px] font-black bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-none border border-[var(--border-color)] line-through opacity-60">{c.key==="member_type"?TYPE_LABELS[c.from]??c.from:c.from}</span>}
                {c.from&&<ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0"/>}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-none border ${c.key==="member_type"?TYPE_COLORS[c.to??""]??"bg-blue-500/10 text-blue-600 border-blue-500/20":"bg-blue-500/10 text-blue-600 border-blue-500/20"}`}>
                  {c.key==="member_type"?TYPE_LABELS[c.to??""]??c.to:c.to}
                </span>
              </div>
            </div>
          </div>
        );
      })}
      {req.proposed_start_date&&(
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mt-2">
          <Calendar className="w-3 h-3 shrink-0"/>
          Effective: {fmtDate(req.proposed_start_date)}
        </div>
      )}
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────
function RequestCard({req,onView,onRespond}:{req:ChangeRequest;onView:(r:ChangeRequest)=>void;onRespond:(r:ChangeRequest,action:"accepted"|"declined")=>void;}){
  const cfg=STATUS_CFG[req.status]??STATUS_CFG.pending;
  const StatusIcon=cfg.icon;
  const isPending=["pending","viewed"].includes(req.status);
  const orgName=req.org_profile?.company_name??req.org_profile?.full_name??"Organisation";

  return(
    <motion.div layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}}
      className="p-4 sm:p-5 rounded-none bg-[var(--card-bg)] border border-[var(--border-color)] flex flex-col gap-3 hover:border-blue-500/30 transition-all">
      {/* Status + date */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border ${cfg.bg} ${cfg.color}`}>
          <StatusIcon className="w-3 h-3 shrink-0"/>{cfg.label}
        </span>
        <span className="text-[10px] font-bold text-slate-400">{fmtDate(req.created_at)}</span>
      </div>

      {/* Org */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-none bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
          {req.org_profile?.avatar_url?<img src={req.org_profile.avatar_url} alt={orgName} className="w-full h-full object-cover"/>:<Building2 className="w-4 h-4 text-slate-400"/>}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black dark:text-white truncate">{orgName}</p>
          <p className="text-[10px] font-bold text-slate-400 truncate">{req.change_types.map(t=>CHANGE_LABELS[t]??t).join(" · ")}</p>
        </div>
      </div>

      {/* Change summary */}
      <ChangeSummary req={req}/>

      {/* Message preview */}
      {req.message&&<p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">{req.message}</p>}

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-color)]">
        <button onClick={()=>onView(req)} className="flex-1 py-2 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-slate-500/20 transition-all">
          View details
        </button>
        {isPending&&(
          <>
            <button onClick={()=>onRespond(req,"accepted")} className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-emerald-400 transition-all shadow-sm shadow-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-3 h-3"/><span className="hidden sm:inline">Accept</span>
            </button>
            <button onClick={()=>onRespond(req,"declined")} className="flex items-center justify-center gap-1 px-3 py-2 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-red-500/20 transition-all border border-red-500/20 shrink-0">
              <XCircle className="w-3 h-3"/><span className="hidden sm:inline">Decline</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function RequestDetailModal({req,onClose,onRespond,responding}:{req:ChangeRequest;onClose:()=>void;onRespond:(r:ChangeRequest,action:"accepted"|"declined",reason?:string)=>void;responding:boolean;}){
  const [showDecline,setShowDecline]=useState(false);
  const [declineReason,setDeclineReason]=useState("");
  const cfg=STATUS_CFG[req.status]??STATUS_CFG.pending;
  const isPending=["pending","viewed"].includes(req.status);
  const orgName=req.org_profile?.company_name??req.org_profile?.full_name??"Organisation";

  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}}
          onClick={e=>e.stopPropagation()}
          className="w-full sm:max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none[2rem] sm:rounded-none shadow-2xl overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-none bg-slate-500/30"/></div>

          {/* Header */}
          <div className="px-6 pt-4 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-none bg-slate-500/10 border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0">
                  {req.org_profile?.avatar_url?<img src={req.org_profile.avatar_url} alt={orgName} className="w-full h-full object-cover"/>:<Building2 className="w-4 h-4 text-slate-400"/>}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black dark:text-white truncate">{orgName}</p>
                  <p className="text-[10px] font-bold text-slate-400">Contract change request · {fmtDate(req.created_at)}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-none hover:bg-slate-500/10 text-slate-400 flex-shrink-0"><X className="w-4 h-4"/></button>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-none border ${cfg.bg} ${cfg.color}`}>
              <cfg.icon className="w-3 h-3"/>{cfg.label}
            </span>
          </div>

          {/* Changes */}
          <div className="px-6 py-4 max-h-52 overflow-y-auto">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Proposed changes</p>
            <ChangeSummary req={req}/>
          </div>

          {/* Message */}
          {req.message&&(
            <div className="px-6 pb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message from org</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{req.message}</p>
            </div>
          )}

          {/* Decline reason input */}
          {showDecline&&(
            <div className="px-6 pb-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Reason for declining (optional)</label>
              <textarea value={declineReason} onChange={e=>setDeclineReason(e.target.value)} rows={2}
                placeholder="Let them know why..."
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none p-3 text-sm font-medium outline-none focus:ring-2 ring-red-500/20 transition-all resize-none"/>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-6 pt-2">
            {isPending?(
              showDecline?(
                <div className="flex gap-2">
                  <button onClick={()=>setShowDecline(false)} className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-none hover:bg-slate-500/5 transition-all">Back</button>
                  <button onClick={()=>onRespond(req,"declined",declineReason)} disabled={responding}
                    className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                    {responding?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<XCircle className="w-3.5 h-3.5"/>}Confirm decline
                  </button>
                </div>
              ):(
                <div className="flex gap-2">
                  <button onClick={()=>setShowDecline(true)} className="flex-1 py-3 border border-red-500/20 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-red-500/20 transition-all">Decline</button>
                  <button onClick={()=>onRespond(req,"accepted")} disabled={responding}
                    className="flex-1 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-40">
                    {responding?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<CheckCircle2 className="w-3.5 h-3.5"/>}Accept changes
                  </button>
                </div>
              )
            ):(
              <button onClick={onClose} className="w-full py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-none hover:bg-slate-500/5 transition-all">Close</button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS=["all","pending","accepted","declined"] as const;

export default function TalentContractChangesPage(){
  const {toast}=useToast();
  const [requests,setRequests]=useState<ChangeRequest[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [activeTab,setActiveTab]=useState<string>("all");
  const [viewReq,setViewReq]=useState<ChangeRequest|null>(null);
  const [responding,setResponding]=useState(false);

  const fetchRequests=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const {data:{user}}=await supabase.auth.getUser();
      if(!user) throw new Error("Not authenticated");
      const {data,error:dbErr}=await supabase
        .from("contract_change_requests")
        .select(`*, org_profile:profiles!contract_change_requests_organization_id_fkey(full_name,avatar_url,company_name)`)
        .eq("talent_id",user.id)
        .order("created_at",{ascending:false});
      if(dbErr) throw dbErr;
      setRequests((data??[]) as ChangeRequest[]);

      // Mark pending as viewed
      const pendingIds=(data??[]).filter(r=>r.status==="pending").map(r=>r.id);
      if(pendingIds.length>0) await supabase.from("contract_change_requests").update({status:"viewed"}).in("id",pendingIds);
    }catch(err:any){setError(err.message);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchRequests();},[fetchRequests]);

  const handleRespond=async(req:ChangeRequest,response:"accepted"|"declined",reason="")=>{
    setResponding(true);
    try{
      const {error}=await supabase.from("contract_change_requests").update({status:response,decline_reason:response==="declined"?reason:null}).eq("id",req.id);
      if(error) throw error;
      setRequests(prev=>prev.map(r=>r.id===req.id?{...r,status:response}:r));
      setViewReq(null);
      toast(response==="accepted"
        ?{title:"Changes accepted! ✓",description:"Your contract has been updated. Check Active Workforce for details."}
        :{title:"Changes declined",description:"The organisation has been notified."});
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setResponding(false);}
  };

  const filtered=requests.filter(r=>{
    if(activeTab==="all") return true;
    if(activeTab==="pending") return["pending","viewed"].includes(r.status);
    return r.status===activeTab;
  });

  const counts={
    all:requests.length,
    pending:requests.filter(r=>["pending","viewed"].includes(r.status)).length,
    accepted:requests.filter(r=>r.status==="accepted").length,
    declined:requests.filter(r=>r.status==="declined").length,
  };

  if(loading) return <div className="w-full flex items-center justify-center py-32"><Loader2 className="w-8 h-8 text-blue-500 animate-spin"/></div>;
  if(error) return <div className="w-full flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-bold text-red-500">{error}</p><button onClick={fetchRequests} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none"><RefreshCw className="w-3.5 h-3.5"/> Retry</button></div>;

  return(
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest"><ArrowRightLeft className="w-3.5 h-3.5"/> Contract Changes</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">Contract changes.</h1>
        <p className="text-sm font-medium text-slate-400">
          {counts.pending>0?<span className="text-amber-600 font-black">{counts.pending} pending — review and respond · </span>:null}
          {counts.all} total · {counts.accepted} accepted
        </p>
      </div>

      {/* Pending banner */}
      {counts.pending>0&&(
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
          className="flex items-start gap-3 p-4 rounded-none bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"/>
          <div>
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">{counts.pending} change request{counts.pending>1?"s":""} pending your response</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Review the proposed changes carefully before accepting — once accepted, your contract is updated immediately.</p>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-none text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab===tab?"bg-[var(--card-bg)] text-blue-600 border-blue-500/20 shadow-sm":"border-transparent text-slate-400 hover:text-slate-600"}`}>
            {tab}<span className="ml-1.5 text-[9px] opacity-60">{counts[tab as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filtered.length>0?(
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>{filtered.map(req=><RequestCard key={req.id} req={req} onView={setViewReq} onRespond={handleRespond}/>)}</AnimatePresence>
          </motion.div>
        ):(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-24 text-center space-y-4 bg-slate-500/5 rounded-none border border-dashed border-[var(--border-color)]">
            <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto"/>
            <h3 className="text-lg font-black tracking-tighter uppercase dark:text-white">{activeTab==="all"?"No contract changes yet":`No ${activeTab} requests`}</h3>
            <p className="text-sm text-slate-400">{activeTab==="all"?"Your organisation will send contract change requests here when needed":""}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{viewReq&&<RequestDetailModal req={viewReq} onClose={()=>setViewReq(null)} onRespond={handleRespond} responding={responding}/>}</AnimatePresence>
    </div>
  );
}