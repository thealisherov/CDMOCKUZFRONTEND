"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to console for debugging purposes
    console.error("Global Error Captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] p-4 font-sans text-gray-900 dark:text-gray-100">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl text-center border border-gray-100 dark:border-gray-800">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-black mb-3 text-gray-800 dark:text-white">Xatolik yuz berdi!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed font-medium">
          Kechirasiz, sahifani yuklashda g'ayritabiiy texnik nosozlik kuzatildi. Xavotir olmang, ma'lumotlaringiz xavfsiz.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <RefreshCw className="w-4 h-4" />
            Qaytadan urinib ko'rish
          </button>
          
          <button
            onClick={() => {
              // Reset the error boundary before navigating
              reset();
              router.push('/dashboard');
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
          >
            <Home className="w-4 h-4" />
            Asosiy sahifaga qaytish
          </button>
        </div>
        
        {/* Error reference for debugging (subtle UI) */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[10px] text-gray-400 font-mono opacity-60 truncate">
            {error.digest ? `Xato kodi: ${error.digest}` : (error.message || 'Unknown generic error')}
          </p>
        </div>
      </div>
    </div>
  );
}
