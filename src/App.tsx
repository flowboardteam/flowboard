import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

// --- 1. CORE & AUTH ---
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { TalentPublicProfile } from "./pages/TalentPublicProfile";

// Talent Auth
import TalentSignup from "./pages/talent/auth/Signup";
import TalentLogin from "./pages/talent/auth/Login";
import ForgotPassword from "./pages/talent/auth/ForgotPassword";
import ResetPassword from "./pages/talent/auth/ResetPassword";

// Client Auth
import ClientSignup from "./pages/client/auth/Signup";
import ClientLogin from "./pages/client/auth/Login";
import ClientForgotPassword from "./pages/client/auth/ForgotPassword";
import ClientResetPassword from "./pages/client/auth/ResetPassword";

// --- 2. TALENT PAGES ---
import TalentOnboarding from "./pages/talent/onboarding/index";
import DashboardLayout from "./pages/talent/dashboard/Layout";
import DashboardIndex from "./pages/talent/dashboard/Index";
import ProfileSettings from "./pages/talent/dashboard/Profile";
import ContractsDiscovery from "./pages/talent/contracts/page";
import SystemPrefs from "./pages/talent/dashboard/SystemPrefs";
import TalentOffersPage from "./pages/talent/offers/TalentOffersPage";
import TalentContractChangesPage from "./pages/talent/contract-changes/TalentContractChangesPage";

// --- 3. CLIENT PAGES ---
import ClientOnboarding from "./pages/client/onboarding/index";
import ClientDashboardLayout from "./pages/client/dashboard/Layout";
import ClientDashboardIndex from "./pages/client/dashboard/Index";
import ClientProfileSettings from "./pages/client/dashboard/Profile";
import ClientTalentPool from "./pages/client/talent-pool/index";
import ClientSystemPrefs from "./pages/client/dashboard/SystemPrefs";
import RolesJobsPage from "./pages/client/roles/RolesJobsPage";
import CreateRolePage from "./pages/client/roles/CreateRolePage";
import TalentSourcingPage from "./pages/client/roles/TalentSourcingPage";
import RoleShortlistPage from "./pages/client/roles/RoleShortlistPage";
import ActiveWorkforcePage from "./pages/client/workforce/ActiveWorkforcePage";
import ClientOffersPage from "./pages/client/offers/ClientOffersPage";
import Haraka from "./pages/client/haraka";

// Shared
import ApplicationsPage from "./pages/dashboard/applications/ApplicationsPage";
import ComingSoon from "./pages/dashboard/ComingSoon";
import Shortlist from "./pages/client/shortlist";
import ClientProjectsPage from "./pages/client/project/ClientProjectsPage";
import TalentProjectPage from "./pages/talent/project/TalentProjectPage";

import TermsPage   from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import FAQPage     from "./pages/FAQPage";

// --- 4. PUBLIC MEGA MENU PAGES ---
import ApplicantTracking from "./pages/public/platform/ApplicantTracking";
import QualityAssurance from "./pages/public/platform/QualityAssurance";
import GlobalTalentCloud from "./pages/public/platform/GlobalTalentCloud";
import GlobalPayroll from "./pages/public/platform/GlobalPayroll";

import Startups from "./pages/public/solutions/Startups";
import Enterprises from "./pages/public/solutions/Enterprises";
import RemoteTeams from "./pages/public/solutions/RemoteTeams";
import IntelligentSourcing from "./pages/public/solutions/IntelligentSourcing";
import PerformanceTracking from "./pages/public/solutions/PerformanceTracking";
import ComplianceAutomation from "./pages/public/solutions/ComplianceAutomation";

import CaseStudies from "./pages/public/resources/CaseStudies";
import Videos from "./pages/public/resources/Videos";
import Blog from "./pages/public/resources/Blog";
import Webinars from "./pages/public/resources/Webinars";
import ResourceHub from "./pages/public/resources/ResourceHub";
import PartnerApply from "./pages/public/partners/Apply";
import OpenPositions from "./pages/public/careers/OpenPositions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadcnToaster />
      <BrowserRouter>
        <Routes>

          {/* ── Public ────────────────────────────────────────────── */}
          <Route path="/" element={<Index />} />

          {/* Platform Options */}
          <Route path="/platform/applicant-tracking" element={<ApplicantTracking />} />
          <Route path="/platform/quality-assurance" element={<QualityAssurance />} />
          <Route path="/platform/global-talent-cloud" element={<GlobalTalentCloud />} />
          <Route path="/platform/global-payroll" element={<GlobalPayroll />} />

          {/* Solutions Options */}
          <Route path="/solutions/startups" element={<Startups />} />
          <Route path="/solutions/enterprises" element={<Enterprises />} />
          <Route path="/solutions/remote-teams" element={<RemoteTeams />} />
          <Route path="/solutions/intelligent-sourcing" element={<IntelligentSourcing />} />
          <Route path="/solutions/performance-tracking" element={<PerformanceTracking />} />
          <Route path="/solutions/compliance-automation" element={<ComplianceAutomation />} />

          <Route path="/resources/hub" element={<ResourceHub />} />
          <Route path="/partners/apply" element={<PartnerApply />} />
          <Route path="/careers/open-positions" element={<OpenPositions />} />

          {/* Talent Auth */}
          <Route path="/talent/signup"          element={<TalentSignup />} />
          <Route path="/talent/login"           element={<TalentLogin />} />
          <Route path="/talent/forgot-password" element={<ForgotPassword />} />
          <Route path="/talent/reset-password"  element={<ResetPassword />} />

          <Route path="/terms"   element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq"     element={<FAQPage />} />

          {/* Client Auth */}
          <Route path="/client/signup"          element={<ClientSignup />} />
          <Route path="/client/login"           element={<ClientLogin />} />
          <Route path="/client/forgot-password" element={<ClientForgotPassword />} />
          <Route path="/client/reset-password"  element={<ClientResetPassword />} />

          {/* ── Onboarding ────────────────────────────────────────── */}
          <Route path="/talent/onboarding" element={<ProtectedRoute><TalentOnboarding /></ProtectedRoute>} />
          <Route path="/client/onboarding" element={<ProtectedRoute><ClientOnboarding /></ProtectedRoute>} />

          {/* ── Talent Portal ─────────────────────────────────────── */}
          <Route path="/talent" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index                   element={<Navigate to="/talent/dashboard" replace />} />
            <Route path="dashboard"        element={<DashboardIndex />} />
            <Route path="contracts"        element={<ContractsDiscovery />} />
            <Route path="applications"     element={<ApplicationsPage />} />
            <Route path="profile"          element={<ProfileSettings />} />
            <Route path="settings"         element={<SystemPrefs />} />
            <Route path="offers"           element={<TalentOffersPage />} />
            <Route path="contract-changes" element={<TalentContractChangesPage />} />
            <Route path="project" element={<TalentProjectPage />} />
            
            {/* Placeholders */}
            <Route path="tracker"          element={<ComingSoon />} />
            <Route path="teams"            element={<ComingSoon />} />
            <Route path="payroll"          element={<ComingSoon />} />
            <Route path="compliance"       element={<ComingSoon />} />
            <Route path="apps"             element={<ComingSoon />} />
            <Route path="pay"              element={<ComingSoon />} />
            <Route path="coming-soon"      element={<ComingSoon />} />
          </Route>

          {/* ── Client Portal ─────────────────────────────────────── */}
          <Route path="/client" element={<ProtectedRoute><ClientDashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/client/dashboard" replace />} />

            {/* Core */}
            <Route path="dashboard"    element={<ClientDashboardIndex />} />
            <Route path="profile"      element={<ClientProfileSettings />} />
            <Route path="settings"     element={<ClientSystemPrefs />} />
            <Route path="applications" element={<ApplicationsPage />} />

            {/* Talent & AI */}
            <Route path="haraka"       element={<Haraka />} />
            <Route path="shortlist"    element={<Shortlist />} />
            <Route path="talent-pool"  element={<ClientTalentPool />} />

            {/* Offers sent by org */}
            <Route path="offers"       element={<ClientOffersPage />} />

            {/* Roles & Jobs */}
            <Route path="roles"                   element={<RolesJobsPage />} />
            <Route path="roles/create"            element={<CreateRolePage />} />
            <Route path="roles/:roleId/source"    element={<TalentSourcingPage />} />
            <Route path="roles/:roleId/shortlist" element={<RoleShortlistPage />} />

            {/* Active Workforce */}
            <Route path="workforce"    element={<ActiveWorkforcePage />} />

            <Route path="projects" element={<ClientProjectsPage />} />


            {/* Placeholders */}
            <Route path="tracker"      element={<ComingSoon />} />
            <Route path="teams"        element={<ComingSoon />} />
            <Route path="apps"         element={<ComingSoon />} />
            <Route path="analytics/hiring"       element={<ComingSoon />} />
            <Route path="analytics/performance"  element={<ComingSoon />} />
            <Route path="payroll"      element={<ComingSoon />} />
            <Route path="coming-soon"  element={<ComingSoon />} />
          </Route>

          {/* Public talent profile */}
          <Route path="/:username" element={<TalentPublicProfile />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;