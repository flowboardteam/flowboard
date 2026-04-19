import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Group {
  id: string;
  name: string;
  organization_id: string;
  avatar_url?: string;
  status: "active" | "inactive";
  admin_count?: number;
  contract_count?: number;
}

interface GroupContextType {
  activeGroup: Group | null;
  groups: Group[];
  loading: boolean;
  setActiveGroup: (group: Group) => void;
  refreshGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<Group | null>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Mock data to ensure UI works even if DB tables aren't ready
const MOCK_GROUPS: Group[] = [
  {
    id: "default-group",
    name: "Flowboard Team",
    organization_id: "org-1",
    status: "active",
    admin_count: 1,
    contract_count: 0
  }
];

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setGroups(MOCK_GROUPS);
        if (!activeGroup) setActiveGroupState(MOCK_GROUPS[0]);
        return;
      }

      // Attempt to fetch from Supabase
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("organization_id", user.id);

      if (error || !data || data.length === 0) {
        setGroups(MOCK_GROUPS);
        if (!activeGroup) setActiveGroupState(MOCK_GROUPS[0]);
      } else {
        setGroups(data as Group[]);
        if (!activeGroup || !data.find(g => g.id === activeGroup.id)) {
          setActiveGroupState(data[0] as Group);
        }
      }
    } catch (e) {
      console.error("Group refresh failed:", e);
      setGroups(MOCK_GROUPS);
      setActiveGroupState(MOCK_GROUPS[0]);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string): Promise<Group | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const newGroup: Partial<Group> = {
      name,
      organization_id: user.id,
      status: "active",
    };

    const { data, error } = await supabase
      .from("groups")
      .insert(newGroup)
      .select()
      .single();

    if (error) {
      // If DB fails (table not created), simulate locally for demo
      console.warn("DB Insert failed, simulating locally:", error);
      const simulated: Group = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          organization_id: user.id,
          status: "active",
          admin_count: 1,
          contract_count: 0
      };
      setGroups(prev => [...prev, simulated]);
      return simulated;
    }

    await refreshGroups();
    return data;
  };

  const setActiveGroup = (group: Group) => {
    setActiveGroupState(group);
    // Future: Persist to localStorage or Session
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  return (
    <GroupContext.Provider value={{ activeGroup, groups, loading, setActiveGroup, refreshGroups, createGroup }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroups must be used within a GroupProvider");
  }
  return context;
};
