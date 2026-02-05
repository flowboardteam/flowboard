import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Talent Auth Pages
import TalentSignup from "./pages/talent/auth/Signup";
import TalentLogin from "./pages/talent/auth/Login";

// Talent Pages & Layouts
import TalentOnboarding from "./pages/talent/onboarding/index";
import DashboardLayout from "./pages/talent/dashboard/Layout";
import DashboardIndex from "./pages/talent/dashboard/Index";
import ProfileSettings from "./pages/talent/dashboard/Profile"; // Import the real page
import ContractsDiscovery from './pages/talent/contracts/page';

// Dashboard / Other Pages
import ApplicationsPage from "./pages/dashboard/applications/ApplicationsPage";
import ComingSoon from "./pages/dashboard/ComingSoon";

// Components
import { ProtectedRoute } from "./components/ProtectedRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadcnToaster />

      <BrowserRouter>
        <Routes>
          {/* --- 1. Public Routes --- */}
          <Route path="/" element={<Index />} />
          <Route path="/talent/signup" element={<TalentSignup />} />
          <Route path="/talent/login" element={<TalentLogin />} />

          {/* --- 2. Independent Onboarding Path --- */}
          <Route
            path="/talent/onboarding"
            element={
              <ProtectedRoute>
                <TalentOnboarding />
              </ProtectedRoute>
            }
          />

          {/* --- 3. Protected Talent Dashboard System --- */}
          <Route
            path="/talent"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirects /talent directly to the dashboard */}
            <Route index element={<Navigate to="/talent/dashboard" replace />} />

            <Route path="contracts" element={<ContractsDiscovery />} />
            
            <Route path="dashboard" element={<DashboardIndex />} />
            <Route path="jobs" element={<ApplicationsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="coming-soon" element={<ComingSoon />} />
            
            {/* --- THE REAL PROFILE PAGE --- */}
            <Route path="profile" element={<ProfileSettings />} />

            {/* If you need a separate settings page later, you can add it here */}
            <Route path="settings" element={<div className="p-10 text-[var(--text-main)] font-black italic uppercase tracking-tighter text-2xl">App Preferences Coming Soon</div>} />
          </Route>

          {/* --- 4. Fallback Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;