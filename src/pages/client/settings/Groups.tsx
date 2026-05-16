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
  Edit,
  Mail,
  Send,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function GroupsPage() {
  const {
    groups,
    createGroup,
    setPrimaryGroup,
    updateGroup,
    inviteAdminToGroup,
    deleteGroup,
    loading,
    refreshGroups,
  } = useGroups();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(
    searchParams.get("create") === "true",
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGroupDetails, setSelectedGroupDetails] =
    useState<Group | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupAvatar, setEditGroupAvatar] = useState("");
  const [editGroupBio, setEditGroupBio] = useState("");
  const [createStep, setCreateStep] = useState(1);
  const [settingsType, setSettingsType] = useState<"manual" | "replicate">(
    "manual",
  );
  const [replicateFromGroupId, setReplicateFromGroupId] = useState("");
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [groupAdmins, setGroupAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Invite admin state
  const [inviteModalGroup, setInviteModalGroup] = useState<Group | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const [inviteLink, setInviteLink] = useState("");
const [showInviteLinkModal, setShowInviteLinkModal] = useState(false);
const [copied, setCopied] = useState(false);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateStep(1);
    setNewGroupName("");
    setSettingsType("manual");
    setReplicateFromGroupId("");
    searchParams.delete("create");
    setSearchParams(searchParams);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await createGroup(
        newGroupName,
        settingsType,
        replicateFromGroupId || undefined,
      );
      if (created) {
        toast.success(`"${created.name}" created successfully`);
        closeCreateModal();
      } else {
        toast.error("Failed to create group. Please try again.");
      }
    } catch {
      toast.error("Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchGroupAdmins = async (groupId: string) => {
    setLoadingAdmins(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get the group to find the owner
      const { data: group } = await supabase
        .from("groups")
        .select("*")
        .eq("id", groupId)
        .single();

      const adminsList = [];

      // Add the current user as admin (since they're the one viewing)
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (currentProfile) {
        adminsList.push({
          ...currentProfile,
          role: group?.is_primary ? "Owner" : "Admin",
          status: "active",
        });
      }

      setGroupAdmins(adminsList);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  // Keep selectedGroupDetails in sync with groups
  useEffect(() => {
    if (selectedGroupDetails) {
      const updated = groups.find((g) => g.id === selectedGroupDetails.id);
      if (
        updated &&
        JSON.stringify(updated) !== JSON.stringify(selectedGroupDetails)
      ) {
        setSelectedGroupDetails(updated);
      }
    }
  }, [groups, selectedGroupDetails?.id]);

  // Refresh groups when coming back from detail view
  useEffect(() => {
    if (!selectedGroupDetails) {
      refreshGroups();
    }
  }, [selectedGroupDetails]);

const handleInviteAdmin = async () => {
  if (!inviteEmail.trim() || !inviteModalGroup) return;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inviteEmail.trim())) {
    toast.error("Please enter a valid email address");
    return;
  }
  setIsInviting(true);
  try {
    const result = await inviteAdminToGroup(inviteModalGroup.id, inviteEmail.trim());
    console.log("Invite result:", result);
    
    if (result.success) {
      setInviteLink(result.inviteLink || "");
      setShowInviteLinkModal(true);
      setInviteEmail("");
      setInviteModalGroup(null);
    } else {
      toast.error(result.error || "Failed to send invitation");
    }
  } catch (error) {
    console.error("Invite error:", error);
    toast.error("Failed to send invitation");
  } finally {
    setIsInviting(false);
  }
};

  const filteredGroups = useMemo(
    () =>
      groups.filter((g) =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [groups, searchTerm],
  );

  // ── Group Detail View ──────────────────────────────────────────────────────
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
            {/* Group Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
              {selectedGroupDetails.avatar_url ? (
                <img
                  src={selectedGroupDetails.avatar_url}
                  alt={selectedGroupDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={32} className="text-slate-400" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                {selectedGroupDetails.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {selectedGroupDetails.status === "archived"
                    ? "Archived"
                    : selectedGroupDetails.is_locked
                      ? "Locked"
                      : "Active"}
                </span>
                {selectedGroupDetails.is_primary && (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[9px] font-bold">
                    Primary
                  </span>
                )}
              </div>
            </div>
          </div>
          {selectedGroupDetails.bio && (
            <p className="text-sm text-slate-500 mt-2 max-w-2xl">
              {selectedGroupDetails.bio}
            </p>
          )}
        </div>

        <div className="flex items-center gap-8 border-b border-slate-100">
          <button className="pb-4 px-1 text-sm font-bold text-slate-900 border-b-2 border-emerald-500">
            Group details
          </button>
          <button
            onClick={async () => {
              await fetchGroupAdmins(selectedGroupDetails.id);
              // Wait a bit for state to update
              setTimeout(() => {
                const adminNames = groupAdmins
                  .map((a) => a.full_name || a.email)
                  .join(", ");
                toast.info(`Admins: ${adminNames || "Only you (Owner)"}`);
              }, 500);
            }}
            className="pb-4 px-1 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Admins ({selectedGroupDetails.admin_count ?? 1})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Details Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Group details
              </span>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingGroup(selectedGroupDetails);
                  setEditGroupName(selectedGroupDetails.name);
                  setEditGroupAvatar(selectedGroupDetails.avatar_url || "");
                  setEditGroupBio(selectedGroupDetails.bio || "");
                }}
                className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl"
              >
                <Edit size={12} className="mr-1" /> Edit
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  Group name
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {selectedGroupDetails.name}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  Group ID
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {selectedGroupDetails.id.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-500">
                  Created
                </span>
                <span className="text-xs text-slate-600">
                  {selectedGroupDetails.created_at
                    ? new Date(
                        selectedGroupDetails.created_at,
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col gap-6 shadow-sm">
            <span className="text-xs font-bold text-slate-400">
              Organization Stats
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                <UsersIcon size={20} className="text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-slate-900">
                  {selectedGroupDetails.admin_count ?? 1}
                </p>
                <p className="text-[10px] font-bold text-slate-400">Admins</p>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-center">
                <Briefcase size={20} className="text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-slate-900">
                  {selectedGroupDetails.contract_count ?? 0}
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Contracts
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Settings Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Invoice settings
              </span>
              <Button
                variant="ghost"
                onClick={() => toast.info("Invoice settings coming soon")}
                className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl"
              >
                Edit
              </Button>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                Finalize invoices
              </span>
              <span className="text-xs font-bold text-slate-900">
                10 days before due date
              </span>
            </div>
          </div>

          {/* General Ledger Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                General ledger account
              </span>
              <Button
                variant="ghost"
                onClick={() =>
                  toast.info("General ledger settings coming soon")
                }
                className="h-8 text-xs font-black border border-slate-200 px-4 rounded-xl"
              >
                Edit
              </Button>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500">
                General ledger account
              </span>
              <span className="text-xs font-bold text-slate-400 italic">
                Not specified
              </span>
            </div>
          </div>

          {/* Expenses Approval Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Expenses approval policies
              </span>
            </div>
            <div className="text-slate-500 text-xs font-medium">
              This expense approval policy affects your employees and
              contractors.
            </div>
            <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-xs font-bold">
              <Info size={16} />
              The approvals policies settings were moved to Expenses &
              adjustments page.
            </div>
          </div>

          {/* Contractors Approval Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col justify-between gap-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Contractors approval policies
              </span>
            </div>
            <div className="text-slate-500 text-xs font-medium">
              Set the policy to approve the submitted adjustments and work.
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100 mt-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Require approval for payment items
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-bold">
                    New
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium max-w-md">
                  If enabled, admins with the necessary permissions will be
                  required to review payment items before they are paid.
                </span>
              </div>
              <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Contractors policy
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-2">
                Default payment items policy
                <MoreVertical size={14} className="text-slate-400" />
              </span>
            </div>
          </div>

          {/* Archive Section */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col gap-4 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                {selectedGroupDetails.status === "archived"
                  ? "Restore this group"
                  : "Archive this group"}
              </span>
            </div>
            <div className="text-slate-500 text-xs font-medium max-w-xl">
              {selectedGroupDetails.status === "archived"
                ? "Restored groups will become active again and visible in your main view."
                : "Archived groups are hidden from your main view but can be accessed by enabling 'Archived' filter on your groups page. You can restore it at any time."}
            </div>
            {/* <Button 
    onClick={async () => {
      if (selectedGroupDetails.is_primary && selectedGroupDetails.status !== "archived") {
        toast.error("Cannot archive primary group. Set another group as primary first.");
        return;
      }
      const newStatus = selectedGroupDetails.status === "archived" ? "active" : "archived";
      await updateGroup(selectedGroupDetails.id, { status: newStatus });
      toast.success(`Group ${newStatus === "archived" ? "archived" : "restored"} successfully`);
      // Manually update the local state
      setSelectedGroupDetails({ ...selectedGroupDetails, status: newStatus });
      // Refresh the groups list from server
      await refreshGroups();
    }}
    className={`${
      selectedGroupDetails.status === "archived" 
        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
        : "bg-white border border-red-200 text-red-600 hover:bg-red-50"
    } px-6 h-12 rounded-2xl font-bold text-xs w-fit shadow-sm`}
  >
    {selectedGroupDetails.status === "archived" ? (
      <><RefreshCw size={14} className="mr-1" /> Restore group</>
    ) : (
      <><Archive size={14} className="mr-1" /> Archive group</>
    )}
  </Button> */}
          </div>

          {/* ── Edit Group Modal ─────────────────────────────────────────────────── */}
          <Dialog
            open={!!editingGroup}
            onOpenChange={(open) => {
              if (!open) setEditingGroup(null);
            }}
          >
            <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tight">
                  Edit group
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Update the organization's core details.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Group name
                  </label>
                  <Input
                    value={editGroupName}
                    onChange={(e) => setEditGroupName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 font-medium text-sm"
                    placeholder="Enter group name..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Group logo
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden text-slate-400">
                      {editGroupAvatar ? (
                        <img
                          src={editGroupAvatar}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
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
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && editingGroup) {
                            // Show loading state
                            toast.loading("Uploading image...");

                            // Upload to Supabase Storage
                            const { uploadGroupAvatar } =
                              await import("@/lib/UploadAvatar");
                            const publicUrl = await uploadGroupAvatar(
                              editingGroup.id,
                              file,
                            );

                            if (publicUrl) {
                              setEditGroupAvatar(publicUrl);
                              toast.dismiss();
                              toast.success("Image uploaded successfully");
                            } else {
                              toast.dismiss();
                              toast.error("Failed to upload image");
                            }
                          }
                        }}
                      />
                      <label
                        htmlFor="group-avatar-upload"
                        className="inline-flex items-center justify-center h-10 px-4 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors uppercase tracking-widest"
                      >
                        Upload Image
                      </label>
                      {editGroupAvatar && (
                        <button
                          onClick={() => setEditGroupAvatar("")}
                          className="ml-2 inline-flex items-center justify-center h-10 px-4 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 ml-1">
                    Recommended: Square image, max 2MB
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Company Bio
                  </label>
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
                      try {
                        await updateGroup(editingGroup.id, {
                          name: editGroupName,
                          avatar_url: editGroupAvatar || null,
                          bio: editGroupBio || undefined,
                        });
                        toast.success("Group details updated successfully");
                        setEditingGroup(null);
                      } catch {
                        toast.error("Failed to update group");
                      }
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
      </div>
    );
  }

  // ── Main Groups List View ──────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#1A1C21] tracking-tight">
          Groups
        </h1>
        <p className="text-sm font-medium text-slate-400">
          Define working groups that reflect the organization's structure
        </p>
      </div>

      {/* Suggestion Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#E0E7FF] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-indigo-200 group">
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="text-[10px] font-bold text-indigo-600">
            Suggested for you
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Avoid costly missteps
          </h2>
          <p className="text-slate-600 font-medium leading-relaxed">
            Unclear contractor status? Haraka's quick risk assessment helps you
            stay compliant in 150+ countries—before issues arise.
          </p>
          <Button className="bg-[#1A1C21] hover:bg-black text-white px-8 py-6 rounded-2xl flex items-center gap-2 group/btn">
            Take the assessment{" "}
            <ExternalLink
              size={16}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </Button>
        </div>
        <div className="relative w-full md:w-96 h-48 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm p-4 hidden lg:block overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
          <div className="relative flex flex-col gap-4">
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
        <button className="pb-4 px-1 text-sm font-black text-slate-900 border-b-2 border-emerald-500">
          Groups
        </button>
        <button className="pb-4 px-1 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors">
          Dynamic groups
        </button>
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
          <p className="text-[10px] font-bold text-slate-400">
            Total {groups.length} item{groups.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400">
                  Group
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400">
                  Admins assigned
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400">
                  Contracts
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGroups.map((group) => (
                <tr
                  key={group.id}
                  className="hover:bg-slate-50/50 transition-colors group/row"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-400">
                        {group.avatar_url ? (
                          <img
                            src={group.avatar_url}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building2 size={20} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900">
                            {group.name}
                          </p>
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
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${
                        group.status === "archived"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : group.status === "deleted"
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : group.is_locked
                              ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {group.status === "archived"
                        ? "Archived"
                        : group.status === "deleted"
                          ? "Deleted"
                          : group.is_locked
                            ? "Locked"
                            : "Active"}
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
                      <DropdownMenuContent
                        align="end"
                        className="w-52 p-2 rounded-2xl shadow-2xl border-[var(--border-color)] bg-white"
                      >
                        {/* Invite admin — always available for active groups */}
                        {group.status === "active" && !group.is_locked && (
                          <DropdownMenuItem
                            onClick={() => {
                              setInviteModalGroup(group);
                              setInviteEmail("");
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-[#A079FF]/5 hover:text-[#A079FF] transition-all text-xs font-bold"
                          >
                            <Mail size={14} /> Invite admin
                          </DropdownMenuItem>
                        )}

                        {!group.is_primary &&
                          group.status !== "archived" &&
                          group.status !== "deleted" && (
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
                        {group.status !== "archived" &&
                          group.status !== "deleted" &&
                          !group.is_locked && (
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingGroup(group);
                                setEditGroupName(group.name);
                                setEditGroupAvatar(group.avatar_url || "");
                                setEditGroupBio(group.bio || "");
                              }}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all text-xs font-bold"
                            >
                              <Edit size={14} /> Edit group
                            </DropdownMenuItem>
                          )}
                        {group.status !== "archived" &&
                          group.status !== "deleted" && (
                            <DropdownMenuItem
                              onClick={() =>
                                updateGroup(group.id, {
                                  is_locked: !group.is_locked,
                                })
                              }
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-indigo-500/5 hover:text-indigo-600 transition-all text-xs font-bold"
                            >
                              {group.is_locked ? (
                                <Unlock size={14} />
                              ) : (
                                <Lock size={14} />
                              )}
                              {group.is_locked ? "Unlock group" : "Lock group"}
                            </DropdownMenuItem>
                          )}
                        {!group.is_locked && group.status === "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateGroup(group.id, { status: "archived" })
                            }
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-amber-500/5 hover:text-amber-600 transition-all text-xs font-bold"
                          >
                            <Archive size={14} /> Archive group
                          </DropdownMenuItem>
                        )}
                        {group.status === "archived" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateGroup(group.id, { status: "active" })
                            }
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-slate-600 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all text-xs font-bold"
                          >
                            <RefreshCw size={14} /> Restore group
                          </DropdownMenuItem>
                        )}
                        {!group.is_primary &&
                          !group.is_locked &&
                          group.status !== "deleted" && (
                            <DropdownMenuItem
                              onClick={() => setGroupToDelete(group)}
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
              <p className="text-sm font-black text-slate-900">
                No organizations found
              </p>
              <p className="text-xs text-slate-400 font-medium">
                Try a different search term or create a new group
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Group Modal ───────────────────────────────────────────────── */}
      <Dialog
        open={isCreateModalOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal();
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[850px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 border-slate-200 flex flex-col md:flex-row gap-10 font-sans text-[#1A1C21]">
          {/* Left: Step Content */}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Create group
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1">
                For your organization
              </p>
            </div>

            {/* Step 1 — Define settings */}
            {createStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">
                    Group name
                  </label>
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
                      settingsType === "manual"
                        ? "border-slate-900 bg-slate-50/50"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${settingsType === "manual" ? "border-slate-900" : "border-slate-300"}`}
                    >
                      {settingsType === "manual" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        Configure manually
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Manually configure payment methods, approval rules, and
                        assign admins.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setSettingsType("replicate")}
                    className={`p-5 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                      settingsType === "replicate"
                        ? "border-slate-900 bg-slate-50/50"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${settingsType === "replicate" ? "border-slate-900" : "border-slate-300"}`}
                    >
                      {settingsType === "replicate" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900">
                          Replicate existing group settings
                        </p>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8px] font-bold">
                          New
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Select a group and replicate its settings, including
                        admin roles, rules, and payment approvals.
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
                      <span>
                        For the moment, the group's settings can only be
                        replicated, not edited. This does not include contracts.
                      </span>
                    </div>
                    <select
                      value={replicateFromGroupId}
                      onChange={(e) => setReplicateFromGroupId(e.target.value)}
                      className="w-full h-14 rounded-2xl border-2 border-slate-200 px-4 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="" disabled>
                        Select a group
                      </option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => setCreateStep(2)}
                    disabled={
                      !newGroupName.trim() ||
                      (settingsType === "replicate" && !replicateFromGroupId)
                    }
                    className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 — Invite admins (email-only) */}
            {createStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Invite admin
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Send a personalized email invite to an admin. You can add
                    more admins after the group is created.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1">
                    Admin email address
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="admin@company.com"
                        className="pl-12 h-12 border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
                  <Info size={14} className="shrink-0" />
                  <span>
                    All organization admins are already part of this group by
                    default. You can invite additional admins here or from the
                    group's settings after creation.
                  </span>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setCreateStep(1)}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    ← Back
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setCreateStep(3)}
                      className="text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={() => setCreateStep(3)}
                      className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Review & create */}
            {createStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-slate-50/30 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-slate-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {newGroupName}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        Ready for creation
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                    {settingsType === "replicate"
                      ? "Replicated settings"
                      : "Manual setup"}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
                  <Info size={14} className="shrink-0" />
                  <span>
                    Organization admins are automatically assigned to this
                    group. You can invite additional admins from the group
                    settings after creation.
                  </span>
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
            {[
              { step: 1, label: "Define settings" },
              { step: 2, label: "Invite admin" },
              { step: 3, label: "Review & create" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                    createStep > step
                      ? "bg-emerald-500 text-white"
                      : createStep === step
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {createStep > step ? "✓" : step}
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-[8px] font-black uppercase tracking-widest ${
                      createStep > step
                        ? "text-emerald-600"
                        : createStep === step
                          ? "text-slate-900"
                          : "text-slate-400"
                    }`}
                  >
                    {createStep > step
                      ? "COMPLETED"
                      : createStep === step
                        ? "IN PROGRESS"
                        : "WAITING"}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={closeCreateModal}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>

      {/* ── Invite Admin Modal ───────────────────────────────────────────────── */}
      <Dialog
        open={!!inviteModalGroup}
        onOpenChange={(open) => {
          if (!open) {
            setInviteModalGroup(null);
            setInviteEmail("");
          }
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[480px] rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#A079FF]/10 flex items-center justify-center mb-2">
              <Mail className="w-6 h-6 text-[#A079FF]" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Invite admin</h3>
            <p className="text-xs text-slate-400 font-medium">
              Invite an admin to{" "}
              <span className="font-black text-slate-700">
                {inviteModalGroup?.name}
              </span>
              . They'll receive a personalized email with a secure link to join.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="email"
                placeholder="admin@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInviteAdmin();
                }}
                className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-[#A079FF] focus:ring-[#A079FF]/20 font-bold text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-start gap-3 bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl text-indigo-600 text-[10px] font-bold">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              The invitation link will expire in 7 days. The invited admin will
              need to sign up or log in to accept the invitation.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setInviteModalGroup(null);
                setInviteEmail("");
              }}
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteAdmin}
              disabled={isInviting || !inviteEmail.trim()}
              className="bg-[#1A1C21] hover:bg-black text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              {isInviting ? (
                "Sending..."
              ) : (
                <>
                  <Send size={14} /> Send invite
                </>
              )}
            </Button>
          </div>

          <button
            onClick={() => {
              setInviteModalGroup(null);
              setInviteEmail("");
            }}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>

      {/* ── Edit Group Modal ─────────────────────────────────────────────────── */}
      <Dialog
        open={!!editingGroup}
        onOpenChange={(open) => {
          if (!open) setEditingGroup(null);
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[450px] max-h-[90vh] overflow-y-auto rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Edit group</h3>
            <p className="text-xs text-slate-400 font-medium">
              Update the organization's core details.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Group name
              </label>
              <Input
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 font-medium text-sm"
                placeholder="Enter group name..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Group logo
              </label>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden text-slate-400">
                  {editGroupAvatar ? (
                    <img
                      src={editGroupAvatar}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
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
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file && editingGroup) {
                        // Show loading state
                        toast.loading("Uploading image...");

                        // Upload to Supabase Storage
                        const { uploadGroupAvatar } =
                          await import("@/lib/UploadAvatar");
                        const publicUrl = await uploadGroupAvatar(
                          editingGroup.id,
                          file,
                        );

                        if (publicUrl) {
                          setEditGroupAvatar(publicUrl);
                          toast.dismiss();
                          toast.success("Image uploaded successfully");
                        } else {
                          toast.dismiss();
                          toast.error("Failed to upload image");
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="group-avatar-upload"
                    className="inline-flex items-center justify-center h-10 px-4 bg-[#1A1C21] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer transition-colors uppercase tracking-widest"
                  >
                    Upload Image
                  </label>
                  {editGroupAvatar && (
                    <button
                      onClick={() => setEditGroupAvatar("")}
                      className="ml-2 inline-flex items-center justify-center h-10 px-4 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 ml-1">
                Recommended: Square image, max 2MB
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Company Bio
              </label>
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
                  try {
                    await updateGroup(editingGroup.id, {
                      name: editGroupName,
                      avatar_url: editGroupAvatar || null,
                      bio: editGroupBio || undefined,
                    });
                    toast.success("Group details updated successfully");
                    setEditingGroup(null);
                  } catch {
                    toast.error("Failed to update group");
                  }
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
      {/* ── Invite Link Modal ───────────────────────────────────────────────── */}
<Dialog open={showInviteLinkModal} onOpenChange={(open) => { if (!open) { setShowInviteLinkModal(false); setCopied(false); } }}>
  <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[500px] rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
    <div className="space-y-2">
      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-2">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 className="text-xl font-black tracking-tight">Invitation Created!</h3>
      <p className="text-xs text-slate-500 font-medium">
        Share this link with the person you want to invite. The link will expire in 7 days.
      </p>
    </div>

    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invitation Link</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-600 break-all font-mono">{inviteLink}</p>
        </div>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
          }}
          className="h-12 px-4 bg-[#1A1C21] hover:bg-black text-white rounded-xl"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </Button>
      </div>
    </div>

    <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl text-amber-700 text-[10px] font-bold">
      <Info size={14} className="shrink-0 mt-0.5" />
      <span>
        You can also send this link via email. The invited person will need to create an account or log in to accept the invitation.
      </span>
    </div>

    <div className="flex items-center justify-end gap-3 pt-2">
      <Button
        onClick={() => {
          setShowInviteLinkModal(false);
          setCopied(false);
        }}
        className="bg-[#1A1C21] hover:bg-black text-white h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest"
      >
        Close
      </Button>
    </div>

    <button
      onClick={() => {
        setShowInviteLinkModal(false);
        setCopied(false);
      }}
      className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
    >
      <X size={20} />
    </button>
  </DialogContent>
</Dialog>
      {/* ── Delete Group Confirmation Modal ────────────────────────────────────────*/}
      <Dialog
        open={!!groupToDelete}
        onOpenChange={(open) => {
          if (!open) setGroupToDelete(null);
        }}
      >
        <DialogContent className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:max-w-[450px] rounded-[2rem] p-10 border-slate-200 flex flex-col gap-6 font-sans text-[#1A1C21] bg-white">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-2">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              Delete organization?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Are you sure you want to delete{" "}
              <span className="font-black text-slate-900">
                {groupToDelete?.name}
              </span>
              ?
            </p>
            <p className="text-xs text-slate-400 font-medium">
              This action cannot be undone. All data associated with this
              organization will be permanently removed.
            </p>
          </div>

          {groupToDelete?.is_primary && groups.length > 1 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-700 text-[10px] font-bold">
              <Info size={14} className="shrink-0 mt-0.5" />
              <span>
                This is your primary organization. Please set another
                organization as primary before deleting.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setGroupToDelete(null)}
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!groupToDelete) return;

                // Check if it's primary with other groups
                if (groupToDelete.is_primary && groups.length > 1) {
                  toast.error(
                    "Cannot delete primary group. Set another group as primary first.",
                  );
                  setGroupToDelete(null);
                  return;
                }

                setIsDeleting(true);
                const result = await deleteGroup(groupToDelete.id);
                setIsDeleting(false);

                if (result.success) {
                  toast.success(`${groupToDelete.name} has been deleted`);
                  setGroupToDelete(null);
                } else {
                  toast.error(result.error || "Failed to delete group");
                }
              }}
              disabled={
                isDeleting || (groupToDelete?.is_primary && groups.length > 1)
              }
              className="bg-red-600 hover:bg-red-700 text-white h-12 px-8 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2"
            >
              {isDeleting ? (
                "Deleting..."
              ) : (
                <>
                  <Trash2 size={14} /> Delete permanently
                </>
              )}
            </Button>
          </div>

          <button
            onClick={() => setGroupToDelete(null)}
            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
