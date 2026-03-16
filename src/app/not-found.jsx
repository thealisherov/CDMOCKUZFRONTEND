"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoveLeft, Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Animated Icon Container */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full animate-ping"></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-full w-full h-full flex items-center justify-center shadow-2xl border border-indigo-100 dark:border-indigo-900/50">
            <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">404</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Page Not Found / Sahifa topilmadi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
            We couldn't find the page you're looking for. It might have been moved, deleted, or you may have mistyped the address.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <MoveLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
