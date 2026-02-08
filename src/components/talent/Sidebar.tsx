import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Cpu,
  Wallet,
  ShieldCheck,
  Clock,
  Users,
  Layers,
  Grid,
} from "lucide-react";

const MENU_GROUPS = [
  {
    group: "Core Marketplace",
    items: [
      { name: "Dashboard", path: "/talent/dashboard", icon: LayoutDashboard },
      { name: "Find Jobs", path: "/talent/jobs", icon: Search },
      {
        name: "My Applications",
        path: "/talent/applications",
        icon: Briefcase,
      },
    ],
  },
  {
    group: "Workforce & AI",
    items: [
      { name: "Active Contracts", path: "/talent/contracts", icon: Layers },
      { name: "Time Tracker", path: "/talent/tracker", icon: Clock },
      { name: "My Teams", path: "/talent/teams", icon: Users },
    ],
  },
  {
    group: "Finance & Admin",
    items: [
      { name: "Invoice & Payments", path: "/talent/payroll", icon: Wallet },
      { name: "Compliance", path: "/talent/compliance", icon: ShieldCheck },
      { name: "Apps & Tools", path: "/talent/apps", icon: Grid },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="w-full h-full bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
          <img
            src="/flowboardlogo.png"
            alt="FlowBoard Logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <span className="text-xl font-black tracking-tighter text-[var(--text-main)]">
          Flowboard
        </span>
      </div>

      <nav className="flex-1 space-y-8">
        {MENU_GROUPS.map((group) => (
          <div key={group.group}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-4">
              {group.group}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({
                    isActive,
                  }) => `flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"
                    }
                    `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
