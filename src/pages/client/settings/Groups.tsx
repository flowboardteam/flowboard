import { useState, useMemo } from "react";
import { useGroups, Group } from "@/contexts/GroupContext";
import { useSearchParams } from "react-router-dom";
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
  Briefcase
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
  const { groups, createGroup, setPrimaryGroup, loading } = useGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get("create") === "true");
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close create modal and clear URL param
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

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#1A1C21] tracking-tight">Groups</h1>
        <p className="text-sm font-medium text-slate-400">
          Define working groups that reflect the organization's structure
        </p>
      </div>

      {/* Suggestion Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#E0E7FF] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-200 group">
         <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Suggested for you</span>
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
           className="bg-[#1A1C21] hover:bg-black text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2"
         >
           <Plus size={16} /> Create group
         </Button>
      </div>

      {/* Groups Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total {groups.length} Item{groups.length !== 1 ? 's' : ''}</p>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Group</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Admins assigned</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contracts</th>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
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
                                       <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest">
                                          Primary
                                       </span>
                                    )}
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Primary Entity</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
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
                                 {!group.is_primary && (
                                    <DropdownMenuItem 
                                      onClick={() => setPrimaryGroup(group.id)}
                                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
                                    >
                                       <CheckCircle2 size={14} /> Make Primary
                                    </DropdownMenuItem>
                                 )}
                                 <DropdownMenuItem 
                                   className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
                                 >
                                    <ExternalLink size={14} /> View Details
                                 </DropdownMenuItem>
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
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-[#1A1C21] tracking-tight">Create group</DialogTitle>
            <p className="text-sm font-medium text-slate-400">
              Set up a new entity or department to manage hiring.
            </p>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Group name</label>
              <Input
                placeholder="e.g. Acme Innovations"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
                className="h-14 rounded-2xl border-slate-200 focus:ring-emerald-500/20 font-bold"
              />
            </div>
            <div className="flex flex-col gap-3">
               <Button 
                 type="submit" 
                 disabled={isSubmitting || !newGroupName.trim()}
                 className="w-full bg-[#1A1C21] hover:bg-black text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10"
               >
                 {isSubmitting ? "Creating..." : "Confirm & Create"}
               </Button>
               <Button 
                 type="button" 
                 variant="ghost" 
                 onClick={closeCreateModal}
                 className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50"
               >
                 Cancel
               </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
