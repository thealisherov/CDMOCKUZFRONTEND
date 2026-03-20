"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/components/LanguageContext";
import TelegramPromo from "@/components/TelegramPromo";

export function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <LanguageProvider>
        <AuthProvider>
          {children}
          <TelegramPromo />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}