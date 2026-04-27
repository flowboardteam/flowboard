import { useState, useMemo, useEffect } from "react";
import { useGroups, Group } from "@/contexts/GroupContext";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Search, 
  Plus, 
  Info, 
  X, 
  MoreVertical, 
  CheckCircle2, 
  ExternalLink,
  Users as UsersIcon,
  Briefcase,
  Lock,
  Unlock,
  Archive,
  Trash2,
  RefreshCw,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function GroupsPage() {
  const { groups, createGroup, setPrimaryGroup, updateGroup, loading } = useGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get("create") === "true");
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedGroupDetails, setSelectedGroupDetails] = useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupAvatar, setEditGroupAvatar] = useState("");
  const [editGroupBio, setEditGroupBio] = useState("");
  const [createStep, setCreateStep] = useState(1);
  const [settingsType, setSettingsType] = useState<"manual" | "replicate">("manual");
  const [replicateFromGroupId, setReplicateFromGroupId] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser(profile || user);
        setSelectedAdmins([user.id]);
      }
    }
    getUser();
  }, []);

  const availableAdmins = useMemo(() => {
    const base = [
      { id: "ADM-1", name: "George Aleesu", email: "george@flowboard.com" },
      { id: "ADM-2", name: "Sarah Jenkins", email: "sarah@flowboard.com" },
      { id: "ADM-3", name: "Michael Kojo", email: "michael@flowboard.com" }
    ];
    if (currentUser) {
      // Deduplicate
      if (base.some(b => b.id === currentUser.id)) return base;
      return [
        { 
          id: currentUser.id, 
          name: currentUser.full_name || "Account Owner", 
          email: currentUser.email || "" 
        },
        ...base
      ];
    }
    return base;
  }, [currentUser]);
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    searchParams.delete("create");
    setSearchParams(searchParams);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsSubmitting(true);
    try {
      await createGroup(newGroupName);
      toast.success("Organization created successfully");
      setNewGroupName("");
      closeCreateModal();
    } catch (err) {
      toast.error("Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [groups, searchTerm]);

  if (selectedGroupDetails) {
    return (
      <div className="space-y-8 pb-20 animate-in fade-in duration-500 font-sans text-[#1A1C21]">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedGroupDetails(null)} 
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 px-0"
        >
          ← Back to groups
        </Button>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight">{selectedGroupDetails.name}</h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b border-slate-100">
          <button className="pb-4 px-1 text-sm font-bold text-slate-900 border-b-2 border-emerald-500">Group details</button>
          <button className="pb-4 px-1 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Admins (1)</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Group details</span>
              <Button variant="ghost" className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl">Edit</Button>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500">Group name</span>
              <span className="text-xs font-bold text-slate-900">{selectedGroupDetails.name}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Invoice settings</span>
              <Button variant="ghost" className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl">Edit</Button>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500">Finalize invoices</span>
              <span className="text-xs font-bold text-slate-900">10 days before due date</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">General ledger account</span>
              <Button variant="ghost" className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl">Edit</Button>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500">General ledger account</span>
              <span className="text-xs font-bold text-slate-400 italic">Not specified</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Expenses approval policies</span>
            </div>
            <div className="text-slate-500 text-xs font-medium">
              This expense approval policy affects your employees and contractors.
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-xs font-bold">
              <Info size={16} />
              The approvals policies settings were moved to Expenses & adjustments page.
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Contractors approval policies</span>
            </div>
            <div className="text-slate-500 text-xs font-medium">
              Set the policy to approve the submitted adjustments and work. To add new policies or edit the current one go to Contract settings on Organization Settings.
            </div>
            
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Require approval for payment items</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-bold">New</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium max-w-md">
                  If enabled, admins with the necessary permissions will be required to review payment items before they are paid.
                </span>
              </div>
              <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-900">Contractors policy</span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                Default payment items policy
                <MoreVertical size={14} className="text-slate-400" />
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col gap-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Archive this group</span>
            </div>
            <div className="text-slate-500 text-xs font-medium max-w-xl">
              Archived groups are hidden from your main view but can be accessed by enabling 'Archived' filter on your groups page. You can restore it at any time.
            </div>
            <Button className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 h-12 rounded-2xl font-bold text-xs w-fit shadow-sm">
              Archive group
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#1A1C21] tracking-tight">Groups</h1>
        <p className="text-sm font-medium text-slate-400">
          Define working groups that reflect the organization's structure
        </p>
      </div>

      {/* Suggestion Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#E0E7FF] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-200 group">
         <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-[10px] font-bold text-indigo-600">Suggested for you</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Avoid costly missteps</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Unclear contractor status? Haraka's quick risk assessment helps you stay compliant in 150+ countries—before issues arise.
            </p>
            <Button className="bg-[#1A1C21] hover:bg-black text-white px-8 py-6 rounded-2xl flex items-center gap-2 group/btn">
              Take the assessment <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
         </div>
         {/* Decorative Illustration Area */}
         <div className="relative w-full md:w-96 h-48 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm p-4 hidden lg:block overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <div className="relative flex flex-col gap-4">
               {/* Mock Card UI */}
               <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 w-64 transform -rotate-3 translate-x-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                     <div className="w-20 h-2 bg-slate-100 rounded" />
                     <div className="w-12 h-1.5 bg-slate-50 rounded" />
                  </div>
               </div>
               <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 w-64 translate-x-20">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                     <div className="w-24 h-2 bg-slate-100 rounded" />
                     <div className="w-16 h-1.5 bg-slate-50 rounded" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100">
        <button className="pb-4 px-1 text-sm font-black text-slate-900 border-b-2 border-emerald-500">Groups</button>
        <button className="pb-4 px-1 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors">Dynamic groups</button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search groups..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white rounded-2xl border-slate-200 focus:ring-emerald-500/20" 
            />
         </div>
         <Button 
           onClick={() => setIsCreateModalOpen(true)}
           className="bg-[#1A1C21] hover:bg-black text-white px-8 h-12 rounded-2xl font-bold text-xs flex items-center gap-2"
         >
           <Plus size={16} /> Create group
         </Button>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400">Total {groups.length} item{groups.length !== 1 ? 's' : ''}</p>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400">Group</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400">Status</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400">Admins assigned</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400">Contracts</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-slate-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredGroups.map((group) => (
                     <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group/row">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                                 {group.avatar_url ? (
                                   <img src={group.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                                 ) : (
                                   <Building2 size={20} />
                                 )}
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                    <p className="text-sm font-black text-slate-900">{group.name}</p>
                                    {group.is_primary && (
                                       <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white text-[8px] font-bold">
                                          Primary
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                              group.status === 'archived' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                              group.status === 'deleted' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                              group.is_locked ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' :
                              'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            }`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {group.status === 'archived' ? 'Archived' : group.status === 'deleted' ? 'Deleted' : group.is_locked ? 'Locked' : 'Active'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                              <UsersIcon size={14} className="text-slate-400" />
                              {group.admin_count ?? 1} admin
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                              <Briefcase size={14} className="text-slate-400" />
                              {group.contract_count ?? 0} contracts
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-white border border-transparent hover:border-slate-200 shadow-sm">
                                    <MoreVertical size={16} />
                                 </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-[var(--border-color)] bg-white">
                                 {!group.is_primary && group.status !== 'archived' && group.status !== 'deleted' && (
                                    <DropdownMenuItem 
                                      onClick={() => setPrimaryGroup(group.id)}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
                                    >
                                       <CheckCircle2 size={14} /> Make primary
                                    </DropdownMenuItem>
                                 )}
                                 <DropdownMenuItem 
                                   onClick={() => setSelectedGroupDetails(group)}
                                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all text-xs font-bold"
                                 >
                                    <ExternalLink size={14} /> View details
                                 </DropdownMenuItem>
                                 {group.status !== 'archived' && group.status !== 'deleted' && !group.is_locked && (
                                    <DropdownMenuItem 
                                      onClick={() => { setEditingGroup(group); setEditGroupName(group.name); setEditGroupAvatar(group.avatar_url || ""); setEditGroupBio(group.bio || ""); }}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all text-xs font-bold"
                                    >
                                       <Edit size={14} /> Edit group
                                    </DropdownMenuItem>
                                 )}
                                 {group.status !== 'archived' && group.status !== 'deleted' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateGroup(group.id, { is_locked: !group.is_locked })}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all text-xs font-bold"
                                    >
                                       {group.is_locked ? <Unlock size={14} /> : <Lock size={14} />} 
                                       {group.is_locked ? 'Unlock group' : 'Lock group'}
                                    </DropdownMenuItem>
                                 )}
                                 {!group.is_locked && group.status === 'active' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateGroup(group.id, { status: 'archived' })}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-amber-500/5 hover:text-amber-600 transition-all text-xs font-bold"
                                    >
                                       <Archive size={14} /> Archive group
                                    </DropdownMenuItem>
                                 )}
                                 {group.status === 'archived' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateGroup(group.id, { status: 'active' })}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
                                    >
                                       <RefreshCw size={14} /> Restore group
                                    </DropdownMenuItem>
                                 )}
                                 {!group.is_primary && !group.is_locked && group.status !== 'deleted' && (
                                    <DropdownMenuItem 
                                      onClick={() => updateGroup(group.id, { status: 'deleted' })}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-red-600 hover:bg-red-500/5 transition-all text-xs font-bold"
                                    >
                                       <Trash2 size={14} /> Delete group
                                    </DropdownMenuItem>
                                 )}

                              </DropdownMenuContent>
                           </DropdownMenu>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredGroups.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border border-dashed border-slate-200">
                  <Building2 size={32} />
               </div>
               <div className="space-y-1">
                  <p className="text-sm font-black text-slate-900">No organizations found</p>
                  <p className="text-xs text-slate-400 font-medium">Try a different search term or create a new group</p>
               </div>
            </div>
         )}
      </div>

      {/* Creation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={(open) => { if(!open) closeCreateModal(); }}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[850px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 border-slate-200 flex flex-col md:flex-row gap-10 font-sans text-[#1A1C21]">
          
          {/* Left: Step Content */}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Create group</h2>
              <p className="text-xs font-medium text-slate-400 mt-1">For Flowboard Team</p>
            </div>

            {createStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">Group name</label>
                  <Input
                    placeholder="e.g. Flowboard Team"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-14 rounded-2xl border-slate-200 focus:ring-indigo-500/20 font-bold text-sm"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">
                    How would you like to set up the group's settings?
                  </label>
                  
                  <div 
                    onClick={() => setSettingsType("manual")}
                    className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      settingsType === "manual" ? "border-slate-900 bg-slate-50/50" : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      settingsType === "manual" ? "border-slate-900" : "border-slate-300"
                    }`}>
                      {settingsType === "manual" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Configure manually</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Manually configure payment methods, approval rules, and assign admins.
                      </p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setSettingsType("replicate")}
                    className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      settingsType === "replicate" ? "border-slate-900 bg-slate-50/50" : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                      settingsType === "replicate" ? "border-slate-900" : "border-slate-300"
                    }`}>
                      {settingsType === "replicate" && <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900">Replicate existing group settings</p>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-bold">New</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Select a group and replicate its settings, including admin roles, rules, and payment approvals.
                      </p>
                    </div>
                  </div>
                </div>

                {settingsType === "replicate" && (
                  <div className="space-y-3 animate-in slide-in-from-top duration-300">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">
                      Select a group to replicate its settings
                    </label>
                    
                    <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>For the moment, the group's settings can only be replicated, not edited. It's important to note that this does not include contracts.</span>
                    </div>

                    <select 
                      value={replicateFromGroupId} 
                      onChange={(e) => setReplicateFromGroupId(e.target.value)}
                      className="w-full h-14 rounded-2xl border-2 border-slate-200 px-4 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="" disabled>Select a group</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={() => setCreateStep(2)} 
                    disabled={!newGroupName.trim() || (settingsType === "replicate" && !replicateFromGroupId)}
                    className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {createStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Select admins <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-black">1</span>
                  </h3>
                  <Button variant="ghost" className="text-xs font-black text-indigo-600 hover:bg-indigo-50 h-8 rounded-xl">
                    Invite admin
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search admins..." 
                    className="pl-12 h-12 border-slate-100 rounded-xl text-xs" 
                  />
                </div>

                <div className="space-y-3 bg-slate-50/30 border border-slate-100 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 p-1">
                    <input type="checkbox" defaultChecked disabled className="rounded text-indigo-600 w-4 h-4 border-slate-300 cursor-not-allowed" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">Organization admins</span>
                      <span className="text-[10px] text-slate-400 font-medium">Assigned by default</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
                  <Info size={14} className="shrink-0" />
                  <span>All the admins in the organization are part of the group. Organization admins can invite admins from the admins tab.</span>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCreateStep(1)} 
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setCreateStep(3)} 
                    className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {createStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{newGroupName}</p>
                      <p className="text-xs text-slate-400 font-medium">Ready for allocation</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No admins selected</span>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
                  <Info size={14} className="shrink-0" />
                  <span>At least one group admin must be assigned before the group can be created. (Organization admins satisfy this)</span>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setCreateStep(2)} 
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    ← Back
                  </Button>
                  <Button 
                    onClick={handleCreateGroup} 
                    disabled={isSubmitting}
                    className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    {isSubmitting ? "Creating..." : "Add group"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar Progress */}
          <div className="w-full md:w-64 bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-8 self-start">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                createStep >= 1 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {createStep > 1 ? "✓" : "1"}
              </div>
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest ${
                  createStep > 1 ? "text-emerald-600" : "text-slate-400"
                }`}>
                  {createStep > 1 ? "COMPLETED" : "IN PROGRESS"}
                </span>
                <span className="text-xs font-bold text-slate-900">Define settings</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                createStep >= 2 ? (createStep > 2 ? "bg-emerald-500 text-white" : "bg-slate-900 text-white") : "bg-slate-100 text-slate-400"
              }`}>
                {createStep > 2 ? "✓" : "2"}
              </div>
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest ${
                  createStep > 2 ? "text-emerald-600" : (createStep === 2 ? "text-slate-900" : "text-slate-400")
                }`}>
                  {createStep > 2 ? "COMPLETED" : (createStep === 2 ? "IN PROGRESS" : "WAITING")}
                </span>
                <span className="text-xs font-bold text-slate-900">Select admins</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                createStep === 3 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                3
              </div>
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest ${
                  createStep === 3 ? "text-slate-900" : "text-slate-400"
                }`}>
                  {createStep === 3 ? "IN PROGRESS" : "WAITING"}
                </span>
                <span className="text-xs font-bold text-slate-900">Assign & review</span>
              </div>
            </div>
          </div>

          <button 
            onClick={closeCreateModal}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => { if(!open) setEditingGroup(null); }}>
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Edit group</h3>
            <p className="text-xs text-slate-400 font-medium">Update the organization's core details.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Group name</label>
              <Input 
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 font-medium text-sm"
                placeholder="Enter group name..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Group logo</label>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden text-slate-400">
                  {editGroupAvatar ? (
                    <img src={editGroupAvatar} alt="Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="group-avatar-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditGroupAvatar(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="group-avatar-upload"
                    className="inline-flex items-center justify-center h-10 px-4 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors uppercase tracking-widest"
                  >
                    Upload Image
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Bio</label>
              <textarea 
                value={editGroupBio}
                onChange={(e) => setEditGroupBio(e.target.value)}
                className="w-full min-h-[100px] rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 font-medium text-sm p-4 resize-none outline-none border"
                placeholder="Enter a brief description of the organization..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setEditingGroup(null)} 
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (editingGroup && editGroupName.trim()) {
                  await updateGroup(editingGroup.id, { name: editGroupName, avatar_url: editGroupAvatar, bio: editGroupBio });
                  toast.success("Group details updated successfully");
                  setEditingGroup(null);
                }
              }} 
              className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
            >
              Save changes
            </Button>
          </div>

          <button 
            onClick={() => setEditingGroup(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
