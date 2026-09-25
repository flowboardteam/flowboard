import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import "./index.css";

const hostname = typeof window !== "undefined" ? window.location.hostname : "";

const isLocalhost =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("172.");

// Keys configuration
const TALENT_PROD_KEY =
  import.meta.env.VITE_CLERK_TALENT_PUBLISHABLE_KEY ||
  "pk_live_Y2xlcmsuZmxvd2JvYXJkLnRlYW0k";

const CLIENT_PROD_KEY =
  import.meta.env.VITE_CLERK_CLIENT_PUBLISHABLE_KEY ||
  "pk_live_Y2xlcmsuYXBwLmZsb3dib2FyZC50ZWFtJA";

const DEV_KEY =
  import.meta.env.VITE_CLERK_DEV_PUBLISHABLE_KEY ||
  "pk_test_bXVzaWNhbC1nb3NoYXdrLTIxOTguY2xlcmsuYWNjb3VudHMuZGV2JA";

// Determine domain portal mode
const isTalentDomain = hostname.includes("talent") || hostname.includes("talents");
const isClientDomain = hostname.includes("client") || hostname.includes("clients");

let PUBLISHABLE_KEY = DEV_KEY;
if (!isLocalhost) {
  if (isTalentDomain) {
    PUBLISHABLE_KEY = TALENT_PROD_KEY;
  } else if (isClientDomain) {
    PUBLISHABLE_KEY = CLIENT_PROD_KEY;
  } else {
    // Default fallback to Client key or generic key
    PUBLISHABLE_KEY = CLIENT_PROD_KEY;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </ErrorBoundary>
);


