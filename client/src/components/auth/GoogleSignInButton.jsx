import { useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";
import env from "../../config/env";

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(Boolean(window.google?.accounts?.id));
  const clientId = env.googleClientId;

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return undefined;
    }

    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      const handleLoad = () => setScriptReady(true);
      existing.addEventListener("load", handleLoad);
      return () => existing.removeEventListener("load", handleLoad);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => onError?.("Unable to load Google Sign-In. Please try again.");
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [onError]);

  useEffect(() => {
    if (!scriptReady || !clientId || !buttonRef.current || !window.google?.accounts?.id) return undefined;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (!response?.credential) {
            onError?.("Google did not return a valid sign-in credential.");
            return;
          }
          onSuccess?.(response.credential);
        },
        ux_mode: "popup",
      });

      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.min(420, buttonRef.current.clientWidth || 420),
        logo_alignment: "left",
      });
    } catch (error) {
      console.error("Google Sign-In initialization failed:", error);
      onError?.("Unable to initialize Google Sign-In.");
    }

    return () => {
      window.google?.accounts?.id?.cancel?.();
    };
  }, [clientId, onError, onSuccess, scriptReady]);

  if (!clientId) {
    return (
      <Alert severity="info">
        Google Sign-In is not configured yet. Add <strong>VITE_GOOGLE_CLIENT_ID</strong> to the client environment file.
      </Alert>
    );
  }

  return <Box ref={buttonRef} sx={{ width: "100%", minHeight: 44, display: "flex", justifyContent: "center" }} />;
};

export default GoogleSignInButton;
