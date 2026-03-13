"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email.");
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setMessage("Check your email for a password reset link.");
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 text-green-600 border border-green-200 p-3 rounded-md text-sm text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
            Email
          </label>
          <Input 
            id="email" 
            placeholder="name@example.com" 
            type="email" 
            autoCapitalize="none" 
            autoComplete="email" 
            autoCorrect="off" 
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Sending Link..." : "Send Reset Link"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
