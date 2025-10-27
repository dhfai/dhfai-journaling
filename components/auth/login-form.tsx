"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog";

interface LoginFormProps {
  onBack?: () => void;
  onSwitchToRegister?: () => void;
  showButton?: boolean;
}

export function LoginForm({ onBack, onSwitchToRegister, showButton = true }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);

      if (success) {
        window.location.href = '/dashboard';
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 md:mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      )}

      <div className="mb-6 md:mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-sm md:text-base">Login to continue your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 font-medium text-sm md:text-base">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 md:h-14 px-4 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-sm md:text-base"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-gray-300 font-medium text-sm md:text-base">
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs md:text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 md:h-14 px-4 pr-12 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-sm md:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs md:text-sm text-red-300 bg-red-900/20 border border-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4 md:space-y-6 pt-2">
          {showButton ? (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 md:h-14 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          ) : (
            <div className="h-12 md:h-14" />
          )}

          <div className="text-center text-xs md:text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-white hover:text-gray-200 font-medium underline"
            >
              Create one
            </button>
          </div>
        </div>
      </form>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </div>
  );
}
