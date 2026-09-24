import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { shadcn } from "@clerk/ui/themes";
import App from "./App.tsx";
import "./index.css";

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("172."));

const DEV_KEY =
  import.meta.env.VITE_CLERK_DEV_PUBLISHABLE_KEY ||
  "pk_test_bXVzaWNhbC1nb3NoYXdrLTIxOTguY2xlcmsuYWNjb3VudHMuZGV2JA";

const PROD_KEY =
  import.meta.env.VITE_CLERK_CLIENT_PUBLISHABLE_KEY ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_live_Y2xlcmsuYXBwLmZsb3dib2FyZC50ZWFtJA";

const PUBLISHABLE_KEY = isLocalhost ? DEV_KEY : PROD_KEY;

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{ theme: shadcn }}>
    <App />
  </ClerkProvider>
);
