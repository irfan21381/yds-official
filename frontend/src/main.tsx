import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
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
