"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      setMessage("Your password has been successfully updated.");
      setPassword("");
    } catch (err) {
      setError(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your new password below.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 text-green-600 border border-green-200 p-3 rounded-md text-sm flex flex-col gap-3 text-center">
          <span>{message}</span>
          <Link href="/dashboard" className="text-sm border bg-green-600 text-white rounded-md py-2 font-medium hover:bg-green-700 transition">
            Continue to Dashboard
          </Link>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                autoCapitalize="none" 
                autoComplete="new-password"
                autoCorrect="off" 
                disabled={isLoading} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
