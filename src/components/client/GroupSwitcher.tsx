import { useState } from "react";
import { useGroups, Group } from "@/contexts/GroupContext";
import { useNavigate } from "react-router-dom";
import { 
  ChevronDown, 
  Plus, 
  Settings, 
  Check, 
  Users,
  Building2 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function GroupSwitcher() {
  const { activeGroup, groups, setActiveGroup } = useGroups();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!activeGroup) return null;

  return (
    <div className="flex flex-col">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-[var(--border-color)] hover:bg-slate-50 transition-all text-left min-w-[200px] shadow-sm group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
              {activeGroup.avatar_url ? (
                <img src={activeGroup.avatar_url} alt={activeGroup.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate leading-tight">
                {activeGroup.name}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {groups.length} {groups.length === 1 ? "Organization" : "Organizations"}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-2xl border-[var(--border-color)] bg-white animate-in fade-in zoom-in-95 duration-200">
          <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Switch Organization
          </DropdownMenuLabel>
          <div className="space-y-1 py-1">
            {groups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => setActiveGroup(group)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  activeGroup.id === group.id 
                    ? "bg-emerald-500/5 text-emerald-600 font-black" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                    activeGroup.id === group.id ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-100 border-slate-200"
                  }`}>
                    <Building2 className={`w-3 h-3 ${activeGroup.id === group.id ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <span className="truncate text-xs">{group.name}</span>
                </div>
                {activeGroup.id === group.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />

          <DropdownMenuItem 
            onClick={() => navigate("/client/settings/groups")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
          >
            <Settings className="w-4 h-4" /> Group settings
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => navigate("/client/settings/groups?create=true")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Create group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
