import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-20"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to home
      </Link>
      <div className="w-full max-w-md space-y-8 bg-card border border-border/40 shadow-sm rounded-2xl p-6 sm:p-10 z-10 relative">
        {children}
      </div>
    </div>
  );
}
