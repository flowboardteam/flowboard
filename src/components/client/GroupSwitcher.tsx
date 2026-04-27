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
          <button className="flex items-center gap-3 px-3 py-2 rounded-full bg-white border border-[var(--border-color)] hover:bg-slate-50 transition-all text-left min-w-[200px] shadow-sm group">
            <div className="w-8 h-8 rounded-full bg-[#A079FF]/10 flex items-center justify-center border border-[#A079FF]/20 shrink-0 overflow-hidden">
              {activeGroup.avatar_url ? (
                <img src={activeGroup.avatar_url} alt={activeGroup.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Building2 className="w-4 h-4 text-[#A079FF]" />
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
                    ? "bg-[#A079FF]/5 text-[#A079FF] font-black" 
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                    activeGroup.id === group.id ? "bg-[#A079FF]/10 border-[#A079FF]/20" : "bg-slate-100 border-slate-200"
                  }`}>
                    <Building2 className={`w-3 h-3 ${activeGroup.id === group.id ? "text-[#A079FF]" : "text-slate-400"}`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-xs">{group.name}</span>
                    {group.is_primary && (
                      <span className="text-[8px] font-black uppercase text-indigo-500 tracking-tighter">Primary</span>
                    )}
                  </div>
                </div>
                {activeGroup.id === group.id && <Check className="w-3.5 h-3.5 text-[#A079FF]" />}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-1 bg-slate-100" />

          <DropdownMenuItem 
            onClick={() => navigate("/client/settings/groups")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-[#A079FF]/5 hover:text-[#A079FF] transition-all text-xs font-bold"
          >
            <Settings className="w-4 h-4" /> Group settings
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => navigate("/client/settings/groups?create=true")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-[#A079FF]/5 hover:text-[#A079FF] transition-all text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Create group
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
