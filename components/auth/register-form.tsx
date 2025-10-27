"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Clock } from "lucide-react";
import { AuthService } from "@/services/auth";
import { toast } from "sonner";

interface RegisterFormProps {
  onBack?: () => void;
  onSwitchToLogin?: () => void;
  showButton?: boolean;
}

export function RegisterForm({ onBack, onSwitchToLogin, showButton = true }: RegisterFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiryTime, setOtpExpiryTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Countdown timer effect
  useEffect(() => {
    if (otpExpiryTime > 0) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((otpExpiryTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [otpExpiryTime]);

  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register({
        email,
        username,
        password,
      });

      if (response.success) {
        toast.success("Registration initiated. Please check your email for OTP.");
        setShowOtpForm(true);
        // Set OTP expiry to 5 minutes from now
        setOtpExpiryTime(Date.now() + 5 * 60 * 1000);
      } else {
        setError(response.error || 'Registration failed');
        toast.error(response.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await AuthService.verifyOtp({ email, otp });

      if (response.success) {
        toast.success("Email verified successfully! Please login.");
        onSwitchToLogin?.();
      } else {
        setError(response.error || 'OTP verification failed');
        toast.error(response.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeRemaining > 0) {
      toast.error(`Please wait ${formatTime(timeRemaining)} before requesting a new OTP`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await AuthService.requestOtp(email);
      if (response.success) {
        toast.success("OTP sent to your email!");
        // Reset timer to 5 minutes
        setOtpExpiryTime(Date.now() + 5 * 60 * 1000);
      } else {
        setError(response.error || 'Failed to send OTP');
        toast.error(response.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {showOtpForm ? "Verify Email" : "Create Account"}
        </h2>
        <p className="text-gray-400 text-sm md:text-base">
          {showOtpForm
            ? "Enter the OTP sent to your email"
            : "Start your journaling journey today"}
        </p>
      </div>

      {showOtpForm ? (
        <form onSubmit={handleOtpSubmit} className="space-y-4 md:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-300 font-medium text-sm md:text-base">
              OTP Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              maxLength={6}
              className="h-12 md:h-14 px-4 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-center text-xl md:text-2xl tracking-widest"
            />
          </div>

          {/* Timer Display */}
          {timeRemaining > 0 && (
            <div className="flex items-center justify-center gap-2 text-gray-300 bg-[#4a5568]/50 rounded-lg p-3">
              <Clock size={16} className="md:hidden" />
              <Clock size={18} className="hidden md:block" />
              <span className="text-xs md:text-sm">
                OTP expires in: <span className="font-semibold text-white">{formatTime(timeRemaining)}</span>
              </span>
            </div>
          )}

          {timeRemaining === 0 && (
            <div className="p-3 text-xs md:text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-700 rounded-lg text-center">
              OTP has expired. Please request a new one.
            </div>
          )}

          {error && (
            <div className="p-3 text-xs md:text-sm text-red-300 bg-red-900/20 border border-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
            {showButton ? (
              <Button
                type="submit"
                disabled={isLoading || timeRemaining === 0}
                className="w-full h-12 md:h-14 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : timeRemaining === 0 ? "OTP Expired" : "Verify OTP"}
              </Button>
            ) : (
              <div className="h-12 md:h-14" />
            )}

            <div className="text-center text-xs md:text-sm">
              <span className="text-gray-400">Didn't receive the code?</span>{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={timeRemaining > 0 || isLoading}
                className={`font-medium underline transition-colors ${
                  timeRemaining > 0 || isLoading
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:text-gray-200"
                }`}
              >
                {timeRemaining > 0 ? `Resend in ${formatTime(timeRemaining)}` : "Resend OTP"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-gray-300 font-medium text-sm md:text-base">
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 md:h-14 px-4 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-sm md:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-300 font-medium text-sm md:text-base">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-12 md:h-14 px-4 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-sm md:text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-gray-300 font-medium text-sm md:text-base">
            Password
          </Label>
          <div className="relative">
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-300 font-medium text-sm md:text-base">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 md:h-14 px-4 pr-12 bg-[#4a5568] border-gray-600 text-white placeholder:text-gray-400 rounded-xl focus:border-gray-500 focus:ring-gray-500 text-sm md:text-base"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs md:text-sm text-red-300 bg-red-900/20 border border-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
          {showButton ? (
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 md:h-14 bg-white text-gray-900 hover:bg-gray-100 font-semibold text-base md:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          ) : (
            <div className="h-12 md:h-14" />
          )}

          <div className="text-center text-xs md:text-sm text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-white hover:text-gray-200 font-medium underline"
            >
              Login
            </button>
          </div>
        </div>
      </form>
      )}
    </div>
  );
}
