// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

// ❌ DO NOT use alias (@) in production build unless properly configured
// ❌ DO NOT import next-themes based sonner wrapper if not installed
// ✅ Use direct relative path
import { Toaster } from "./components/ui/sonner";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
