import { supabase } from "./supabase";

export interface EORSettings {
  country: string;
  countryCode: string;
  entity: string;
  benefitsTier: string;
  probationPeriod?: string;
  noticePeriod?: string;
}

export interface ContractorSettings {
  agreementType: "Monthly Retainer" | "Hourly" | "Fixed Scope";
  paymentTerms: "Net 0" | "Net 15" | "Net 30" | "Bi-weekly";
  rateUnit: string;
  sowDescription?: string;
  complianceStatus: "Verified" | "In Review" | "Action Required";
}

export type EmploymentModel = "eor" | "contractor" | "direct";

export interface UnifiedWorkforceMember {
  id: string;
  organization_id?: string;
  group_id?: string | null;
  full_name: string;
  email: string | null;
  role_title: string | null;
  department: string | null;
  location: string | null;
  start_date: string | null;
  payment_monthly: number | null;
  payment_currency: string;
  employment_model: EmploymentModel;
  status: "Active" | "Onboarding" | "In Review" | "Paused";
  eor_settings?: EORSettings;
  contractor_settings?: ContractorSettings;
  created_at: string;
}

const STORAGE_KEY = "flowboard_unified_workforce_v2";

export const COUNTRY_LIST = [
  { name: "Nigeria", code: "NG", flag: "🇳🇬", currency: "USD", localCurrency: "NGN", entity: "Flowboard Global EOR (Nigeria)" },
  { name: "Ghana", code: "GH", flag: "🇬🇭", currency: "USD", localCurrency: "GHS", entity: "Flowboard West Africa EOR" },
  { name: "Kenya", code: "KE", flag: "🇰🇪", currency: "USD", localCurrency: "KES", entity: "Flowboard East Africa EOR Ltd" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", currency: "ZAR", localCurrency: "ZAR", entity: "Flowboard South Africa EOR" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP", localCurrency: "GBP", entity: "Flowboard Europe EOR Ltd" },
  { name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR", localCurrency: "EUR", entity: "Flowboard EU Direct GmbH" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", currency: "USD", localCurrency: "BRL", entity: "Flowboard LATAM EOR" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", currency: "USD", localCurrency: "PHP", entity: "Flowboard APAC EOR" },
  { name: "Egypt", code: "EG", flag: "🇪🇬", currency: "USD", localCurrency: "EGP", entity: "Flowboard North Africa EOR" },
  { name: "United States", code: "US", flag: "🇺🇸", currency: "USD", localCurrency: "USD", entity: "Flowboard Inc. (US Domestic)" },
  { name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD", localCurrency: "CAD", entity: "Flowboard Canada EOR" },
  { name: "India", code: "IN", flag: "🇮🇳", currency: "USD", localCurrency: "INR", entity: "Flowboard South Asia EOR" },
  { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED", localCurrency: "AED", entity: "Flowboard Middle East FZ-LLC" },
  { name: "Rwanda", code: "RW", flag: "🇷🇼", currency: "USD", localCurrency: "RWF", entity: "Flowboard East Africa (Rwanda)" },
];

export const CURRENCY_LIST = [
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "NGN", symbol: "₦", label: "NGN (₦) - Nigerian Naira" },
  { code: "GHS", symbol: "GH₵", label: "GHS (GH₵) - Ghanaian Cedi" },
  { code: "KES", symbol: "KSh", label: "KES (KSh) - Kenyan Shilling" },
  { code: "ZAR", symbol: "R", label: "ZAR (R) - South African Rand" },
  { code: "BRL", symbol: "R$", label: "BRL (R$) - Brazilian Real" },
  { code: "PHP", symbol: "₱", label: "PHP (₱) - Philippine Peso" },
  { code: "CAD", symbol: "CA$", label: "CAD (CA$) - Canadian Dollar" },
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "AED", symbol: "AED", label: "AED - UAE Dirham" },
];

export function getStoredMembers(): UnifiedWorkforceMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredMembers(members: UnifiedWorkforceMember[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    window.dispatchEvent(new CustomEvent("workforce_updated", { detail: { count: members.length } }));
  } catch (e) {
    console.warn("Error saving to local storage:", e);
  }
}

export async function fetchUnifiedWorkforce(groupId?: string | null): Promise<UnifiedWorkforceMember[]> {
  const localList = getStoredMembers();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return localList;

    let query = supabase
      .from("workforce_members")
      .select("*")
      .eq("organization_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data: dbMembers, error } = await query;
    if (error || !dbMembers) {
      return localList;
    }

    // Merge DB members with metadata from notes or local cache
    const merged: UnifiedWorkforceMember[] = dbMembers.map((m: any) => {
      let meta: any = {};
      if (m.notes) {
        try {
          meta = JSON.parse(m.notes);
        } catch {
          meta = {};
        }
      }

      // Check local cache for richer metadata if present
      const localMatch = localList.find((l) => l.id === m.id);

      const employment_model: EmploymentModel =
        meta.employment_model ||
        localMatch?.employment_model ||
        (m.member_type === "hired_contract" ? "contractor" : "eor");

      return {
        id: m.id,
        organization_id: m.organization_id,
        group_id: m.group_id,
        full_name: m.full_name,
        email: m.email,
        role_title: m.role_title,
        department: m.department || meta.department || "Engineering",
        location: m.location || meta.country || "Global",
        start_date: m.start_date,
        payment_monthly: m.payment_monthly,
        payment_currency: m.payment_currency || "USD",
        employment_model,
        status: meta.status || localMatch?.status || (m.is_active ? "Active" : "Onboarding"),
        eor_settings: meta.eor_settings || localMatch?.eor_settings || (employment_model === "eor" ? {
          country: m.location?.replace("Remote (", "").replace(")", "") || "Nigeria",
          countryCode: "NG",
          entity: "Flowboard Global EOR",
          benefitsTier: "Standard Statutory + Pension"
        } : undefined),
        contractor_settings: meta.contractor_settings || localMatch?.contractor_settings || (employment_model === "contractor" ? {
          agreementType: "Monthly Retainer",
          paymentTerms: "Net 0",
          rateUnit: "/month",
          complianceStatus: "Verified"
        } : undefined),
        created_at: m.created_at || new Date().toISOString()
      };
    });

    // Also include any local-only members that haven't synced yet
    const dbIds = new Set(merged.map((m) => m.id));
    const localOnly = localList.filter((l) => !dbIds.has(l.id));
    const result = [...merged, ...localOnly];

    // Keep localStorage updated with canonical merged
    saveStoredMembers(result);
    return result;
  } catch (err) {
    console.warn("fetchUnifiedWorkforce error:", err);
    return localList;
  }
}

export async function addUnifiedMember(member: Omit<UnifiedWorkforceMember, "id" | "created_at">): Promise<UnifiedWorkforceMember> {
  const newId = `WF-${Date.now()}`;
  const now = new Date().toISOString();

  const completeMember: UnifiedWorkforceMember = {
    ...member,
    id: newId,
    created_at: now
  };

  // 1. Optimistic Local Save
  const current = getStoredMembers();
  const updated = [completeMember, ...current];
  saveStoredMembers(updated);

  // 2. Persist to Supabase if authenticated
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const notesJson = JSON.stringify({
        employment_model: member.employment_model,
        eor_settings: member.eor_settings,
        contractor_settings: member.contractor_settings,
        status: member.status,
        department: member.department
      });

      const member_type =
        member.employment_model === "contractor"
          ? "hired_contract"
          : member.employment_model === "eor"
          ? "employee"
          : "hired_full_time";

      const { data: dbInserted, error } = await supabase.from("workforce_members").insert({
        organization_id: user.id,
        group_id: member.group_id || null,
        full_name: member.full_name,
        email: member.email,
        role_title: member.role_title,
        location: member.location || member.eor_settings?.country || "Global",
        department: member.department,
        member_type,
        start_date: member.start_date || new Date().toISOString().split("T")[0],
        payment_monthly: member.payment_monthly,
        payment_currency: member.payment_currency || "USD",
        is_active: true,
        online_status: "online",
        availability_status: "available",
        notes: notesJson
      }).select().single();

      if (!error && dbInserted) {
        completeMember.id = dbInserted.id;
        // update id in local storage
        const refreshed = getStoredMembers().map((m) => (m.id === newId ? { ...m, id: dbInserted.id } : m));
        saveStoredMembers(refreshed);
      }
    }
  } catch (e) {
    console.warn("Error inserting to Supabase:", e);
  }

  return completeMember;
}

export async function deleteUnifiedMember(id: string): Promise<void> {
  const current = getStoredMembers();
  const filtered = current.filter((m) => m.id !== id);
  saveStoredMembers(filtered);

  try {
    await supabase.from("workforce_members").update({ is_active: false }).eq("id", id);
  } catch (e) {
    console.warn("Error deactivating in Supabase:", e);
  }
}
