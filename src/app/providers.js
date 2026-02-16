"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}