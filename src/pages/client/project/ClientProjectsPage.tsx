"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderKanban, Plus, Search, ChevronDown, X, Loader2,
  RefreshCw, Calendar, DollarSign, Tag, Users, Eye,
  Pencil, Trash2, MoreHorizontal, CheckCircle2, AlertTriangle,
  Globe, Lock, ArrowUpRight, List, LayoutGrid, MapPin,
  UserPlus, Check, BarChart3,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string; organization_id: string; name: string;
  description: string | null; status: "active"|"on_hold"|"completed"|"cancelled";
  priority: "low"|"medium"|"high"|"critical";
  start_date: string|null; end_date: string|null;
  budget: number|null; budget_currency: string; budget_spent: number|null;
  tags: string[]; is_client_facing: boolean; progress: number;
  created_at: string; updated_at: string;
}

interface WorkforceMember {
  id: string; profile_id: string|null; full_name: string;
  avatar_url: string|null; role_title: string|null;
  location: string|null; member_type: string;
  availability_status: string|null; online_status: string;
  profile?: {full_name:string;avatar_url:string|null;location:string|null}|null;
}

interface ProjectMember {
  id: string; project_id: string; workforce_member_id: string;
  role_on_project: string|null; assigned_at: string;
  member?: WorkforceMember;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  active:    {label:"Active",    color:"text-emerald-600",bg:"bg-emerald-500/10 border-emerald-500/20",dot:"bg-emerald-500"},
  on_hold:   {label:"On hold",   color:"text-amber-600",  bg:"bg-amber-500/10 border-amber-500/20",    dot:"bg-amber-500"  },
  completed: {label:"Completed", color:"text-blue-600",   bg:"bg-blue-500/10 border-blue-500/20",      dot:"bg-blue-500"   },
  cancelled: {label:"Cancelled", color:"text-slate-500",  bg:"bg-slate-500/10 border-slate-500/20",    dot:"bg-slate-400"  },
};
const PRIORITY_CFG = {
  low:      {label:"Low",      color:"text-slate-500", bg:"bg-slate-500/10" },
  medium:   {label:"Medium",   color:"text-blue-600",  bg:"bg-blue-500/10"  },
  high:     {label:"High",     color:"text-amber-600", bg:"bg-amber-500/10" },
  critical: {label:"Critical", color:"text-red-500",   bg:"bg-red-500/10"   },
};
const ONLINE_DOT: Record<string,string> = {
  online:"bg-emerald-500", away:"bg-amber-500", offline:"bg-slate-400",
};
const TABS = ["all","active","on_hold","completed","cancelled"] as const;

function fmtDate(iso:string|null){if(!iso)return"—";return new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function fmtCurrency(a:number|null,c="USD"){if(!a)return"—";return new Intl.NumberFormat("en-US",{style:"currency",currency:c,maximumFractionDigits:0}).format(a);}
function daysUntil(iso:string|null){if(!iso)return null;return Math.ceil((new Date(iso).getTime()-Date.now())/(1000*60*60*24));}
function getInitials(n:string){return n?.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2)??"?";}
const rName   = (m:WorkforceMember) => m.profile?.full_name  ?? m.full_name;
const rAvatar = (m:WorkforceMember) => m.profile?.avatar_url ?? m.avatar_url ?? null;
const rLoc    = (m:WorkforceMember) => m.profile?.location   ?? m.location   ?? null;

// ─── Shared: Avatar ───────────────────────────────────────────────────────────
function Avatar({member,size="sm"}:{member:WorkforceMember;size?:"sm"|"md"|"lg"}){
  const [err,setErr]=useState(false);
  const avatar=rAvatar(member); const name=rName(member);
  const dot=ONLINE_DOT[member.online_status??"offline"]??"bg-slate-400";
  const sz=size==="lg"?"w-12 h-12 rounded-none":size==="md"?"w-10 h-10 rounded-none":"w-8 h-8 rounded-none";
  return(
    <div className="relative shrink-0">
      <div className={`${sz} bg-slate-500/10 border border-[var(--border-color)] overflow-hidden flex items-center justify-center`}>
        {avatar&&!err?<img src={avatar} alt={name} className="w-full h-full object-cover" onError={()=>setErr(true)}/>
                     :<span className="text-xs font-black text-slate-400 uppercase">{getInitials(name)}</span>}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-none border-2 border-[var(--card-bg)] ${dot}`}/>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({value,showLabel=true}:{value:number;showLabel?:boolean}){
  const color=value>=100?"bg-emerald-500":value>=60?"bg-blue-500":value>=30?"bg-amber-500":"bg-slate-400";
  return(
    <div className="space-y-1">
      {showLabel&&<div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</span><span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{value}%</span></div>}
      <div className="h-1.5 w-full bg-slate-500/10 rounded-none overflow-hidden"><div className={`h-full ${color} rounded-none transition-all duration-500`} style={{width:`${value}%`}}/></div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({title,message,confirmLabel="Delete",onConfirm,onCancel,danger=true}:{
  title:string;message:string;confirmLabel?:string;
  onConfirm:()=>void;onCancel:()=>void;danger?:boolean;
}){
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:16}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-sm bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-6 shadow-2xl">
          <div className={`w-10 h-10 rounded-none flex items-center justify-center mb-4 ${danger?"bg-red-500/10":"bg-amber-500/10"}`}>
            <Trash2 className={`w-5 h-5 ${danger?"text-red-500":"text-amber-500"}`}/>
          </div>
          <h3 className="text-base font-black dark:text-white tracking-tight mb-2">{title}</h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-none hover:bg-slate-500/5 transition-all">Cancel</button>
            <button onClick={onConfirm} className={`flex-1 py-3 text-white text-[10px] font-black uppercase tracking-widest rounded-none transition-all ${danger?"bg-red-500 hover:bg-red-400":"bg-amber-500 hover:bg-amber-400"}`}>{confirmLabel}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({tags,onAdd,onRemove}:{tags:string[];onAdd:(v:string)=>void;onRemove:(v:string)=>void;}){
  const [input,setInput]=useState("");
  const commit=()=>{const v=input.trim().replace(/,$/,"");if(v&&!tags.includes(v))onAdd(v);setInput("");};
  return(
    <div className="min-h-[44px] bg-slate-500/5 border border-[var(--border-color)] rounded-none px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 ring-blue-500/20 transition-all cursor-text"
      onClick={e=>(e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
      {tags.map(t=><span key={t} className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-none">{t}<button type="button" onClick={()=>onRemove(t)} className="hover:text-red-500 transition-colors"><X className="w-2.5 h-2.5"/></button></span>)}
      <input value={input} onChange={e=>setInput(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();commit();}}} onBlur={commit}
        placeholder={tags.length===0?"Add tags — press Enter":"Add more..."}
        className="flex-1 min-w-[100px] bg-transparent outline-none text-sm font-medium placeholder:text-slate-400"/>
    </div>
  );
}

// ─── Assign Talent Modal (matches Figma) ──────────────────────────────────────
function AssignTalentModal({project,allMembers,currentProjectMembers,onAssign,onRemove,onClose,saving}:{
  project:Project; allMembers:WorkforceMember[];
  currentProjectMembers:ProjectMember[];
  onAssign:(memberId:string,role:string)=>void;
  onRemove:(pmId:string,memberName:string)=>void;
  onClose:()=>void; saving:boolean;
}){
  const [search,setSearch]=useState("");
  const [roleInput,setRoleInput]=useState("");
  const [selected,setSelected]=useState<Set<string>>(new Set());
  const [confirmRemove,setConfirmRemove]=useState<{pmId:string;name:string}|null>(null);

  // Members already on this project
  const assignedIds=new Set(currentProjectMembers.map(pm=>pm.workforce_member_id));

  // Filter: skip unavailable, show available first then rest, apply search
  const filtered=useMemo(()=>{
    return allMembers
      .filter(m=>m.availability_status!=="unavailable")
      .filter(m=>{
        if(!search) return true;
        const q=search.toLowerCase();
        return rName(m).toLowerCase().includes(q)||
               m.role_title?.toLowerCase().includes(q)||
               rLoc(m)?.toLowerCase().includes(q);
      })
      .sort((a,b)=>{
        // Available first, then on_leave, then notice_period
        const order:Record<string,number>={available:0,on_leave:1,notice_period:2};
        return (order[a.availability_status??"available"]??3)-(order[b.availability_status??"available"]??3);
      });
  },[allMembers,search]);

  const toggleSelect=(id:string)=>{
    if(assignedIds.has(id)) return; // already on project — can't re-add
    setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  };

  const handleAssign=()=>{
    selected.forEach(id=>onAssign(id,roleInput));
    setSelected(new Set());
    setRoleInput("");
  };

  const AVAIL_BADGE:Record<string,string>={
    available:"bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    on_leave:"bg-amber-500/10 text-amber-600 border-amber-500/20",
    notice_period:"bg-red-500/10 text-red-500 border-red-500/20",
  };

  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-7 pt-7 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-black dark:text-white tracking-tight">Assign talent to project</h2>
                <p className="text-xs font-bold text-blue-600 mt-0.5 truncate">{project.name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-none hover:bg-slate-500/10 text-slate-400 transition-colors flex-shrink-0"><X className="w-4 h-4"/></button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search by name, role or location..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-500/5 border border-[var(--border-color)] rounded-none text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>
            </div>
          </div>

          {/* Member list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border-color)] px-2">
            {filtered.length===0?(
              <div className="py-10 text-center">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2"/>
                <p className="text-xs font-bold text-slate-400">No available members found</p>
              </div>
            ):filtered.map(m=>{
              const isAssigned=assignedIds.has(m.id);
              const isSelected=selected.has(m.id);
              const pm=currentProjectMembers.find(p=>p.workforce_member_id===m.id);
              const avail=m.availability_status??"available";
              const availBadge=AVAIL_BADGE[avail];

              return(
                <div key={m.id}
                  onClick={()=>isAssigned?null:toggleSelect(m.id)}
                  className={`flex items-center gap-3 px-3 py-3.5 transition-all ${isAssigned?"opacity-70":"cursor-pointer hover:bg-slate-500/5"} ${isSelected?"bg-blue-500/5":""}`}>
                  <Avatar member={m} size="md"/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black dark:text-white truncate">{rName(m)}</p>
                      {availBadge&&avail!=="available"&&(
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none border ${availBadge}`}>
                          {avail.replace("_"," ")}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 truncate">
                      {m.role_title||"—"} {rLoc(m)?`· ${rLoc(m)?.split(",")[0]}`:""}
                    </p>
                    {isAssigned&&pm?.role_on_project&&(
                      <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider mt-0.5">
                        Assigned as {pm.role_on_project}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {isAssigned?(
                      <button
                        onClick={e=>{e.stopPropagation();setConfirmRemove({pmId:pm!.id,name:rName(m)});}}
                        className="p-1.5 rounded-none hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    ):(
                      <div className={`w-5 h-5 rounded-none border-2 flex items-center justify-center transition-all ${isSelected?"bg-blue-600 border-blue-600":"border-slate-300 dark:border-slate-600"}`}>
                        {isSelected&&<Check className="w-3 h-3 text-white"/>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role input + assign button */}
          <div className="px-7 py-5 border-t border-[var(--border-color)] space-y-3">
            {selected.size>0&&(
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Role on project <span className="normal-case text-slate-400">(optional — applies to all selected)</span>
                </label>
                <input value={roleInput} onChange={e=>setRoleInput(e.target.value)}
                  placeholder="e.g. Lead Developer, Designer..."
                  className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>
              </div>
            )}
            <button onClick={handleAssign} disabled={selected.size===0||saving}
              className="w-full py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed">
              {saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<UserPlus className="w-3.5 h-3.5"/>}
              {selected.size>0?`Assign ${selected.size} member${selected.size>1?"s":""}...`:"Select members to assign"}
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Remove confirm */}
      {confirmRemove&&(
        <ConfirmDialog
          title={`Remove ${confirmRemove.name}?`}
          message={`${confirmRemove.name} will be unassigned from "${project.name}". They can be re-assigned later.`}
          confirmLabel="Remove"
          onConfirm={()=>{onRemove(confirmRemove.pmId,confirmRemove.name);setConfirmRemove(null);}}
          onCancel={()=>setConfirmRemove(null)}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Project Form Modal ───────────────────────────────────────────────────────
const DEFAULT_FORM={name:"",description:"",status:"active" as Project["status"],priority:"medium" as Project["priority"],start_date:"",end_date:"",budget:"",budget_currency:"USD",budget_spent:"",tags:[] as string[],is_client_facing:false,progress:0};

function ProjectFormModal({project,onClose,onSave,saving}:{project?:Project|null;onClose:()=>void;onSave:(f:any)=>void;saving:boolean;}){
  const isEdit=!!project;
  const [form,setForm]=useState(()=>project?{name:project.name,description:project.description??"",status:project.status,priority:project.priority,start_date:project.start_date??"",end_date:project.end_date??"",budget:project.budget?.toString()??"",budget_currency:project.budget_currency,budget_spent:project.budget_spent?.toString()??"",tags:project.tags??[],is_client_facing:project.is_client_facing,progress:project.progress}:{...DEFAULT_FORM});
  const upd=(k:string,v:any)=>setForm(p=>({...p,[k]:v}));
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-black dark:text-white tracking-tight">{isEdit?"Edit project":"Create project"}</h2>
              <button onClick={onClose} className="p-2 rounded-none hover:bg-slate-500/10 text-slate-400"><X className="w-4 h-4"/></button>
            </div>
            <p className="text-xs font-bold text-slate-400">{isEdit?"Update project details":"Fill in the details to create a new project"}</p>
          </div>
          <div className="px-8 pb-0 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Project name *</label>
              <input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Flowboard Mobile App"
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
              <textarea value={form.description} onChange={e=>upd("description",e.target.value)} rows={3} placeholder="What is this project about?"
                className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none p-4 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all resize-none"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Status</label>
                <div className="relative">
                  <select value={form.status} onChange={e=>upd("status",e.target.value)} className="w-full appearance-none bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 cursor-pointer">
                    {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Priority</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(PRIORITY_CFG).map(([k,v])=><button key={k} type="button" onClick={()=>upd("priority",k)} className={`py-2 rounded-none text-[10px] font-black uppercase tracking-wider transition-all border ${form.priority===k?`${v.bg} ${v.color} border-current`:"border-[var(--border-color)] text-slate-400 hover:bg-slate-500/5"}`}>{v.label}</button>)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start date</label><input type="date" value={form.start_date} onChange={e=>upd("start_date",e.target.value)} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">End date</label><input type="date" value={form.end_date} onChange={e=>upd("end_date",e.target.value)} className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"><DollarSign className="inline w-3 h-3 mr-0.5"/>Total budget</label><input value={form.budget} onChange={e=>upd("budget",e.target.value)} type="number" placeholder="e.g. 50000" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
              <div><label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Budget spent</label><input value={form.budget_spent} onChange={e=>upd("budget_spent",e.target.value)} type="number" placeholder="e.g. 12000" className="w-full bg-slate-500/5 border border-[var(--border-color)] rounded-none px-4 py-3 text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</label><span className="text-sm font-black dark:text-white">{form.progress}%</span></div>
              <input type="range" min={0} max={100} step={5} value={form.progress} onChange={e=>upd("progress",Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer"/>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"><Tag className="inline w-3 h-3 mr-0.5"/>Tags</label>
              <TagInput tags={form.tags} onAdd={v=>upd("tags",[...form.tags,v])} onRemove={v=>upd("tags",form.tags.filter((t:string)=>t!==v))}/>
            </div>
            <div className="flex items-center justify-between p-4 rounded-none bg-slate-500/5 border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                {form.is_client_facing?<Globe className="w-4 h-4 text-blue-500"/>:<Lock className="w-4 h-4 text-slate-400"/>}
                <div><p className="text-sm font-black dark:text-white">Client-facing</p><p className="text-[10px] font-medium text-slate-400 mt-0.5">{form.is_client_facing?"Visible to assigned members":"Internal only"}</p></div>
              </div>
              <button type="button" onClick={()=>upd("is_client_facing",!form.is_client_facing)}
                className={`w-12 h-6 rounded-none transition-all relative ${form.is_client_facing?"bg-blue-600":"bg-slate-300 dark:bg-slate-600"}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-none bg-white shadow-sm transition-all ${form.is_client_facing?"left-6":"left-0.5"}`}/>
              </button>
            </div>
          </div>
          <div className="px-8 py-6 flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-slate-500 rounded-none hover:bg-slate-500/5 transition-all">Cancel</button>
            <button onClick={()=>onSave(form)} disabled={!form.name.trim()||saving} className="flex-1 py-3.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-40">
              {saving?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<CheckCircle2 className="w-3.5 h-3.5"/>}{isEdit?"Save changes":"Create project"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({project,projectMembers,allMembers,onView,onEdit,onDelete,onAssign}:{
  project:Project; projectMembers:ProjectMember[]; allMembers:WorkforceMember[];
  onView:(p:Project)=>void; onEdit:(p:Project)=>void;
  onDelete:(id:string,name:string)=>void; onAssign:(p:Project)=>void;
}){
  const [menuOpen,setMenuOpen]=useState(false);
  const [confirmId,setConfirmId]=useState<string|null>(null);
  const sc=STATUS_CFG[project.status]; const pc=PRIORITY_CFG[project.priority];
  const daysLeft=daysUntil(project.end_date);
  const overdue=daysLeft!==null&&daysLeft<0;
  const nearDeadline=daysLeft!==null&&daysLeft>=0&&daysLeft<=7;

  // Resolve members for this project
  const assignedMembers=projectMembers
    .map(pm=>allMembers.find(m=>m.id===pm.workforce_member_id))
    .filter(Boolean) as WorkforceMember[];

  return(
    <motion.div layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}}
      className={`p-5 rounded-none bg-[var(--card-bg)] border shadow-sm flex flex-col gap-4 hover:border-blue-500/30 transition-all relative group cursor-pointer ${overdue?"border-red-500/30":nearDeadline?"border-amber-500/30":"border-[var(--border-color)]"}`}
      onClick={()=>onView(project)}>

      {/* Kebab */}
      <div className="absolute top-4 right-4 z-10" onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setMenuOpen(v=>!v)} className="p-1.5 rounded-none text-slate-400 hover:bg-slate-500/10 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal className="w-4 h-4"/></button>
        <AnimatePresence>{menuOpen&&(<motion.div initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}} className="absolute right-0 top-8 w-44 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none shadow-xl overflow-hidden z-30">
          <button onClick={()=>{onView(project);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold hover:bg-slate-500/5 transition-colors"><Eye className="w-3.5 h-3.5"/> View details</button>
          <button onClick={()=>{onEdit(project);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold hover:bg-slate-500/5 transition-colors"><Pencil className="w-3.5 h-3.5"/> Edit</button>
          <button onClick={()=>{onAssign(project);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-500/5 transition-colors"><UserPlus className="w-3.5 h-3.5"/> Assign talent</button>
          <div className="h-px bg-[var(--border-color)] mx-2"/>
          <button onClick={()=>{setConfirmId(project.id);setMenuOpen(false);}} className="flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"><Trash2 className="w-3.5 h-3.5"/> Delete</button>
        </motion.div>)}</AnimatePresence>
      </div>

      {/* Status + priority */}
      <div className="flex items-center gap-2 flex-wrap pr-8">
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-none border ${sc.bg} ${sc.color}`}><span className={`w-1.5 h-1.5 rounded-none ${sc.dot}`}/>{sc.label}</span>
        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-none ${pc.bg} ${pc.color}`}>{pc.label}</span>
        {project.is_client_facing&&<Globe className="w-3.5 h-3.5 text-blue-400"/>}
      </div>

      {/* Name */}
      <div>
        <h3 className="text-base font-black dark:text-white tracking-tight leading-snug mb-1">{project.name}</h3>
        {project.description&&<p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{project.description}</p>}
      </div>

      {/* Progress */}
      <ProgressBar value={project.progress}/>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {project.end_date&&<span className={`flex items-center gap-1 text-[11px] font-bold ${overdue?"text-red-500":nearDeadline?"text-amber-600":"text-slate-400"}`}><Calendar className="w-3 h-3"/>{overdue?`Overdue ${Math.abs(daysLeft!)}d`:nearDeadline?`Due in ${daysLeft}d`:fmtDate(project.end_date)}</span>}
        {project.budget&&<span className="flex items-center gap-1 text-[11px] font-bold text-slate-400"><DollarSign className="w-3 h-3"/>{fmtCurrency(project.budget,project.budget_currency)}</span>}
      </div>

      {/* Tags */}
      {project.tags?.length>0&&<div className="flex flex-wrap gap-1.5">{project.tags.slice(0,3).map(t=><span key={t} className="text-[9px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-none">{t}</span>)}{project.tags.length>3&&<span className="text-[9px] font-black text-slate-400">+{project.tags.length-3}</span>}</div>}

      {/* Footer: team avatars + assign button */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]" onClick={e=>e.stopPropagation()}>
        <div className="flex -space-x-2">
          {assignedMembers.slice(0,5).map(m=>(
            <div key={m.id} className="w-7 h-7 rounded-none bg-slate-500/10 border-2 border-[var(--card-bg)] overflow-hidden flex items-center justify-center">
              {rAvatar(m)?<img src={rAvatar(m)!} alt={rName(m)} className="w-full h-full object-cover"/>:<span className="text-[8px] font-black text-slate-400">{getInitials(rName(m))}</span>}
            </div>
          ))}
          {assignedMembers.length>5&&<div className="w-7 h-7 rounded-none bg-slate-500/20 border-2 border-[var(--card-bg)] flex items-center justify-center"><span className="text-[8px] font-black text-slate-500">+{assignedMembers.length-5}</span></div>}
        </div>
        <button onClick={e=>{e.stopPropagation();onAssign(project);}}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all shadow-sm shadow-blue-600/20">
          <UserPlus className="w-3 h-3"/> Assign
        </button>
      </div>

      {confirmId&&<ConfirmDialog title={`Delete "${project.name}"?`} message="This project will be permanently deleted and all members unassigned. This cannot be undone." onConfirm={()=>{onDelete(confirmId,project.name);setConfirmId(null);}} onCancel={()=>setConfirmId(null)}/>}
    </motion.div>
  );
}

// ─── Project Drawer ───────────────────────────────────────────────────────────
function ProjectDrawer({project,projectMembers,allMembers,onClose,onEdit,onDelete,onAssign,onRemoveMember,onProgressUpdate}:{
  project:Project; projectMembers:ProjectMember[]; allMembers:WorkforceMember[];
  onClose:()=>void; onEdit:(p:Project)=>void; onDelete:(id:string,name:string)=>void;
  onAssign:(p:Project)=>void; onRemoveMember:(pmId:string,name:string)=>void;
  onProgressUpdate:(id:string,v:number)=>void;
}){
  const [tab,setTab]=useState<"overview"|"team"|"timeline">("overview");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [localProgress,setLocalProgress]=useState(project.progress);
  const sc=STATUS_CFG[project.status]; const pc=PRIORITY_CFG[project.priority];
  const daysLeft=daysUntil(project.end_date);
  const overdue=daysLeft!==null&&daysLeft<0;
  const nearDeadline=daysLeft!==null&&daysLeft>=0&&daysLeft<=7;
  const budgetPct=project.budget&&project.budget_spent?Math.min(Math.round((project.budget_spent/project.budget)*100),100):0;

  const assignedMembers=projectMembers
    .map(pm=>{const m=allMembers.find(x=>x.id===pm.workforce_member_id);return m?{...m,pmId:pm.id,role_on_project:pm.role_on_project}:null;})
    .filter(Boolean) as (WorkforceMember&{pmId:string;role_on_project:string|null})[];

  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"/>
      <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:280}}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--card-bg)] border-l border-[var(--border-color)] z-50 flex flex-col shadow-2xl">
        {/* Sticky header */}
        <div className="shrink-0 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--card-bg)]">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-0.5">Project details</p>
              <h2 className="text-lg font-black dark:text-white tracking-tight leading-tight truncate">{project.name}</h2>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={()=>onAssign(project)} className="p-2 rounded-none hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 transition-colors" title="Assign talent"><UserPlus className="w-4 h-4"/></button>
              <button onClick={()=>onEdit(project)} className="p-2 rounded-none hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>setConfirmDelete(true)} className="p-2 rounded-none hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
              <button onClick={onClose} className="p-2 rounded-none hover:bg-slate-500/10 text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-none border ${sc.bg} ${sc.color}`}><span className={`w-1.5 h-1.5 rounded-none ${sc.dot}`}/>{sc.label}</span>
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-none ${pc.bg} ${pc.color}`}>{pc.label}</span>
            {project.is_client_facing?<span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-500/10 px-2 py-1 rounded-none"><Globe className="w-3 h-3"/>Client-facing</span>:<span className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-500/10 px-2 py-1 rounded-none"><Lock className="w-3 h-3"/>Internal</span>}
          </div>
        </div>

        {/* Deadline warning */}
        {(overdue||nearDeadline)&&<div className={`shrink-0 flex items-center gap-2 px-6 py-3 border-b ${overdue?"bg-red-500/5 border-red-500/20":"bg-amber-500/5 border-amber-500/20"}`}><AlertTriangle className={`w-4 h-4 shrink-0 ${overdue?"text-red-500":"text-amber-500"}`}/><p className={`text-[11px] font-black ${overdue?"text-red-500":"text-amber-600"}`}>{overdue?`Overdue by ${Math.abs(daysLeft!)} day${Math.abs(daysLeft!)!==1?"s":""}` :`Deadline in ${daysLeft} day${daysLeft!==1?"s":""}`}</p></div>}

        {/* Tabs */}
        <div className="shrink-0 flex gap-1 px-6 py-3 border-b border-[var(--border-color)]">
          {[{key:"overview",label:"Overview",icon:BarChart3},{key:"team",label:`Team (${assignedMembers.length})`,icon:Users},{key:"timeline",label:"Timeline",icon:Calendar}].map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key as any)} className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-[11px] font-black uppercase tracking-widest transition-all border ${tab===t.key?"bg-[var(--card-bg)] text-blue-600 border-blue-500/20 shadow-sm":"border-transparent text-slate-400 hover:text-slate-600"}`}><t.icon className="w-3.5 h-3.5"/>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab==="overview"&&(<>
            {project.description&&<div className="bg-slate-500/5 rounded-none p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p><p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{project.description}</p></div>}
            <div className="bg-slate-500/5 rounded-none p-4">
              <div className="flex items-center justify-between mb-3"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Progress</p><span className="text-sm font-black dark:text-white">{localProgress}%</span></div>
              <input type="range" min={0} max={100} step={5} value={localProgress} onChange={e=>setLocalProgress(Number(e.target.value))} onMouseUp={()=>onProgressUpdate(project.id,localProgress)} onTouchEnd={()=>onProgressUpdate(project.id,localProgress)} className="w-full accent-blue-600 cursor-pointer mb-2"/>
              <div className="h-2 w-full bg-slate-500/10 rounded-none overflow-hidden"><div className={`h-full rounded-none transition-all duration-500 ${localProgress>=100?"bg-emerald-500":localProgress>=60?"bg-blue-500":"bg-amber-500"}`} style={{width:`${localProgress}%`}}/></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{label:"Start date",value:fmtDate(project.start_date)},{label:"End date",value:fmtDate(project.end_date)},{label:"Team size",value:`${assignedMembers.length} member${assignedMembers.length!==1?"s":""}`},{label:"Created",value:fmtDate(project.created_at)}].map(m=>(
                <div key={m.label} className="bg-slate-500/5 rounded-none p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p><p className="text-sm font-black dark:text-white">{m.value}</p></div>
              ))}
            </div>
            {project.budget&&<div className="bg-slate-500/5 rounded-none p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Budget</p>
              <div className="flex items-end justify-between mb-2"><div><p className="text-xl font-black dark:text-white">{fmtCurrency(project.budget_spent,project.budget_currency)}</p><p className="text-[10px] font-bold text-slate-400">of {fmtCurrency(project.budget,project.budget_currency)}</p></div><span className={`text-sm font-black ${budgetPct>=90?"text-red-500":budgetPct>=70?"text-amber-600":"text-emerald-600"}`}>{budgetPct}%</span></div>
              <div className="h-2 w-full bg-slate-500/10 rounded-none overflow-hidden"><div className={`h-full rounded-none ${budgetPct>=90?"bg-red-500":budgetPct>=70?"bg-amber-500":"bg-emerald-500"}`} style={{width:`${budgetPct}%`}}/></div>
            </div>}
            {project.tags?.length>0&&<div className="bg-slate-500/5 rounded-none p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Tags</p><div className="flex flex-wrap gap-2">{project.tags.map(t=><span key={t} className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/10 px-2 py-0.5 rounded-none">{t}</span>)}</div></div>}
          </>)}

          {tab==="team"&&(
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{assignedMembers.length} member{assignedMembers.length!==1?"s":""} assigned</p>
                <button onClick={()=>onAssign(project)} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all shadow-sm shadow-blue-600/20">
                  <UserPlus className="w-3 h-3"/> Assign
                </button>
              </div>
              {assignedMembers.length===0?(
                <div className="py-12 text-center space-y-3 bg-slate-500/5 rounded-none border border-dashed border-[var(--border-color)]"><Users className="w-10 h-10 text-slate-300 mx-auto"/><p className="text-sm font-black dark:text-white">No members assigned yet</p><p className="text-xs text-slate-400">Click "Assign" to add team members</p></div>
              ):assignedMembers.map(m=>(
                <div key={m.id} className="flex items-center gap-3 p-4 rounded-none bg-slate-500/5 border border-[var(--border-color)]">
                  <Avatar member={m} size="md"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black dark:text-white truncate">{rName(m)}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{m.role_on_project??m.role_title??"—"}</p>
                  </div>
                  <button onClick={()=>onRemoveMember(m.pmId,rName(m))}
                    className="p-1.5 rounded-none hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Remove from project">
                    <X className="w-3.5 h-3.5"/>
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab==="timeline"&&(
            project.start_date&&project.end_date?(
              <div className="space-y-4">
                <div className="bg-slate-500/5 rounded-none p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Start</p><p className="text-sm font-black dark:text-white">{fmtDate(project.start_date)}</p></div>
                    <div className="text-center"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">End</p><p className={`text-sm font-black ${overdue?"text-red-500":nearDeadline?"text-amber-600":"dark:text-white"}`}>{fmtDate(project.end_date)}</p></div>
                  </div>
                  <div className="h-3 w-full bg-slate-500/10 rounded-none overflow-hidden"><div className={`h-full rounded-none transition-all ${localProgress>=100?"bg-emerald-500":"bg-blue-500"}`} style={{width:`${localProgress}%`}}/></div>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 text-center">{localProgress}% complete</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{label:"Duration",value:(()=>{const d=Math.ceil((new Date(project.end_date).getTime()-new Date(project.start_date).getTime())/(1000*60*60*24));return`${d} day${d!==1?"s":""}`;})()},{label:daysLeft!==null&&daysLeft<0?"Overdue by":"Days remaining",value:daysLeft!==null?`${Math.abs(daysLeft)} day${Math.abs(daysLeft)!==1?"s":""}` :"—"}].map(m=>(
                    <div key={m.label} className="bg-slate-500/5 rounded-none p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p><p className={`text-sm font-black ${m.label.includes("Overdue")?"text-red-500":"dark:text-white"}`}>{m.value}</p></div>
                  ))}
                </div>
              </div>
            ):(
              <div className="py-12 text-center space-y-3 bg-slate-500/5 rounded-none border border-dashed border-[var(--border-color)]"><Calendar className="w-10 h-10 text-slate-300 mx-auto"/><p className="text-sm font-black dark:text-white">No dates set</p><p className="text-xs text-slate-400">Edit the project to add start and end dates</p></div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-[var(--border-color)] bg-[var(--card-bg)] flex gap-2">
          <button onClick={()=>onAssign(project)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><UserPlus className="w-3.5 h-3.5"/> Assign talent</button>
          <button onClick={()=>onEdit(project)} className="px-4 py-3 bg-slate-500/10 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-slate-500/20 transition-all flex items-center gap-2"><Pencil className="w-3.5 h-3.5"/>Edit</button>
        </div>
      </motion.div>

      {confirmDelete&&<ConfirmDialog title={`Delete "${project.name}"?`} message="This project will be permanently deleted and all members unassigned. This cannot be undone." onConfirm={()=>{onDelete(project.id,project.name);setConfirmDelete(false);onClose();}} onCancel={()=>setConfirmDelete(false)}/>}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientProjectsPage(){
  const {toast}=useToast();
  const [projects,setProjects]=useState<Project[]>([]);
  const [members,setMembers]=useState<WorkforceMember[]>([]);
  const [projectMembers,setProjectMembers]=useState<ProjectMember[]>([]); // junction
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [activeTab,setActiveTab]=useState<string>("all");
  const [search,setSearch]=useState("");
  const [viewProject,setViewProject]=useState<Project|null>(null);
  const [editProject,setEditProject]=useState<Project|null|"new">(null);
  const [assignProject,setAssignProject]=useState<Project|null>(null);
  const [saving,setSaving]=useState(false);
  const [viewMode,setViewMode]=useState<"grid"|"list">("grid");
  const [confirmRemovePm,setConfirmRemovePm]=useState<{pmId:string;name:string;projectName:string}|null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchAll=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const {data:{user},error:authErr}=await supabase.auth.getUser();
      if(authErr||!user) throw new Error("Not authenticated");

      const [{data:projData,error:pErr},{data:membersData,error:mErr},{data:pmData,error:pmErr}]=await Promise.all([
        supabase.from("projects").select("*").eq("organization_id",user.id).order("created_at",{ascending:false}),
        supabase.from("workforce_members").select("*").eq("organization_id",user.id).eq("is_active",true),
        supabase.from("project_members").select("*").eq("organization_id",user.id),
      ]);
      if(pErr) throw pErr; if(mErr) throw mErr; if(pmErr) throw pmErr;

      // Enrich members with profile
      const profileIds=(membersData??[]).map((m:any)=>m.profile_id).filter(Boolean);
      let profileMap:Record<string,any>={};
      if(profileIds.length>0){
        const {data:pData}=await supabase.from("profiles").select("id,full_name,avatar_url,location").in("id",profileIds);
        if(pData) profileMap=Object.fromEntries(pData.map((p:any)=>[p.id,p]));
      }
      const enriched=(membersData??[]).map((m:any)=>({...m,profile:m.profile_id?profileMap[m.profile_id]??null:null}));

      setProjects(projData??[]);
      setMembers(enriched as WorkforceMember[]);
      setProjectMembers(pmData??[]);
    }catch(err:any){setError(err.message??"Could not load projects.");}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{
    const ch=supabase.channel("projects-rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"projects"},fetchAll)
      .on("postgres_changes",{event:"*",schema:"public",table:"project_members"},fetchAll)
      .subscribe();
    return()=>{supabase.removeChannel(ch);};
  },[fetchAll]);

  // ── Save project ──────────────────────────────────────────────────────────
  const handleSave=async(form:any)=>{
    setSaving(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error("Not authenticated");
      const payload={organization_id:user.id,name:form.name,description:form.description||null,status:form.status,priority:form.priority,start_date:form.start_date||null,end_date:form.end_date||null,budget:form.budget?Number(form.budget):null,budget_spent:form.budget_spent?Number(form.budget_spent):null,budget_currency:form.budget_currency,tags:form.tags??[],is_client_facing:form.is_client_facing,progress:form.progress};
      if(editProject&&editProject!=="new"){
        const {error}=await supabase.from("projects").update(payload).eq("id",(editProject as Project).id);
        if(error) throw error;
        toast({title:"Project updated ✓"});
      }else{
        const {error}=await supabase.from("projects").insert(payload);
        if(error) throw error;
        toast({title:"Project created ✓",description:`${form.name} is ready.`});
      }
      setEditProject(null);fetchAll();
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setSaving(false);}
  };

  // ── Delete project ────────────────────────────────────────────────────────
  const handleDelete=async(id:string,name:string)=>{
    await supabase.from("project_members").delete().eq("project_id",id);
    await supabase.from("projects").delete().eq("id",id);
    setProjects(prev=>prev.filter(p=>p.id!==id));
    setProjectMembers(prev=>prev.filter(pm=>pm.project_id!==id));
    toast({title:`"${name}" deleted`});
  };

  // ── Assign member to project ──────────────────────────────────────────────
  const handleAssignMember=async(memberId:string,role:string)=>{
    if(!assignProject) return;
    setSaving(true);
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user) throw new Error("Not authenticated");
      const {error}=await supabase.from("project_members").upsert({
        project_id:assignProject.id, workforce_member_id:memberId,
        organization_id:user.id, role_on_project:role||null,
      },{onConflict:"project_id,workforce_member_id"});
      if(error) throw error;

      // Notify the talent
      const member=members.find(m=>m.id===memberId);
      if(member?.profile_id){
        await supabase.from("notifications").insert({
          user_id:member.profile_id,
          title:"You've been assigned to a project! 📁",
          message:`You have been assigned to "${assignProject.name}"${role?` as ${role}`:""}. Check your Flowboard dashboard.`,
          type:"project_assigned",
        });
      }
      toast({title:"Member assigned ✓"});
      fetchAll();
    }catch(err:any){toast({variant:"destructive",title:"Error",description:err.message});}
    finally{setSaving(false);}
  };

  // ── Remove member from project (with confirm) ─────────────────────────────
  const handleRemoveMember=async(pmId:string,memberName:string)=>{
    // If called directly (from drawer X button), show confirmation
    const project=viewProject??assignProject;
    setConfirmRemovePm({pmId,name:memberName,projectName:project?.name??""});
  };

  const confirmDoRemove=async()=>{
    if(!confirmRemovePm) return;
    await supabase.from("project_members").delete().eq("id",confirmRemovePm.pmId);
    setProjectMembers(prev=>prev.filter(pm=>pm.id!==confirmRemovePm.pmId));
    toast({title:`${confirmRemovePm.name} removed from project`});
    setConfirmRemovePm(null);
  };

  // ── Progress ──────────────────────────────────────────────────────────────
  const handleProgressUpdate=async(id:string,progress:number)=>{
    setProjects(prev=>prev.map(p=>p.id===id?{...p,progress}:p));
    await supabase.from("projects").update({progress}).eq("id",id);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered=projects.filter(p=>{
    if(activeTab!=="all"&&p.status!==activeTab) return false;
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!p.description?.toLowerCase().includes(search.toLowerCase())&&!p.tags?.some(t=>t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });
  const counts={all:projects.length,active:projects.filter(p=>p.status==="active").length,on_hold:projects.filter(p=>p.status==="on_hold").length,completed:projects.filter(p=>p.status==="completed").length,cancelled:projects.filter(p=>p.status==="cancelled").length};
  const overdueCount=projects.filter(p=>{const d=daysUntil(p.end_date);return d!==null&&d<0&&p.status==="active";}).length;

  // Get project members for a specific project
  const getPM=(projectId:string)=>projectMembers.filter(pm=>pm.project_id===projectId);

  if(loading) return <div className="w-full flex items-center justify-center py-32"><div className="flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 text-blue-500 animate-spin"/><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading projects...</p></div></div>;
  if(error) return <div className="w-full flex flex-col items-center justify-center py-32 gap-4"><p className="text-sm font-bold text-red-500">{error}</p><button onClick={fetchAll} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none"><RefreshCw className="w-3.5 h-3.5"/> Retry</button></div>;

  return(
    <div className="w-full space-y-6 pb-20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-widest"><FolderKanban className="w-3.5 h-3.5"/> Projects</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">Your <span className="text-blue-600">projects.</span></h1>
          <p className="text-sm font-medium text-slate-400">{counts.active} active · {counts.completed} completed · {projectMembers.length} assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-3 border border-[var(--border-color)] rounded-none text-slate-400 hover:bg-slate-500/5 transition-all" title="Refresh"><RefreshCw className="w-4 h-4"/></button>
          <div className="flex items-center bg-slate-500/5 border border-[var(--border-color)] rounded-none p-1">
            <button onClick={()=>setViewMode("grid")} className={`p-2 rounded-none transition-all ${viewMode==="grid"?"bg-[var(--card-bg)] text-blue-600 shadow-sm":"text-slate-400"}`}><LayoutGrid className="w-4 h-4"/></button>
            <button onClick={()=>setViewMode("list")} className={`p-2 rounded-none transition-all ${viewMode==="list"?"bg-[var(--card-bg)] text-blue-600 shadow-sm":"text-slate-400"}`}><List className="w-4 h-4"/></button>
          </div>
          <button onClick={()=>setEditProject("new")} className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><Plus className="w-4 h-4"/> Create project</button>
        </div>
      </div>

      {overdueCount>0&&<motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} className="flex items-center gap-3 p-4 rounded-none bg-red-500/5 border border-red-500/20"><AlertTriangle className="w-5 h-5 text-red-500 shrink-0"/><div><p className="text-xs font-black text-red-500 uppercase tracking-widest">{overdueCount} project{overdueCount>1?"s":""} overdue</p><p className="text-[11px] font-medium text-slate-500 mt-0.5">Update progress or extend the end date.</p></div></motion.div>}

      <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects by name, description or tag..." className="w-full pl-10 pr-4 py-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none text-sm font-medium outline-none focus:ring-2 ring-blue-500/20 transition-all"/></div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-none text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab===tab?"bg-[var(--card-bg)] text-blue-600 border-blue-500/20 shadow-sm":"border-transparent text-slate-400 hover:text-slate-600"}`}>{tab!=="all"&&<span className={`w-1.5 h-1.5 rounded-none ${STATUS_CFG[tab as keyof typeof STATUS_CFG]?.dot??"bg-slate-400"}`}/>}{tab==="all"?"All":STATUS_CFG[tab as keyof typeof STATUS_CFG]?.label??tab}<span className="text-[9px] opacity-60">{counts[tab as keyof typeof counts]??projects.length}</span></button>)}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{label:"Total",value:counts.all,color:"text-slate-600 dark:text-white"},{label:"Active",value:counts.active,color:"text-emerald-600"},{label:"Completed",value:counts.completed,color:"text-blue-600"},{label:"Avg progress",value:projects.length>0?`${Math.round(projects.reduce((a,p)=>a+p.progress,0)/projects.length)}%`:"—",color:"text-amber-600"}].map(s=><div key={s.label} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-none p-4"><p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p><p className={`text-2xl font-black ${s.color}`}>{s.value}</p></div>)}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length>0?(
          <motion.div layout className={viewMode==="grid"?"grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5":"flex flex-col gap-3"}>
            <AnimatePresence>
              {filtered.map(p=>viewMode==="grid"?(
                <ProjectCard key={p.id} project={p} projectMembers={getPM(p.id)} allMembers={members}
                  onView={setViewProject} onEdit={setEditProject} onDelete={handleDelete} onAssign={setAssignProject}/>
              ):(
                <motion.div key={p.id} layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.97}}
                  onClick={()=>setViewProject(p)}
                  className="flex items-center gap-4 p-4 rounded-none bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-blue-500/30 transition-all cursor-pointer group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-none shrink-0 ${STATUS_CFG[p.status].dot}`}/><h3 className="text-sm font-black dark:text-white truncate">{p.name}</h3></div>
                    <p className="text-[10px] font-bold text-slate-400 truncate">{p.description??"No description"}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 shrink-0">
                    <div className="w-24"><ProgressBar value={p.progress} showLabel={false}/></div>
                    <span className="text-[10px] font-black text-slate-400 w-8 text-right">{p.progress}%</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Users className="w-3 h-3"/>{getPM(p.id).length}</span>
                    {p.end_date&&<span className="text-[10px] font-bold text-slate-400 w-24 text-right">{fmtDate(p.end_date)}</span>}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ):(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="py-24 text-center space-y-4 bg-slate-500/5 rounded-none border border-dashed border-[var(--border-color)]">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto"/>
            <h3 className="text-xl font-black tracking-tighter uppercase dark:text-white">{search?"No projects match":"No projects yet"}</h3>
            <p className="text-sm text-slate-400">{search?"Try a different search":"Create your first project to start assigning your team"}</p>
            {!search&&<button onClick={()=>setEditProject("new")} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-none hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20"><Plus className="w-3.5 h-3.5"/> Create project</button>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {viewProject&&<ProjectDrawer project={viewProject} projectMembers={getPM(viewProject.id)} allMembers={members} onClose={()=>setViewProject(null)} onEdit={p=>{setViewProject(null);setEditProject(p);}} onDelete={handleDelete} onAssign={p=>{setViewProject(null);setAssignProject(p);}} onRemoveMember={handleRemoveMember} onProgressUpdate={handleProgressUpdate}/>}
      </AnimatePresence>
      <AnimatePresence>
        {editProject!==null&&<ProjectFormModal project={editProject==="new"?null:editProject as Project} onClose={()=>setEditProject(null)} onSave={handleSave} saving={saving}/>}
      </AnimatePresence>
      <AnimatePresence>
        {assignProject&&<AssignTalentModal project={assignProject} allMembers={members} currentProjectMembers={getPM(assignProject.id)} onAssign={handleAssignMember} onRemove={handleRemoveMember} onClose={()=>setAssignProject(null)} saving={saving}/>}
      </AnimatePresence>

      {/* Global remove confirmation */}
      <AnimatePresence>
        {confirmRemovePm&&<ConfirmDialog title={`Remove ${confirmRemovePm.name}?`} message={`${confirmRemovePm.name} will be unassigned from "${confirmRemovePm.projectName}". They can be re-assigned later.`} confirmLabel="Remove" onConfirm={confirmDoRemove} onCancel={()=>setConfirmRemovePm(null)}/>}
      </AnimatePresence>
    </div>
  );
}