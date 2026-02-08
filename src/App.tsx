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

// --- 3. CLIENT PAGES ---
import ClientOnboarding from "./pages/client/onboarding/index";
import ClientDashboardLayout from "./pages/client/dashboard/Layout";
import ClientDashboardIndex from "./pages/client/dashboard/Index";
import ClientProfileSettings from "./pages/client/dashboard/Profile";
import ClientTalentPool from "./pages/client/talent-pool/index";
import ClientSystemPrefs from "./pages/client/dashboard/SystemPrefs";

// Shared Dash Components
import ApplicationsPage from "./pages/dashboard/applications/ApplicationsPage";
import ComingSoon from "./pages/dashboard/ComingSoon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadcnToaster />
      <BrowserRouter>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Index />} />

          {/* Talent Auth Group */}
          <Route path="/talent/signup" element={<TalentSignup />} />
          <Route path="/talent/login" element={<TalentLogin />} />
          <Route path="/talent/forgot-password" element={<ForgotPassword />} />
          <Route path="/talent/reset-password" element={<ResetPassword />} />

          {/* Client Auth Group */}
          <Route path="/client/signup" element={<ClientSignup />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route
            path="/client/forgot-password"
            element={<ClientForgotPassword />}
          />
          <Route
            path="/client/reset-password"
            element={<ClientResetPassword />}
          />

          {/* ================= ONBOARDING (Force-Protected) ================= */}
          <Route
            path="/talent/onboarding"
            element={
              <ProtectedRoute>
                <TalentOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/onboarding"
            element={
              <ProtectedRoute>
                <ClientOnboarding />
              </ProtectedRoute>
            }
          />

          {/* ================= TALENT PORTAL ================= */}
          <Route
            path="/talent"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/talent/dashboard" replace />}
            />
            <Route path="dashboard" element={<DashboardIndex />} />
            <Route path="contracts" element={<ContractsDiscovery />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="settings" element={<SystemPrefs />} />
            <Route path="pay" element={<ComingSoon />} />
            <Route path="coming-soon" element={<ComingSoon />} />
          </Route>

          {/* ================= CLIENT PORTAL ================= */}
          <Route
            path="/client"
            element={
              <ProtectedRoute>
                <ClientDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/client/dashboard" replace />}
            />
            <Route path="dashboard" element={<ClientDashboardIndex />} />
            <Route path="talent-pool" element={<ClientTalentPool />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="profile" element={<ClientProfileSettings />} />
            <Route path="settings" element={<ClientSystemPrefs />} />
            <Route path="coming-soon" element={<ComingSoon />} />
          </Route>

              <Route path="/:username" element={<TalentPublicProfile />} />
          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
