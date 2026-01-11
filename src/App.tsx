import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth & Public Pages
import Index from "./pages/Index";
import Signup from "./pages/signup";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/onboarding";

// Dashboard Components
import { ProtectedRoute } from "./components/ProtectedRoutes";
import DashboardLayout from "./pages/dashboard/layout";
import DashboardPage from "./pages/dashboard/page";

// New Feature Pages
import ApplicationsPage from "./pages/dashboard/applications/ApplicationsPage";
// import { SearchJobs } from "./pages/dashboard/search/SearchJobs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShadcnToaster />
      <Sonner position="top-center" richColors closeButton />

      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* These render inside the DashboardLayout's <Outlet /> or children prop */}
            <Route index element={<DashboardPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            {/* <Route path="search" element={<SearchJobs />} /> */}
            
            {/* Add placeholders for your other sidebar menus as you build them */}
            <Route path="jobs" element={<ApplicationsPage />} /> 
            <Route path="profile" element={<div className="text-white p-10">Profile Page Coming Soon</div>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;