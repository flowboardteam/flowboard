import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail, LogOut, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type PageStatus =
  | "loading"
  | "checking"
  | "success"
  | "error"
  | "wrong-email"
  | "wrong-role";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [invitationEmail, setInvitationEmail] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Prevent the effect from running twice in React StrictMode / re-renders
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    processInvitation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

const processInvitation = async () => {
  try {
    // ── 1. Token must exist ──────────────────────────────────────────────
    if (!token) {
      setStatus("error");
      setErrorMessage("No invitation token provided.");
      return;
    }

    console.log("=== PROCESSING INVITATION ===");
    console.log("Token:", token);

    // ── 2. Look up the invitation ────────────────────────────────────────
    const { data: invitation, error: inviteError } = await supabase
      .from("group_invitations")
      .select("id, group_id, email, status, expires_at, invited_by")
      .eq("token", token)
      .maybeSingle();

    console.log("Invitation lookup result:", { invitation, inviteError });

    if (inviteError) {
      console.error("DB error fetching invitation:", inviteError.message);
      setStatus("error");
      setErrorMessage("Could not verify your invitation. Please try again.");
      return;
    }

    if (!invitation) {
      setStatus("error");
      setErrorMessage("Invalid invitation link. It may have already been used or doesn't exist.");
      return;
    }

    console.log("Invitation found:", invitation);

    // ── 3. Check expiry ──────────────────────────────────────────────────
    if (new Date(invitation.expires_at) < new Date()) {
      setStatus("error");
      setErrorMessage("This invitation has expired. Please ask the admin to send a new one.");
      return;
    }

    // ── 4. Check already accepted ────────────────────────────────────────
    if (invitation.status === "accepted") {
      setStatus("error");
      setErrorMessage("This invitation has already been used.");
      return;
    }

    // ── 5. Fetch the group name ──────────────────────────────────────────
    const { data: group } = await supabase
      .from("groups")
      .select("name, organization_id")
      .eq("id", invitation.group_id)
      .maybeSingle();

    console.log("Group lookup:", group);

    const resolvedGroupName = group?.name ?? "the organization";
    setGroupName(resolvedGroupName);
    setInvitationEmail(invitation.email);

    // ── 6. Check if user is logged in ────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Current user:", user?.email);

    if (!user) {
      setStatus("checking");
      localStorage.setItem("pendingInviteToken", token);
      localStorage.setItem("pendingInviteEmail", invitation.email);
      localStorage.setItem("pendingInviteGroup", resolvedGroupName);

      setTimeout(() => {
        navigate("/client/login", {
          state: {
            fromInvite: true,
            email: invitation.email,
            token,
            groupName: resolvedGroupName,
          },
        });
      }, 1800);
      return;
    }

    setCurrentUserEmail(user.email ?? "");

    // ── 7. Email must match ───────────────────────────────────────────────
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      setStatus("wrong-email");
      return;
    }

    // ── 8. Role must be "client" ─────────────────────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_type")
      .eq("id", user.id)
      .maybeSingle();

    console.log("User profile:", profile);

    if (profile?.role_type !== "client") {
      setStatus("wrong-role");
      return;
    }

    // ── 9. Add user to group_members ─────────────────────────────────────
    console.log("Adding user to group_members...");
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({
        group_id: invitation.group_id,
        user_id: user.id,
        role: "admin",
        invited_by: invitation.invited_by,
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error("Error adding to group_members:", memberError);
      // Don't fail, just log the error
    } else {
      console.log("Successfully added to group_members");
    }

    // ── 10. Update invitation status to accepted ─────────────────────────
    console.log("Updating invitation status...");
    const { error: updateError } = await supabase
      .from("group_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("Error accepting invitation:", updateError.message);
    } else {
      console.log("Invitation status updated to accepted");
    }

    // Clean up any stored pending invite data
    localStorage.removeItem("pendingInviteToken");
    localStorage.removeItem("pendingInviteEmail");
    localStorage.removeItem("pendingInviteGroup");

    setStatus("success");
    toast.success(`You have been added to ${resolvedGroupName}!`);

    setTimeout(() => navigate("/client/dashboard"), 3000);
    
  } catch (err: any) {
    console.error("Unexpected error in processInvitation:", err);
    setStatus("error");
    setErrorMessage("Something went wrong. Please try again or contact support.");
  }
};

  const handleLogoutAndRetry = async () => {
    await supabase.auth.signOut();
    localStorage.setItem("pendingInviteToken", token ?? "");
    localStorage.setItem("pendingInviteEmail", invitationEmail);
    localStorage.setItem("pendingInviteGroup", groupName);
    navigate("/client/login", {
      state: {
        fromInvite: true,
        email: invitationEmail,
        token,
        groupName,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-[#A079FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-[#A079FF] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Verifying invitation…</h2>
            <p className="text-sm text-slate-500">Please wait while we check your invitation.</p>
          </>
        )}

        {/* Not logged in — redirecting */}
        {status === "checking" && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Sign in required</h2>
            <p className="text-sm text-slate-500 mb-4">
              You need a Client account to join{" "}
              <span className="font-bold text-slate-900">{groupName}</span>.
            </p>
            <p className="text-xs text-slate-400">Taking you to the login page…</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Welcome to {groupName}! 🎉
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              You have successfully joined the organization.
            </p>
            <p className="text-xs text-slate-400">Redirecting you to the dashboard…</p>
          </>
        )}

        {/* Wrong email */}
        {status === "wrong-email" && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Wrong account</h2>
            <p className="text-sm text-slate-600 mb-1">
              This invitation was sent to{" "}
              <span className="font-bold text-slate-900">{invitationEmail}</span>.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              You're logged in as{" "}
              <span className="font-medium text-slate-700">{currentUserEmail}</span>.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLogoutAndRetry}
                className="w-full bg-[#1A1C21] hover:bg-black text-white flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Log out & use correct account
              </Button>
              <Button
                onClick={() => navigate("/client/dashboard")}
                variant="ghost"
                className="w-full text-slate-500"
              >
                Go to dashboard instead
              </Button>
            </div>
          </>
        )}

        {/* Wrong role */}
        {status === "wrong-role" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Account type mismatch</h2>
            <p className="text-sm text-slate-600 mb-1">
              This invitation is for a{" "}
              <span className="font-bold text-indigo-600">Client</span> account.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Your current account is a{" "}
              <span className="font-bold text-amber-600">Talent</span> account.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleLogoutAndRetry}
                className="w-full bg-[#1A1C21] hover:bg-black text-white flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Log out & sign up as Client
              </Button>
              <Button
                onClick={() => navigate("/talent/dashboard")}
                variant="ghost"
                className="w-full text-slate-500"
              >
                Go to Talent dashboard
              </Button>
            </div>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Invitation failed</h2>
            <p className="text-sm text-red-500 mb-6">{errorMessage}</p>
            <Button
              onClick={() => navigate("/client/dashboard")}
              className="bg-[#1A1C21] hover:bg-black text-white px-6"
            >
              Go to dashboard
            </Button>
          </>
        )}

      </div>
    </div>
  );
}