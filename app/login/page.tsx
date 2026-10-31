"use client";

import { useState } from "react";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // UI only. Supabase authentication will be connected later.
    setMessage(
      "Login interface is ready. Authentication is not connected yet.",
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#151515] px-4 py-10 text-white">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#14E1E6]/5 blur-[100px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#14E1E6]/5 blur-[100px]" />

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#1b1b1b] p-6 shadow-2xl sm:p-10">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6] text-black">
            <Users size={25} strokeWidth={2.5} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide">MEMBERSHIP</h1>

            <p className="text-[10px] tracking-[0.3em] text-[#14E1E6]">
              MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#14E1E6]/20 bg-[#14E1E6]/10 text-[#14E1E6]">
            <LockKeyhole size={25} />
          </div>

          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#14E1E6]">
            ADMIN ACCESS
          </p>

          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Sign in to access your membership management dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#151515] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] focus:ring-2 focus:ring-[#14E1E6]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                  setMessage("");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#151515] py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] focus:ring-2 focus:ring-[#14E1E6]/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-[#14E1E6]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-xl border border-[#14E1E6]/20 bg-[#14E1E6]/5 p-3 text-sm text-[#14E1E6]"
            >
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#14E1E6] py-3.5 text-sm font-bold text-black transition hover:bg-[#0fcbd0] active:scale-[0.99]"
          >
            Sign In
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </form>

        {/* Security Footer */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-[10px] tracking-widest text-gray-600">
            SECURE ADMIN PORTAL
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck size={15} className="text-[#14E1E6]" />
          Authorized administrator access only
        </div>

        <p className="mt-8 text-center text-[11px] text-gray-600">
          © 2026 Membership Management. All rights reserved.
        </p>
      </div>
    </main>
  );
}
