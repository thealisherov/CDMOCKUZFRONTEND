"use client";

import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/components/LanguageContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Toaster } from "react-hot-toast";

// Lazy load TelegramPromo — it's not critical for initial render
const TelegramPromo = dynamic(() => import("@/components/TelegramPromo"), {
  ssr: false,
});

export function Providers({ children }) {
  const pathname = usePathname();
  // O'quv Markaz bo'limi Supabase auth ISHLATMAYDI (markaz cookie sessiyasi bor).
  // AuthProvider u yerda ishga tushsa, auth-js LockManager boshqa tablar bilan
  // lock talashib "Lock broken by another request with the 'steal' option"
  // xatosini chiqaradi — shuning uchun /markaz da uni umuman mount qilmaymiz.
  const isCenterSection = pathname?.startsWith('/markaz');

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange={false}
      >
        <LanguageProvider>
          {isCenterSection ? (
            <>
              {children}
              <Toaster position="bottom-right" reverseOrder={false} />
            </>
          ) : (
            <AuthProvider>
              {children}
              <TelegramPromo />
              <Toaster position="bottom-right" reverseOrder={false} />
            </AuthProvider>
          )}
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}