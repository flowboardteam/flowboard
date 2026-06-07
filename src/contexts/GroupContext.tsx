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
  created_at?: string;
  updated_at?: string;
  user_role?: "owner" | "admin" | "member" | "viewer";
  is_pending_invite?: boolean;
  invite_token?: string;
  invite_id?: string;
  user_permissions?: {
    can_edit: boolean;
    can_invite: boolean;
    can_delete: boolean;
  };
}

interface GroupContextType {
  activeGroup: Group | null;
  groups: Group[];
  loading: boolean;
  organizationId: string | null; // Add this line
  setActiveGroup: (group: Group) => void;
  refreshGroups: () => Promise<void>;
  createGroup: (name: string, settingsType?: "manual" | "replicate", replicateFromId?: string) => Promise<Group | null>;
  setPrimaryGroup: (groupId: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  inviteAdminToGroup: (groupId: string, email: string) => Promise<{ success: boolean; error?: string; inviteLink?: string }>;
  deleteGroup: (groupId: string) => Promise<{ success: boolean; error?: string }>;
  acceptPendingInvite: (groupId: string, token: string) => Promise<boolean>;
  declinePendingInvite: (token: string) => Promise<boolean>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
   const [organizationId, setOrganizationId] = useState<string | null>(null);

  const deleteGroup = async (groupId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error("Group not found");
    
    // Don't allow deleting the primary group if there are other groups
    if (group.is_primary && groups.length > 1) {
      return { success: false, error: "Cannot delete primary group. Please set another group as primary first." };
    }

    // Soft delete - just mark as deleted
    const { error } = await supabase
      .from("groups")
      .update({ 
        status: "deleted", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", groupId);

    if (error) throw error;

    // Remove from local state
    const updatedGroups = groups.filter((g) => g.id !== groupId);
    setGroups(updatedGroups);

    // If the deleted group was active, switch to another group
    if (activeGroup?.id === groupId) {
      const newActiveGroup = updatedGroups.find((g) => g.is_primary) || updatedGroups[0];
      if (newActiveGroup) {
        setActiveGroupState(newActiveGroup);
        localStorage.setItem("activeGroupId", newActiveGroup.id);
      } else {
        setActiveGroupState(null);
        localStorage.removeItem("activeGroupId");
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return { success: false, error: error.message };
  }
};

const refreshGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setGroups([]);
        setActiveGroupState(null);
        setOrganizationId(null); // Clear organizationId
        setLoading(false);
        return;
      }

      // Set organizationId from user
      setOrganizationId(user.id);

    // Get groups where user is a member from group_members
    let { data: memberGroups, error: memberError } = await supabase
      .from("group_members")
      .select(`
        role,
        group:groups!group_id (
          id,
          name,
          organization_id,
          avatar_url,
          status,
          bio,
          is_primary,
          is_locked,
          admin_count,
          contract_count,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", user.id);

    if (memberError) {
      console.error("Error fetching member groups:", memberError);
      memberGroups = [];
    }

    // Also get groups where user is the owner
    let { data: ownedGroups, error: ownerError } = await supabase
      .from("groups")
      .select("*")
      .eq("organization_id", user.id)
      .neq("status", "deleted");

    if (ownerError) {
      console.error("Error fetching owned groups:", ownerError);
      ownedGroups = [];
    }

    // Also get groups where user has a pending invitation
    let { data: pendingInvites, error: inviteFetchError } = await supabase
      .from("group_invitations")
      .select(`
        id,
        token,
        group:groups (
          id,
          name,
          organization_id,
          avatar_url,
          status,
          bio,
          is_primary,
          is_locked,
          admin_count,
          contract_count,
          created_at,
          updated_at
        )
      `)
      .eq("email", user.email?.toLowerCase().trim())
      .eq("status", "pending");

    if (inviteFetchError) {
      console.error("Error fetching pending invites:", inviteFetchError);
    }

    // Merge and deduplicate groups
    const allGroups: Group[] = [];
    const groupIds = new Set();

    // Add owned groups first
    for (const group of ownedGroups || []) {
      if (!groupIds.has(group.id)) {
        groupIds.add(group.id);
        allGroups.push({
          ...group,
          user_role: "owner"
        });
      }
    }

    // Add member groups - handle properly when group is an array
    for (const member of memberGroups || []) {
      // member.group could be an array, take the first item
      const groupData = Array.isArray(member.group) ? member.group[0] : member.group;
      if (groupData && !groupIds.has(groupData.id)) {
        groupIds.add(groupData.id);
        allGroups.push({
          ...groupData,
          user_role: member.role || "admin"
        });
      }
    }

    // Add pending invites to allGroups
    for (const invite of pendingInvites || []) {
      const groupData = Array.isArray(invite.group) ? invite.group[0] : invite.group;
      if (groupData && !groupIds.has(groupData.id)) {
        groupIds.add(groupData.id);
        allGroups.push({
          ...groupData,
          user_role: "viewer", // limited access
          is_pending_invite: true,
          invite_token: invite.token,
          invite_id: invite.id,
        });
      }
    }

    // If no groups are found, auto-create a default primary "My Workplace" group as a robust fallback/failsafe
    if (allGroups.length === 0) {
      console.log("No groups found. Provisioning default 'My Workplace' organization...");
      const { data: defaultGroup, error: createError } = await supabase
        .from("groups")
        .insert({
          name: "My Workplace",
          organization_id: user.id,
          status: "active",
          is_primary: true,
          admin_count: 1,
          contract_count: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to auto-create default 'My Workplace' organization:", createError.message);
      } else if (defaultGroup) {
        console.log("Auto-created default 'My Workplace' organization!");
        allGroups.push({
          ...defaultGroup,
          user_role: "owner"
        });
      }
    }

    // Sort groups (primary first)
    const sortedGroups = allGroups.sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });

    setGroups(sortedGroups);

    // Restore active group from localStorage
    const savedGroupId = localStorage.getItem("activeGroupId");
    const savedGroup = sortedGroups.find((g) => g.id === savedGroupId);
    const primaryGroup = sortedGroups.find((g) => g.is_primary);

    setActiveGroupState(savedGroup || primaryGroup || sortedGroups[0] || null);
  } catch (e) {
    console.error("Group refresh failed:", e);
  } finally {
    setLoading(false);
  }
};

  const createGroup = async (
    name: string,
    settingsType: "manual" | "replicate" = "manual",
    replicateFromId?: string
  ): Promise<Group | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");

      let newGroupData: Partial<Group> = {
        name: name.trim(),
        organization_id: user.id,
        status: "active",
        is_primary: groups.length === 0,
        admin_count: 1,
        contract_count: 0,
      };

      // If replicating, pull settings from the source group
      if (settingsType === "replicate" && replicateFromId) {
        const sourceGroup = groups.find((g) => g.id === replicateFromId);
        if (sourceGroup) {
          newGroupData = {
            ...newGroupData,
            admin_count: sourceGroup.admin_count,
            contract_count: 0, // Always start at 0 for new group
          };
        }
      }

      const { data: createdGroup, error } = await supabase
        .from("groups")
        .insert([newGroupData])
        .select()
        .single();

      if (error) throw error;

      if (createdGroup) {
        setGroups((prev) => {
          const updated = [...prev, createdGroup];
          return updated.sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return 0;
          });
        });

        // If it's the first group, auto-select it
        if (groups.length === 0) {
          setActiveGroupState(createdGroup);
          localStorage.setItem("activeGroupId", createdGroup.id);
        }
      }

      return createdGroup;
    } catch (error: any) {
      console.error("Error creating group:", error);
      return null;
    }
  };

  const setPrimaryGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset all primaries for this org
      await supabase
        .from("groups")
        .update({ is_primary: false })
        .eq("organization_id", user.id);

      // Set new primary
      const { error } = await supabase
        .from("groups")
        .update({ is_primary: true })
        .eq("id", groupId);

      if (error) throw error;

      const updatedGroups = groups.map((g) => ({
        ...g,
        is_primary: g.id === groupId,
      }));
      setGroups(updatedGroups);

      if (activeGroup) {
        setActiveGroupState({
          ...activeGroup,
          is_primary: activeGroup.id === groupId,
        });
      }
    } catch (e) {
      console.error("Failed to set primary group:", e);
    }
  };

  const updateGroup = async (groupId: string, updates: Partial<Group>) => {
    try {
      const { error } = await supabase
        .from("groups")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", groupId);

      if (error) throw error;

      const updatedGroups = groups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      );
      setGroups(updatedGroups);

      if (activeGroup?.id === groupId) {
        setActiveGroupState({ ...activeGroup, ...updates });
      }
    } catch (e) {
      console.error("Failed to update group:", e);
      throw e;
    }
  };

  /**
   * Sends an email invitation to an admin for a specific group.
   * Stores the invitation in group_invitations table and triggers an email via
   * Supabase edge function (or your preferred email provider).
   */
const inviteAdminToGroup = async (groupId: string, email: string): Promise<{ success: boolean; error?: string; inviteLink?: string }> => {
  try {
    console.log("Starting inviteAdminToGroup...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");
    console.log("User found:", user.id);

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      console.error("Group error:", groupError);
      throw new Error("Group not found");
    }
    console.log("Group found:", group.name);

    const token = crypto.randomUUID();
    console.log("Generated token:", token);

    // Remove 'role' from the insert - your table doesn't have this column
    const { data: invitation, error: inviteError } = await supabase
      .from("group_invitations")
      .insert({
        group_id: groupId,
        email: email.toLowerCase().trim(),
        invited_by: user.id,
        token: token,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select();

    if (inviteError) {
      console.error("Invite error:", inviteError);
      throw inviteError;
    }
    
    console.log("Invitation created:", invitation);

    // Increment the admin_count in the groups table to immediately reflect the invitation!
    try {
      const { data: currentGroup } = await supabase
        .from("groups")
        .select("admin_count")
        .eq("id", groupId)
        .single();

      const newAdminCount = (currentGroup?.admin_count ?? 1) + 1;

      await supabase
        .from("groups")
        .update({ admin_count: newAdminCount })
        .eq("id", groupId);
        
      console.log("Successfully incremented group admin_count on invitation to:", newAdminCount);
    } catch (adminErr) {
      console.error("Failed to increment admin_count:", adminErr);
    }

    const inviteLink = `${window.location.origin}/invite/${token}`;
    console.log("Invite link:", inviteLink);
    
    return { success: true, inviteLink };
  } catch (error: any) {
    console.error("Error inviting admin:", error);
    return { success: false, error: error.message };
  }
};

  const acceptPendingInvite = async (groupId: string, token: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 1. Fetch the invitation to get invited_by
      const { data: invite } = await supabase
        .from("group_invitations")
        .select("invited_by")
        .eq("token", token)
        .maybeSingle();

      // 2. Add to group_members
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: "admin",
          invited_by: invite?.invited_by || null,
          joined_at: new Date().toISOString()
        });

      if (memberError) throw memberError;

      // 3. Update invitation status to accepted
      await supabase
        .from("group_invitations")
        .update({ status: "accepted" })
        .eq("token", token);

      // 4. Mark onboarding complete as a client
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      // 5. Save the active group in localStorage and reload
      localStorage.setItem("activeGroupId", groupId);
      
      // Clean up local storage invite token if matched
      if (localStorage.getItem("pendingInviteToken") === token) {
        localStorage.removeItem("pendingInviteToken");
        localStorage.removeItem("pendingInviteEmail");
        localStorage.removeItem("pendingInviteGroup");
      }

      window.location.href = "/client/dashboard";
      return true;
    } catch (err) {
      console.error("Failed to accept pending invite:", err);
      return false;
    }
  };

  const declinePendingInvite = async (token: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("group_invitations")
        .update({ status: "expired" })
        .eq("token", token);

      if (error) throw error;
      
      // Clean up local storage invite token if matched
      if (localStorage.getItem("pendingInviteToken") === token) {
        localStorage.removeItem("pendingInviteToken");
        localStorage.removeItem("pendingInviteEmail");
        localStorage.removeItem("pendingInviteGroup");
      }

      await refreshGroups();
      return true;
    } catch (err) {
      console.error("Failed to decline pending invite:", err);
      return false;
    }
  };

  // Persist active group to localStorage whenever it changes
  useEffect(() => {
    if (activeGroup) {
      localStorage.setItem("activeGroupId", activeGroup.id);
    }
  }, [activeGroup]);

  useEffect(() => {
    refreshGroups();
  }, []);

  return (
    <GroupContext.Provider
      value={{
        activeGroup,
        groups,
        loading,
        organizationId, // Add this line
        setActiveGroup: (group: Group) => {
          setActiveGroupState(group);
          localStorage.setItem("activeGroupId", group.id);
          window.location.reload();
        },
        refreshGroups,
        createGroup,
        setPrimaryGroup,
        updateGroup,
        inviteAdminToGroup,
        deleteGroup,
        acceptPendingInvite,
        declinePendingInvite,
      }}
    >
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