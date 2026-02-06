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

          {/* --- NEW: Client Redirects to Coming Soon --- */}
          <Route path="/client/login" element={<ComingSoon />} />
          <Route path="/client/signup" element={<ComingSoon />} />
          <Route path="/talent/pay" element={<ComingSoon />} />

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
            <Route index element={<Navigate to="/talent/dashboard" replace />} />
            <Route path="contracts" element={<ContractsDiscovery />} />
            <Route path="dashboard" element={<DashboardIndex />} />
            <Route path="jobs" element={<ApplicationsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            
            {/* Within the dashboard, any "Coming Soon" feature uses this element */}
            <Route path="coming-soon" element={<ComingSoon />} />
            
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="settings" element={<ComingSoon />} />
          </Route>

          {/* --- 4. Fallback Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;