"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, SlidersHorizontal, ChevronDown, X,
  MapPin, DollarSign, Calendar, Eye, EyeOff, FolderKanban,
  MoreHorizontal, Loader2, RefreshCw, UserPlus, Briefcase,
  Clock, Building2, Zap, Trash2, AlertTriangle, History,
  FileText, Send, ArrowRightLeft, Pencil, TrendingUp, Info,
  BookOpen, CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

type MemberType   = "employee"|"hired_full_time"|"hired_contract";
type OnlineStatus = "online"|"away"|"offline";
type AvailStatus  = "available"|"on_leave"|"notice_period"|"unavailable";

interface MemberProject { id:string; name:string; role_on_project:string|null; }

interface WorkforceMember {
  id:string; profile_id:string|null; full_name:string; avatar_url:string|null;
  email:string|null; role_title:string|null; location:string|null; department:string|null;
  member_type:MemberType; start_date:string|null; end_date:string|null;
  payment_monthly:number|null; payment_currency:string;
  is_active:boolean; online_status:OnlineStatus;
  availability_status:AvailStatus|null; document_url:string|null;
  document_name:string|null; notes:string|null; created_at:string;
  // ↓ now an array — one member can be on many projects
  projects: MemberProject[];
  profile?:{full_name:string;avatar_url:string|null;location:string|null;email:string|null;bio:string|null;skills:string[]|null}|null;
}
interface Project { id:string; name:string; status:string; }
interface HistoryEntry {
  id:string; change_type:string; old_values:any; new_values:any;
  triggered_by:string; notes:string|null; created_at:string;
}

const TABS=[{key:"all",label:"All",icon:Users},{key:"employee",label:"Employees",icon:Building2},{key:"hired_full_time",label:"Full-time",icon:Briefcase},{key:"hired_contract",label:"Contractors",icon:Clock}];

const TYPE_CFG:Record<MemberType,{label:string;color:string;bg:string;dot:string}>={
  employee:{label:"Employee",color:"text-blue-600",bg:"bg-blue-500/10 border-blue-500/20",dot:"bg-blue-500"},
  hired_full_time:{label:"Full-time hire",color:"text-emerald-600",bg:"bg-emerald-500/10 border-emerald-500/20",dot:"bg-emerald-500"},
  hired_contract:{label:"Contractor",color:"text-amber-600",bg:"bg-amber-500/10 border-amber-500/20",dot:"bg-amber-500"},
};
const ONLINE_CFG:Record<OnlineStatus,{dot:string;label:string}>={
  online:{dot:"bg-emerald-500",label:"Online"},away:{dot:"bg-amber-500",label:"Away"},offline:{dot:"bg-slate-400",label:"Offline"},
};
const AVAIL_CFG:Record<AvailStatus,{label:string;color:string;bg:string}>={
  available:{label:"Available",color:"text-emerald-600",bg:"bg-emerald-500/10 border-emerald-500/20"},
  on_leave:{label:"On leave",color:"text-amber-600",bg:"bg-amber-500/10 border-amber-500/20"},
  notice_period:{label:"Notice period",color:"text-red-500",bg:"bg-red-500/10 border-red-500/20"},
  unavailable:{label:"Unavailable",color:"text-slate-500",bg:"bg-slate-500/10 border-slate-500/20"},
};
const CHANGE_LABELS:Record<string,string>={
  hired:"Hired",contract_changed:"Contract changed",salary_changed:"Salary changed",
  role_changed:"Role changed",removed:"Removed",project_assigned:"Project assigned",
  availability_changed:"Availability changed",
};

function fmtCurrency(a:number|null,c="USD"){if(!a)return"—";return new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:0}).format(a)+"/mo";}
function fmtDate(iso:string|null){if(!iso)return"—";return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function getInitials(n:string){return n?.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)??"?";}
function daysUntil(iso:string|null){if(!iso)return null;return Math.ceil((new Date(iso).getTime()-Date.now())/(1000*60*60*24));}

const rAvatar=(m:WorkforceMember)=>m.profile?.avatar_url??m.avatar_url??null;
const rName=(m:WorkforceMember)=>m.profile?.full_name??m.full_name;
const rLocation=(m:WorkforceMember)=>m.profile?.location??m.location??null;
const rEmail=(m:WorkforceMember)=>m.profile?.email??m.email??null;

function PaymentCell({amount,currency}:{amount:number|null;currency:string}){
  const [shown,setShown]=useState(false);
  return(<button onClick={()=>setShown(v=>!v)} className="flex items-center gap-1.5 group"><DollarSign className="w-3 h-3 text-slate-400 shrink-0"/><span className={`text-xs font-black transition-all ${shown?"text-slate-600 dark:text-slate-300":"blur-sm select-none text-slate-400"}`}>{fmtCurrency(amount,currency)}</span>{shown?<EyeOff className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"/>:<Eye className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"/>}</button>);
}

function MemberAvatar({member,size="md"}:{member:WorkforceMember;size?:"sm"|"md"|"lg"}){
  const [err,setErr]=useState(false);
  const avatar=rAvatar(member);const name=rName(member);
  const online=ONLINE_CFG[member.online_status??"offline"];
  const sz=size==="lg"?"w-16 h-16 rounded-2xl text-xl":size==="sm"?"w-8 h-8 rounded-lg text-xs":"w-12 h-12 rounded-xl text-sm";
  const dotSz=size==="lg"?"w-4 h-4 -bottom-1 -right-1 border-2":"w-3 h-3 -bottom-0.5 -right-0.5 border-2";
  return(<div className="relative shrink-0"><div className={`${sz} bg-slate-500/10 border border-[var(--border-color)] overflow-hidden flex items-center justify-center`}>{avatar&&!err?<img src={avatar} alt={name} className="w-full h-full object-cover" onError={()=>setErr(true)}/>:<span className="font-black text-slate-400 uppercase">{getInitials(name)}</span>}</div><span className={`absolute ${dotSz} rounded-full border-[var(--card-bg)] ${online.dot}`} title={online.label}/></div>);
}

function ConfirmDialog({title,message,confirmLabel="Delete",onConfirm,onCancel,danger=true}:{title:string;message:string;confirmLabel?:string;onConfirm:()=>void;onCancel:()=>void;danger?:boolean;}){
  return(<AnimatePresence><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"><motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}} onClick={e=>e.stopPropagation()} className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl"><div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${danger?"bg-red-500/10":"bg-amber-500/10"}`}><Trash2 className={`w-5 h-5 ${danger?"text-red-500":"text-amber-500"}`}/></div><h3 className="text-base font-black dark:text-white tracking-tight mb-2">{title}</h3><p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p><div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button><button onClick={onConfirm} className={`flex-1 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${danger?"bg-red-500 hover:bg-red-400":"bg-amber-500 hover:bg-amber-400"}`}>{confirmLabel}</button></div></motion.div></motion.div></AnimatePresence>);
}

function ContractChangeModal({member,onClose,onSend,sending}:{member:WorkforceMember;onClose:()=>void;onSend:(r:any)=>void;sending:boolean;}){
  const [changeTypes,setChangeTypes]=useState<string[]>([]);
  const [form,setForm]=useState({proposed_member_type:member.member_type,proposed_salary:member.payment_monthly?.toString()??"",proposed_role_title:member.role_title??"",proposed_department:member.department??"",proposed_end_date:member.end_date??"",proposed_start_date:new Date().toISOString().split("T")[0],message:""});
  const toggle=(t:string)=>setChangeTypes(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);
  const upd=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  const OPTS=[{key:"member_type",label:"Contract type",icon:ArrowRightLeft},{key:"salary",label:"Salary",icon:DollarSign},{key:"role_title",label:"Role title",icon:Pencil},{key:"department",label:"Department",icon:Building2},{key:"end_date",label:"End date",icon:Calendar}];
  const isValid=changeTypes.length>0&&form.message.trim();
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}} onClick={e=>e.stopPropagation()} className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-7 pt-7 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3"><MemberAvatar member={member} size="sm"/><div><p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Contract change request</p><h2 className="text-base font-black dark:text-white tracking-tight">{rName(member)}</h2></div></div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400"><X className="w-4 h-4"/></button>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10"><Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"/><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{rName(member).split(" ")[0]} must <strong className="text-slate-600 dark:text-slate-300">accept</strong> these changes before they take effect.</p></div>
          </div>
          <div className="px-7 pb-0 space-y-4 max-h-[55vh] overflow-y-auto">
            <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">What to change? *</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{OPTS.map(o=>{const Icon=o.icon;const active=changeTypes.includes(o.key);return(<button key={o.key} type="button" onClick={()=>toggle(o.key)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${active?"bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20":"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}><Icon className="w-3 h-3 shrink-0"/>{o.label}</button>);})} </div></div>
            {changeTypes.includes("member_type")&&(<div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New contract type</label><div className="grid grid-cols-3 gap-2">{(["employee","hired_full_time","hired_contract"] as MemberType[]).map(t=>{const cfg=TYPE_CFG[t];const active=form.proposed_member_type===t;return(<button key={t} type="button" onClick={()=>upd("proposed_member_type",t)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center leading-tight ${active?`${cfg.bg} ${cfg.color} border-current`:"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>{cfg.label}</button>);})}</div><div className="flex items-center gap-2 mt-2"><span className={`text-[9px] font-black px-2 py-0.5 rounded-xl border ${TYPE_CFG[member.member_type].bg} ${TYPE_CFG[member.member_type].color}`}>{TYPE_CFG[member.member_type].label}</span><ArrowRightLeft className="w-3 h-3 text-slate-400"/><span className={`text-[9px] font-black px-2 py-0.5 rounded-xl border ${TYPE_CFG[form.proposed_member_type as MemberType].bg} ${TYPE_CFG[form.proposed_member_type as MemberType].color}`}>{TYPE_CFG[form.proposed_member_type as MemberType].label}</span></div></div>)}
            {changeTypes.includes("salary")&&(<div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New monthly salary</label><input value={form.proposed_salary} onChange={e=>upd("proposed_salary",e.target.value)} type="number" placeholder="e.g. 6000" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>{member.payment_monthly&&<p className="text-[10px] text-slate-400 mt-1">Current: {fmtCurrency(member.payment_monthly,member.payment_currency)}</p>}</div>)}
            {changeTypes.includes("role_title")&&(<div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New role title</label><input value={form.proposed_role_title} onChange={e=>upd("proposed_role_title",e.target.value)} placeholder="e.g. Senior Engineer" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>{member.role_title&&<p className="text-[10px] text-slate-400 mt-1">Current: {member.role_title}</p>}</div>)}
            {changeTypes.includes("department")&&(<div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New department</label><div className="relative"><select value={form.proposed_department} onChange={e=>upd("proposed_department",e.target.value)} className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 cursor-pointer">{["Engineering","Design","Product","Operations","Marketing","Finance","Human Resources","Sales"].map(d=><option key={d}>{d}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"/></div></div>)}
            {changeTypes.includes("end_date")&&(<div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">New contract end date</label><input type="date" value={form.proposed_end_date} onChange={e=>upd("proposed_end_date",e.target.value)} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>{member.end_date&&<p className="text-[10px] text-slate-400 mt-1">Current end: {fmtDate(member.end_date)}</p>}</div>)}
            <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Effective date</label><input type="date" value={form.proposed_start_date} onChange={e=>upd("proposed_start_date",e.target.value)} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
            <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Message to talent *</label><textarea value={form.message} onChange={e=>upd("message",e.target.value)} rows={3} placeholder="Explain the reason for this change..." className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"/></div>
          </div>
          <div className="px-7 py-5 flex gap-3"><button onClick={onClose} className="flex-1 py-3.5 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button><button onClick={()=>onSend({...form,change_types:changeTypes})} disabled={!isValid||sending} className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40">{sending?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Send className="w-3.5 h-3.5"/>}Send request</button></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function HistoryPanel({history,loading}:{history:HistoryEntry[];loading:boolean}){
  if(loading) return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400"/></div>;
  if(history.length===0) return <div className="py-8 text-center"><p className="text-xs font-bold text-slate-400">No history yet</p></div>;
  const ICONS:Record<string,any>={hired:CheckCircle2,contract_changed:ArrowRightLeft,salary_changed:TrendingUp,role_changed:Pencil,removed:Trash2,project_assigned:FolderKanban};
  return(
    <div className="space-y-4">
      {history.map(h=>{const Icon=ICONS[h.change_type]??History;return(
        <div key={h.id} className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-slate-500/10 flex items-center justify-center shrink-0 mt-0.5"><Icon className="w-3.5 h-3.5 text-slate-500"/></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black dark:text-white">{CHANGE_LABELS[h.change_type]??h.change_type}</p>
            {Object.keys(h.new_values||{}).length>0&&(<div className="flex flex-wrap gap-1 mt-1">{Object.entries(h.new_values).map(([k,v]:any)=>v!=null&&<span key={k} className="text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md">{k.replace(/_/g," ")}: {typeof v==="number"?fmtCurrency(v):String(v)}</span>)}</div>)}
            {h.notes&&<p className="text-[10px] text-slate-400 mt-0.5">{h.notes}</p>}
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">{fmtDate(h.created_at)} · {h.triggered_by}</p>
          </div>
        </div>
      );})}
    </div>
  );
}

function ProfileDrawer({member,onClose,onRemove,onRequestChange,onAvailabilityChange}:{member:WorkforceMember;onClose:()=>void;onRemove:(id:string)=>void;onRequestChange:(m:WorkforceMember)=>void;onAvailabilityChange:(id:string,s:AvailStatus)=>void;}){
  const [tab,setTab]=useState<"info"|"history">("info");
  const [confirmRemove,setConfirmRemove]=useState(false);
  const [history,setHistory]=useState<HistoryEntry[]>([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const tc=TYPE_CFG[member.member_type];
  const oc=ONLINE_CFG[member.online_status??"offline"];
  const ac=AVAIL_CFG[member.availability_status??"available"];
  const email=rEmail(member);const name=rName(member);
  const skills=member.profile?.skills??[];const bio=member.profile?.bio??null;
  const daysLeft=daysUntil(member.end_date);
  const expiryWarning=daysLeft!==null&&daysLeft<=7&&daysLeft>=0;

  useEffect(()=>{
    if(tab!=="history") return;
    setHistoryLoading(true);
    supabase.from("employment_history").select("*").eq("workforce_member_id",member.id).order("created_at",{ascending:false})
      .then(({data})=>{setHistory(data??[]);setHistoryLoading(false);});
  },[tab,member.id]);

  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"/>
      <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:280}}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--card-bg)] border-l border-[var(--border-color)] z-50 flex flex-col shadow-2xl">
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-3 min-w-0"><MemberAvatar member={member} size="sm"/><div className="min-w-0"><p className="text-sm font-black dark:text-white truncate">{name}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{member.role_title||"No title"}</p></div></div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button onClick={()=>onRequestChange(member)} title="Request contract change" className="p-2 rounded-xl hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 transition-colors"><ArrowRightLeft className="w-4 h-4"/></button>
            <button onClick={()=>setConfirmRemove(true)} title="Remove" className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
          </div>
        </div>
        {expiryWarning&&(<div className="shrink-0 flex items-center gap-2 px-5 py-3 bg-amber-500/5 border-b border-amber-500/20"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0"/><p className="text-[11px] font-black text-amber-600">Contract expires in <strong>{daysLeft} day{daysLeft!==1?"s":""}</strong> — {fmtDate(member.end_date)}</p></div>)}
        <div className="shrink-0 flex gap-1 px-5 py-3 border-b border-[var(--border-color)]">
          {[{key:"info",label:"Profile",icon:Info},{key:"history",label:"History",icon:History}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${tab===t.key?"bg-[var(--card-bg)] text-blue-600 border-blue-500/20 shadow-sm":"border-transparent text-slate-400 hover:text-slate-600"}`}><t.icon className="w-3.5 h-3.5"/>{t.label}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {tab==="info"?(
            <>
              <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-500/5 border border-[var(--border-color)] mb-4">
                <MemberAvatar member={member} size="lg"/>
                <h2 className="text-xl font-black tracking-tight dark:text-white mt-4">{name}</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{member.role_title||"No title"}</p>
                {member.department&&<p className="text-[11px] font-bold text-slate-400 mt-1">{member.department}</p>}
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${tc.bg} ${tc.color}`}><span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>{tc.label}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${ac.bg} ${ac.color}`}>{ac.label}</span>
                  <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${oc.dot==="bg-emerald-500"?"bg-emerald-500/10 text-emerald-600":"bg-slate-500/10 text-slate-400"}`}><span className={`w-1.5 h-1.5 rounded-full ${oc.dot}`}/>{oc.label}</span>
                </div>
              </div>
              {bio&&<div className="bg-slate-500/5 rounded-xl p-4 mb-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3"/>Bio</p><p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{bio}</p></div>}
              {skills.length>0&&<div className="bg-slate-500/5 rounded-xl p-4 mb-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Skills</p><div className="flex flex-wrap gap-1.5">{skills.map(s=><span key={s} className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/10 px-2 py-0.5 rounded-xl">{s}</span>)}</div></div>}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[{label:"Location",value:rLocation(member)||"—"},{label:"Start date",value:fmtDate(member.start_date)},{label:"Department",value:member.department||"—"},{label:"Contract end",value:member.end_date?fmtDate(member.end_date):"Ongoing"}].map(m=>(
                  <div key={m.label} className="bg-slate-500/5 rounded-xl p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p><p className={`text-sm font-black dark:text-white ${m.label==="Contract end"&&expiryWarning?"text-amber-600":""}`}>{m.value}</p></div>
                ))}
              </div>
              {email&&<div className="bg-slate-500/5 rounded-xl p-4 mb-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p><a href={`mailto:${email}`} className="text-sm font-black text-blue-600 hover:underline break-all">{email}</a></div>}
              <div className="bg-slate-500/5 rounded-xl p-4 mb-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly payment</p><PaymentCell amount={member.payment_monthly} currency={member.payment_currency}/></div>

              {/* ── Projects section — shows ALL assigned projects ── */}
              {member.projects.length>0?(
                <div className="mb-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                    <FolderKanban className="w-3 h-3"/>Projects ({member.projects.length})
                  </p>
                  <div className="space-y-2">
                    {member.projects.map(p=>(
                      <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <FolderKanban className="w-4 h-4 text-blue-500 shrink-0 mt-0.5"/>
                        <div className="min-w-0">
                          <p className="text-xs font-black dark:text-white truncate">{p.name}</p>
                          {p.role_on_project&&<p className="text-[10px] font-bold text-slate-400 mt-0.5">{p.role_on_project}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ):(
                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-500/5 border border-dashed border-[var(--border-color)] mb-3">
                  <FolderKanban className="w-4 h-4 text-slate-400 shrink-0"/>
                  <p className="text-xs font-bold text-slate-400">Not assigned to any project</p>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-500/5 border border-[var(--border-color)] mb-3"><FileText className="w-5 h-5 text-slate-400 shrink-0"/><div className="flex-1 min-w-0"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Contract document</p>{member.document_url?<a href={member.document_url} target="_blank" rel="noreferrer" className="text-xs font-black text-blue-600 hover:underline truncate block">{member.document_name||"View contract"}</a>:<p className="text-xs font-bold text-slate-400">No document attached</p>}</div></div>
              <div className="bg-slate-500/5 rounded-xl p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Availability</p><div className="grid grid-cols-2 gap-2">{(Object.entries(AVAIL_CFG) as [AvailStatus,any][]).map(([k,v])=>(<button key={k} onClick={()=>onAvailabilityChange(member.id,k)} className={`py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-left ${(member.availability_status===k||(!member.availability_status&&k==="available"))?`${v.bg} ${v.color} border-current`:"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>{v.label}</button>))}</div></div>
            </>
          ):<HistoryPanel history={history} loading={historyLoading}/>}
        </div>
        <div className="shrink-0 p-4 border-t border-[var(--border-color)] bg-[var(--card-bg)] flex gap-2">
          <button onClick={()=>onRequestChange(member)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><ArrowRightLeft className="w-3.5 h-3.5"/> Request change</button>
          {email&&<a href={`mailto:${email}`} className="px-4 py-3 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all flex items-center gap-2">Email</a>}
        </div>
      </motion.div>
      {confirmRemove&&<ConfirmDialog title={`Remove ${name}?`} message={`${name} will be removed from your active workforce. Their history is preserved.`} confirmLabel="Remove" danger onConfirm={()=>{onRemove(member.id);setConfirmRemove(false);onClose();}} onCancel={()=>setConfirmRemove(false)}/>}
    </AnimatePresence>
  );
}

function MemberCard({member,onAssign,onView,onRemove}:{member:WorkforceMember;onAssign:(m:WorkforceMember)=>void;onView:(m:WorkforceMember)=>void;onRemove:(id:string)=>void;}){
  const [menuOpen,setMenuOpen]=useState(false);
  const [confirmId,setConfirmId]=useState<string|null>(null);
  const tc=TYPE_CFG[member.member_type];
  const ac=member.availability_status?AVAIL_CFG[member.availability_status]:null;
  const daysLeft=daysUntil(member.end_date);
  const expiring=daysLeft!==null&&daysLeft<=7&&daysLeft>=0;
  const hasProjects=member.projects.length>0;

  return(
    <motion.div layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}}
      className={`p-5 rounded-2xl bg-[var(--card-bg)] border shadow-sm flex flex-col gap-4 hover:border-blue-500/30 transition-all relative group ${expiring?"border-amber-500/40":"border-[var(--border-color)]"}`}>
      {expiring&&<div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-md"><AlertTriangle className="w-2.5 h-2.5"/> Expires in {daysLeft}d</div>}
      <div className="absolute top-4 right-4 z-10">
        <button onClick={()=>setMenuOpen(v=>!v)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-500/10 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4"/></button>
        <AnimatePresence>{menuOpen&&(<motion.div initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}} className="absolute right-0 top-8 w-44 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden z-30"><button onClick={()=>{onView(member);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold hover:bg-slate-500/5 transition-colors"><Eye className="w-3.5 h-3.5"/> View profile</button><div className="h-px bg-[var(--border-color)] mx-2"/><button onClick={()=>{setConfirmId(member.id);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"><Trash2 className="w-3.5 h-3.5"/> Remove</button></motion.div>)}</AnimatePresence>
      </div>
      <div className={`flex items-start gap-3 pr-8 ${expiring?"mt-5":""}`}>
        <MemberAvatar member={member} size="md"/>
        <div className="min-w-0 flex-1"><h3 className="text-sm font-black dark:text-white tracking-tight truncate">{rName(member)}</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mt-0.5">{member.role_title||"No title"}</p></div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${tc.bg} ${tc.color}`}><span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`}/>{tc.label}</span>
        {ac&&member.availability_status!=="available"&&<span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${ac.bg} ${ac.color}`}>{ac.label}</span>}
      </div>
      <div className="space-y-1.5">
        {rLocation(member)&&<div className="flex items-center gap-2 text-[11px] font-bold text-slate-400"><MapPin className="w-3 h-3 shrink-0"/><span className="truncate">{rLocation(member)}</span></div>}
        {member.start_date&&<div className="flex items-center gap-2 text-[11px] font-bold text-slate-400"><Calendar className="w-3 h-3 shrink-0"/><span>Since {fmtDate(member.start_date)}</span></div>}
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400"><PaymentCell amount={member.payment_monthly} currency={member.payment_currency}/></div>

        {/* ── Multi-project pills ── */}
        {hasProjects?(
          <div className="flex items-start gap-1.5 pt-0.5">
            <FolderKanban className="w-3 h-3 shrink-0 text-blue-500 mt-0.5"/>
            <div className="flex flex-wrap gap-1">
              {member.projects.slice(0,2).map(p=>(
                <span key={p.id} className="text-[10px] font-black text-blue-600 bg-blue-500/10 border border-blue-500/10 px-1.5 py-0.5 rounded-lg truncate max-w-[110px]">{p.name}</span>
              ))}
              {member.projects.length>2&&<span className="text-[10px] font-black text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded-lg">+{member.projects.length-2} more</span>}
            </div>
          </div>
        ):(
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <FolderKanban className="w-3 h-3 shrink-0"/>
            <span>No project assigned</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-[var(--border-color)]">
        <button onClick={()=>onAssign(member)} className="flex-1 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20">
          <FolderKanban className="w-3 h-3"/>{hasProjects?`Projects (${member.projects.length})`:"Assign project"}
        </button>
        <button onClick={()=>onView(member)} className="px-4 py-2.5 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-500/20 transition-all">View</button>
      </div>
      {confirmId&&<ConfirmDialog title={`Remove ${rName(member)}?`} message="They will be removed from your active workforce. History is preserved." confirmLabel="Remove" danger onConfirm={()=>{onRemove(confirmId);setConfirmId(null);}} onCancel={()=>setConfirmId(null)}/>}
    </motion.div>
  );
}

function AssignProjectModal({member,projects,navigate,onAssign,onClose,saving}:any){
  const [projectId,setProjectId]=useState("");
  const [role,setRole]=useState("");
  if(!member) return null;
  const alreadyAssignedIds=new Set(member.projects.map((p:MemberProject)=>p.id));
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}} onClick={e=>e.stopPropagation()} className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-black dark:text-white tracking-tight">Assign to project</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">For <span className="text-slate-600 dark:text-slate-300">{rName(member)}</span></p>
              {member.projects.length>0&&<p className="text-[10px] font-bold text-blue-600 mt-1">Already on {member.projects.length} project{member.projects.length>1?"s":""}</p>}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400"><X className="w-4 h-4"/></button>
          </div>
          {projects.length===0?(
            <div className="text-center py-8 space-y-4"><FolderKanban className="w-12 h-12 text-slate-300 mx-auto"/><div><p className="text-sm font-black dark:text-white">No active projects yet</p><p className="text-xs text-slate-400 mt-1">Create a project first.</p></div><button onClick={()=>{onClose();navigate("/client/projects");}} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><Plus className="w-3.5 h-3.5"/>Create a project</button></div>
          ):(
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project *</label>
                <div className="relative">
                  <select value={projectId} onChange={e=>setProjectId(e.target.value)} className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 cursor-pointer">
                    <option value="">Select a project</option>
                    {projects.map((p:Project)=>(
                      <option key={p.id} value={p.id} disabled={alreadyAssignedIds.has(p.id)}>
                        {p.name}{alreadyAssignedIds.has(p.id)?" (already assigned)":""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"/>
                </div>
              </div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Role on project</label><input value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Lead Developer" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-3.5 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button>
                <button onClick={()=>onAssign({projectId,role})} disabled={!projectId||saving} className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40">{saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Zap className="w-3.5 h-3.5 fill-current"/>}Assign now</button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AddMemberModal({onAdd,onClose,saving}:any){
  const [form,setForm]=useState({full_name:"",email:"",role_title:"",location:"",department:"",member_type:"employee" as MemberType,start_date:new Date().toISOString().split("T")[0],payment_monthly:""});
  const upd=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  return(<AnimatePresence><motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"><motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}} onClick={e=>e.stopPropagation()} className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-start justify-between mb-6"><div><h2 className="text-lg font-black dark:text-white tracking-tight">Add workforce member</h2><p className="text-xs font-bold text-slate-400 mt-1">Add manually</p></div><button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-500/10 text-slate-400 shrink-0"><X className="w-4 h-4"/></button></div><div className="space-y-4"><div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Member type *</label><div className="grid grid-cols-3 gap-2">{(["employee","hired_full_time","hired_contract"] as MemberType[]).map(t=>{const cfg=TYPE_CFG[t];return<button key={t} type="button" onClick={()=>upd("member_type",t)} className={`py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border text-center leading-tight ${form.member_type===t?`${cfg.bg} ${cfg.color} border-current`:"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>{cfg.label}</button>;})}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[{k:"full_name",l:"Full name *",p:"Cameron Williamson"},{k:"email",l:"Email",p:"email@company.com"},{k:"role_title",l:"Role title",p:"Senior Engineer"},{k:"location",l:"Location",p:"Remote (Ghana)"}].map(f=>(<div key={f.k}><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{f.l}</label><input value={(form as any)[f.k]} onChange={e=>upd(f.k,e.target.value)} placeholder={f.p} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>))}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start date</label><input type="date" value={form.start_date} onChange={e=>upd("start_date",e.target.value)} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div><div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly payment</label><input value={form.payment_monthly} onChange={e=>upd("payment_monthly",e.target.value)} placeholder="e.g. 5000" type="number" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div></div></div><div className="flex gap-3 mt-6"><button onClick={onClose} className="flex-1 py-3.5 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-xl hover:bg-slate-500/5 transition-all">Cancel</button><button onClick={()=>onAdd(form)} disabled={!form.full_name.trim()||saving} className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40">{saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<UserPlus className="w-3.5 h-3.5"/>}Add member</button></div></motion.div></motion.div></AnimatePresence>);
}

export default function ActiveWorkforcePage(){
  const navigate=useNavigate();
  const {toast}=useToast();
  const [members,setMembers]=useState<WorkforceMember[]>([]);
  const [projects,setProjects]=useState<Project[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [activeTab,setActiveTab]=useState("all");
  const [search,setSearch]=useState("");
  const [filterDept,setFilterDept]=useState("All departments");
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [assignTarget,setAssignTarget]=useState<WorkforceMember|null>(null);
  const [profileTarget,setProfileTarget]=useState<WorkforceMember|null>(null);
  const [changeTarget,setChangeTarget]=useState<WorkforceMember|null>(null);
  const [showAddModal,setShowAddModal]=useState(false);
  const [saving,setSaving]=useState(false);

  const fetchAll=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const {data:{user},error:authErr}=await supabase.auth.getUser();
      if(authErr||!user) throw new Error("Not authenticated");

      const [{data:md,error:mErr},{data:pd,error:pErr},{data:pmData}]=await Promise.all([
        supabase.from("workforce_members").select("*").eq("organization_id",user.id).eq("is_active",true).order("created_at",{ascending:false}),
        supabase.from("projects").select("id,name,status").eq("organization_id",user.id).eq("status","active").order("name"),
        supabase.from("project_members").select("workforce_member_id,project_id,role_on_project").eq("organization_id",user.id),
      ]);
      if(mErr) throw mErr; if(pErr) throw pErr;

      // Build a full project name map (active + all)
      const {data:allProjects}=await supabase.from("projects").select("id,name").eq("organization_id",user.id);
      const projNameMap:Record<string,string>={};
      (allProjects??[]).forEach((p:any)=>{projNameMap[p.id]=p.name;});

      // Build memberId → projects[] from junction table
      const memberProjectsMap:Record<string,MemberProject[]>={};
      (pmData??[]).forEach((pm:any)=>{
        if(!memberProjectsMap[pm.workforce_member_id]) memberProjectsMap[pm.workforce_member_id]=[];
        memberProjectsMap[pm.workforce_member_id].push({id:pm.project_id,name:projNameMap[pm.project_id]??"Unknown",role_on_project:pm.role_on_project});
      });

      // Enrich with profiles
      const profileIds=(md??[]).map((m:any)=>m.profile_id).filter(Boolean);
      let profileMap:Record<string,any>={};
      if(profileIds.length>0){
        const {data:pData}=await supabase.from("profiles").select("id,full_name,avatar_url,location,email,bio,skills").in("id",profileIds);
        if(pData) profileMap=Object.fromEntries(pData.map((p:any)=>[p.id,p]));
      }

      setMembers(((md??[]).map((m:any)=>({
        ...m,
        projects: memberProjectsMap[m.id]??[],
        profile: m.profile_id?profileMap[m.profile_id]??null:null,
      }))) as WorkforceMember[]);
      setProjects(pd??[]);
    }catch(err:any){setError(err.message??"Could not load workforce.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{
    const ch=supabase.channel("workforce-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"workforce_members"},fetchAll)
      .on("postgres_changes",{event:"*",schema:"public",table:"project_members"},fetchAll)
      .subscribe();
    return()=>{supabase.removeChannel(ch);};
  },[fetchAll]);

  const handleAddMember=async(form:any)=>{
    setSaving(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error("Not authenticated");
      const {error}=await supabase.from("workforce_members").insert({organization_id:user.id,full_name:form.full_name,email:form.email||null,role_title:form.role_title||null,location:form.location||null,member_type:form.member_type,start_date:form.start_date||null,payment_monthly:form.payment_monthly?Number(form.payment_monthly):null,payment_currency:"USD",is_active:true});
      if(error) throw error;
      toast({title:"Member added ✓"});setShowAddModal(false);fetchAll();
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setSaving(false);}
  };

  const handleAssignProject=async({projectId,role}:any)=>{
    if(!assignTarget) return;setSaving(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error("Not authenticated");
      // Use project_members junction — supports multiple projects per member
      const {error}=await supabase.from("project_members").upsert({
        project_id:projectId,workforce_member_id:assignTarget.id,
        organization_id:user.id,role_on_project:role||null,
      },{onConflict:"project_id,workforce_member_id"});
      if(error) throw error;
      const proj=projects.find(p=>p.id===projectId);
      if(assignTarget.profile_id) await supabase.from("notifications").insert({user_id:assignTarget.profile_id,title:"You've been assigned to a project! 📁",message:`Assigned to "${proj?.name??"a project"}"${role?` as ${role}`:""}. Check your Flowboard dashboard.`,type:"project_assigned"});
      if(user) await supabase.from("employment_history").insert({organization_id:user.id,workforce_member_id:assignTarget.id,talent_id:assignTarget.profile_id,change_type:"project_assigned",old_values:{},new_values:{project:proj?.name,role},triggered_by:"org"});
      toast({title:"Assigned ✓",description:`${rName(assignTarget)} assigned to ${proj?.name}.`});
      setAssignTarget(null);fetchAll();
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setSaving(false);}
  };

  const handleRemove=async(id:string)=>{
    setMembers(prev=>prev.filter(m=>m.id!==id));
    await supabase.from("workforce_members").update({is_active:false}).eq("id",id);
    toast({title:"Member removed"});
  };

  const handleSendChangeRequest=async(form:any)=>{
    if(!changeTarget) return;setSaving(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error("Not authenticated");
      const {error}=await supabase.from("contract_change_requests").insert({organization_id:user.id,workforce_member_id:changeTarget.id,talent_id:changeTarget.profile_id,change_types:form.change_types,proposed_member_type:form.change_types.includes("member_type")?form.proposed_member_type:null,proposed_salary:form.change_types.includes("salary")&&form.proposed_salary?Number(form.proposed_salary):null,proposed_role_title:form.change_types.includes("role_title")?form.proposed_role_title:null,proposed_department:form.change_types.includes("department")?form.proposed_department:null,proposed_end_date:form.change_types.includes("end_date")?form.proposed_end_date:null,proposed_start_date:form.proposed_start_date||null,current_member_type:changeTarget.member_type,current_salary:changeTarget.payment_monthly,current_role_title:changeTarget.role_title,current_department:changeTarget.department,current_end_date:changeTarget.end_date,message:form.message,status:"pending"});
      if(error) throw error;
      if(changeTarget.profile_id) await supabase.from("notifications").insert({user_id:changeTarget.profile_id,title:"Contract change request 📋",message:"Your organisation has requested changes to your contract. Please review and respond from your dashboard.",type:"contract_change"});
      toast({title:"Change request sent ✓"});setChangeTarget(null);
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setSaving(false);}
  };

  const handleAvailabilityChange=async(id:string,status:AvailStatus)=>{
    setMembers(prev=>prev.map(m=>m.id===id?{...m,availability_status:status}:m));
    await supabase.from("workforce_members").update({availability_status:status}).eq("id",id);
    toast({title:"Availability updated"});
  };

  const depts=["All departments",...new Set(members.map(m=>m.department).filter(Boolean))];
  const expiringCount=members.filter(m=>{const d=daysUntil(m.end_date);return d!==null&&d<=7&&d>=0;}).length;
  const filtered=members.filter(m=>{
    if(activeTab!=="all"&&m.member_type!==activeTab) return false;
    const nm=rName(m).toLowerCase();
    if(search&&!(nm.includes(search.toLowerCase())||m.role_title?.toLowerCase().includes(search.toLowerCase())||rLocation(m)?.toLowerCase().includes(search.toLowerCase()))) return false;
    if(filterDept!=="All departments"&&m.department!==filterDept) return false;
    return true;
  });
  const counts={all:members.length,employee:members.filter(m=>m.member_type==="employee").length,hired_full_time:members.filter(m=>m.member_type==="hired_full_time").length,hired_contract:members.filter(m=>m.member_type==="hired_contract").length};

  if(loading) return <div className="w-full flex items-center justify-center py-32"><div className="flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 text-blue-500 animate-spin"/><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading workforce...</p></div></div>;
  if(error) return <div className="w-full flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-bold text-red-500">{error}</p><button onClick={fetchAll} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl"><RefreshCw className="w-3.5 h-3.5"/> Retry</button></div>;

  return(
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest"><Users className="w-3.5 h-3.5"/> Active Workforce</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">Your team.</h1>
          <p className="text-sm font-medium text-slate-400">{counts.employee} employees · {counts.hired_full_time} full-time · {counts.hired_contract} contractors</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-3 border border-[var(--border-color)] rounded-xl text-slate-400 hover:bg-slate-500/5 transition-all" title="Refresh"><RefreshCw className="w-4 h-4"/></button>
          <button onClick={()=>setShowAddModal(true)} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><UserPlus className="w-4 h-4"/> Add member</button>
        </div>
      </div>

      {expiringCount>0&&(<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20"><AlertTriangle className="w-5 h-5 text-amber-500 shrink-0"/><div><p className="text-xs font-black text-amber-600 uppercase tracking-widest">{expiringCount} contract{expiringCount>1?"s":""} expiring within 7 days</p><p className="text-[11px] font-medium text-slate-500 mt-0.5">Review highlighted cards and send a contract extension request.</p></div></motion.div>)}

      <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, role, or location..." className="w-full pl-10 pr-4 py-3 bg-slate-500/5 border border-[var(--border-color)] rounded-xl text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
          <button onClick={()=>setFiltersOpen(v=>!v)} className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filtersOpen?"bg-blue-600 text-white border-blue-600":"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}><SlidersHorizontal className="w-3.5 h-3.5"/> Filters</button>
        </div>
        <AnimatePresence>{filtersOpen&&(<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><div className="relative pt-1"><select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer">{depts.map(d=><option key={d}>{d}</option>)}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"/></div></motion.div>)}</AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(tab=>{const Icon=tab.icon;return(<button key={tab.key} onClick={()=>setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab===tab.key?"bg-[var(--card-bg)] text-blue-600 border-blue-500/30 shadow-sm":"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}><Icon className="w-3.5 h-3.5"/>{tab.label}<span className="text-[9px] opacity-60">{counts[tab.key as keyof typeof counts]}</span></button>);})}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:"Total",          value:counts.all},
          {label:"On projects",    value:members.filter(m=>m.projects.length>0).length},
          {label:"Unassigned",     value:members.filter(m=>m.projects.length===0).length},
          {label:"On leave",       value:members.filter(m=>m.availability_status==="on_leave").length},
        ].map(s=>(<div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p><p className="text-2xl font-black dark:text-white">{s.value}</p></div>))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length>0?(<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"><AnimatePresence>{filtered.map(m=><MemberCard key={m.id} member={m} onAssign={setAssignTarget} onView={setProfileTarget} onRemove={handleRemove}/>)}</AnimatePresence></motion.div>):(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-24 text-center space-y-4 bg-slate-500/5 rounded-2xl border border-dashed border-[var(--border-color)]">
            <Users className="w-12 h-12 text-slate-300 mx-auto"/>
            <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">{search?"No members match":"No workforce members yet"}</h3>
            <p className="text-sm text-slate-400">{search?"Try a different search":"Hire talents or add employees to get started"}</p>
            {!search&&<button onClick={()=>setShowAddModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><UserPlus className="w-3.5 h-3.5"/> Add member</button>}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{showAddModal&&<AddMemberModal onAdd={handleAddMember} onClose={()=>setShowAddModal(false)} saving={saving}/>}</AnimatePresence>
      <AnimatePresence>{assignTarget&&<AssignProjectModal member={assignTarget} projects={projects} navigate={navigate} onAssign={handleAssignProject} onClose={()=>setAssignTarget(null)} saving={saving}/>}</AnimatePresence>
      <AnimatePresence>{profileTarget&&<ProfileDrawer member={profileTarget} onClose={()=>setProfileTarget(null)} onRemove={handleRemove} onRequestChange={m=>{setProfileTarget(null);setChangeTarget(m);}} onAvailabilityChange={handleAvailabilityChange}/>}</AnimatePresence>
      <AnimatePresence>{changeTarget&&<ContractChangeModal member={changeTarget} onClose={()=>setChangeTarget(null)} onSend={handleSendChangeRequest} sending={saving}/>}</AnimatePresence>
    </div>
  );
}