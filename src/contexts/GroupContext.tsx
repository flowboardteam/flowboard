import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface Group {
  id: string;
  name: string;
  organization_id: string;
  avatar_url?: string;
  status: "active" | "inactive" | "archived" | "deleted";
  bio?: string;
  is_primary?: boolean;
  is_locked?: boolean;
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
  setPrimaryGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

// Mock data to ensure UI works even if DB tables aren't ready
const MOCK_GROUPS: Group[] = [
  {
    id: "default-group",
    name: "Flowboard Team",
    organization_id: "org-1",
    status: "active",
    is_primary: true,
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
      
      const localGroups = localStorage.getItem("flowboard_simulated_groups");
      const parsedLocal = localGroups ? JSON.parse(localGroups) : [];
      
      if (!user) {
        const merged = [...MOCK_GROUPS, ...parsedLocal.filter((l: any) => !MOCK_GROUPS.some(m => m.id === l.id))];
        setGroups(merged);
        if (!activeGroup && merged.length > 0) setActiveGroupState(merged[0]);
        return;
      }

      // Isolate to current user
      const userLocalGroups = parsedLocal.filter((l: any) => l.organization_id === user.id);

      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .eq("organization_id", user.id);

      if (error || !data || data.length === 0) {
        // Only show user's simulated groups, NOT mock groups
        const sortedMerged = [...userLocalGroups].sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return 0;
        });
        
        // If they have NO groups, create a default one for them so the UI doesn't break
        if (sortedMerged.length === 0) {
          const defaultGroup: Group = {
            id: `grp-${Math.random().toString(36).substr(2, 9)}`,
            name: "My Workspace",
            organization_id: user.id,
            status: "active",
            is_primary: true,
            admin_count: 1,
            contract_count: 0
          };
          parsedLocal.push(defaultGroup);
          localStorage.setItem("flowboard_simulated_groups", JSON.stringify(parsedLocal));
          sortedMerged.push(defaultGroup);
          
          // Background sync
          supabase.from("groups").insert(defaultGroup).catch(() => {});
        }

        setGroups(sortedMerged);
        if (!activeGroup && sortedMerged.length > 0) setActiveGroupState(sortedMerged[0]);
      } else {
        // Merge DB data with any local simulated data that isn't in the DB yet
        const dbIds = new Set(data.map(d => d.id));
        const missingLocal = userLocalGroups.filter((l: any) => !dbIds.has(l.id));
        const combined = [...data, ...missingLocal];

        const sorted = combined.sort((a, b) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return 0;
        });
        setGroups(sorted);
        
        if (!activeGroup || !sorted.find(g => g.id === activeGroup.id)) {
          setActiveGroupState(sorted[0]);
        }
      }
    } catch (e) {
      console.error("Group refresh failed:", e);
      // Fallback
      const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
      if (!user) return;
      
      const localGroups = localStorage.getItem("flowboard_simulated_groups");
      const parsedLocal = localGroups ? JSON.parse(localGroups) : [];
      const userLocalGroups = parsedLocal.filter((l: any) => l.organization_id === user.id);
      
      const sortedMerged = userLocalGroups.sort((a: any, b: any) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return 0;
      });
      setGroups(sortedMerged);
      if (!activeGroup && sortedMerged.length > 0) setActiveGroupState(sortedMerged[0]);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string): Promise<Group | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    const newGroup: Partial<Group> = {
      name,
      organization_id: user ? user.id : "org-1",
      status: "active",
      is_primary: groups.length === 0,
    };

    const simulated: Group = {
        id: `grp-${Math.random().toString(36).substr(2, 9)}`,
        name,
        organization_id: user ? user.id : "org-1",
        status: "active",
        admin_count: 1,
        contract_count: 0,
        is_primary: groups.length === 0
    };
    
    const localGroups = localStorage.getItem("flowboard_simulated_groups");
    const parsedLocal = localGroups ? JSON.parse(localGroups) : [];
    parsedLocal.push(simulated);
    localStorage.setItem("flowboard_simulated_groups", JSON.stringify(parsedLocal));
    
    setGroups(prev => [...prev, simulated]);
    
    // Background sync
    supabase
      .from("groups")
      .insert(newGroup)
      .catch(e => console.warn("Supabase insert error:", e));

    return simulated;
  };

  const setPrimaryGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const localGroups = localStorage.getItem("flowboard_simulated_groups");
      const parsedLocal = localGroups ? JSON.parse(localGroups) : [];
      
      const updatedSimulated = parsedLocal.map((g: any) => ({
        ...g,
        is_primary: g.id === groupId
      }));
      
      localStorage.setItem("flowboard_simulated_groups", JSON.stringify(updatedSimulated));

      // If the default mock group is selected as primary
      if (groupId === "default-group") {
        MOCK_GROUPS[0].is_primary = true;
      } else {
        MOCK_GROUPS[0].is_primary = false;
      }

      if (user) {
        try {
          await supabase.from("groups").update({ is_primary: false }).eq("organization_id", user.id);
          await supabase.from("groups").update({ is_primary: true }).eq("id", groupId);
        } catch (dbErr) {
          console.warn("DB update for primary group failed, proceeding locally");
        }
      }

      await refreshGroups();
    } catch (e) {
      console.error("Failed to set primary group", e);
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      const localGroups = localStorage.getItem("flowboard_simulated_groups");
      const parsedLocal = localGroups ? JSON.parse(localGroups) : [];
      
      const updatedSimulated = parsedLocal.map((g: any) => {
        if (g.id === groupId) {
          return { ...g, ...updates };
        } else if (updates.is_primary) {
          return { ...g, is_primary: false };
        }
        return g;
      });
      
      localStorage.setItem("flowboard_simulated_groups", JSON.stringify(updatedSimulated));

      if (groupId === "default-group") {
        Object.assign(MOCK_GROUPS[0], updates);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          await supabase.from("groups").update(updates).eq("id", groupId);
        } catch (dbErr) {
          console.warn("DB update failed, proceeding locally");
        }
      }

      await refreshGroups();
      
      if (activeGroup && activeGroup.id === groupId) {
        setActiveGroupState(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (e) {
      console.error("Failed to update group", e);
    }
  };

  useEffect(() => {
    refreshGroups();
  }, []);

  return (
    <GroupContext.Provider value={{ 
      activeGroup, 
      groups, 
      loading, 
      setActiveGroup: setActiveGroupState, 
      refreshGroups, 
      createGroup,
      setPrimaryGroup,
      updateGroup
    }}>
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
