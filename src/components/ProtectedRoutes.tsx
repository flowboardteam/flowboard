import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn } = useAuth();

  useEffect(() => {
    const checkUser = () => {
      const isTalentPath = location.pathname.startsWith("/talent");
      const isClientPath = location.pathname.startsWith("/client");

      if (!isClerkLoaded) return;

      if (isTalentPath && !isClerkSignedIn) {
        navigate("/talent/login", { replace: true });
        return;
      }

      if (isClientPath && !isClerkSignedIn) {
        navigate("/client/login", { replace: true });
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate, location.pathname, isClerkLoaded, isClerkSignedIn]);

  if (loading || !isClerkLoaded) {
    const isClientPath = location.pathname.startsWith("/client");
    return (
      <div className={`h-screen w-full flex items-center justify-center ${isClientPath ? "bg-[#0A1229]" : "bg-[#050B1E]"}`}>
        <Loader2 className={`w-10 h-10 animate-spin ${isClientPath ? "text-indigo-500" : "text-emerald-500"}`} />
      </div>
    );
  }

  return <>{children}</>;
};