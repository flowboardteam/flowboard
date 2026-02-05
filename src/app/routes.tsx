import { Routes, Route } from "react-router-dom";
import TalentSignup from "@/pages/talent/auth/TalentSignup";
import TalentLogin from "@/pages/talent/auth/TalentLogin";
import TalentProfileSetup from "@/pages/talent/profile/TalentProfileSetup";
import TalentProfile from "@/pages/talent/profile/TalentProfile";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/talent/signup" element={<TalentSignup />} />
      <Route path="/talent/login" element={<TalentLogin />} />
      <Route
        path="/talent/profile/setup"
        element={<TalentProfileSetup />}
      />
      <Route path="/talent/profile" element={<TalentProfile />} />
    </Routes>
  );
}
