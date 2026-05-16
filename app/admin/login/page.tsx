"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

type View = "login" | "forgot" | "otp" | "success";

export default function LoginPage() {
  const router = useRouter();

  // Login
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  // Forgot / Reset
  const [view,      setView]      = useState<View>("login");
  const [fpEmail,   setFpEmail]   = useState("");
  const [otp,       setOtp]       = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [fpError,   setFpError]   = useState("");
  const [fpSuccess, setFpSuccess] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  // ── Login ────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Send OTP ─────────────────────────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setFpError(""); setFpSuccess(""); setFpLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || "Failed to send OTP. Please check your email address."); return; }
      setFpSuccess(`OTP sent to ${fpEmail}. Check your inbox.`);
      setView("otp");
    } catch {
      setFpError("Network error. Please try again.");
    } finally {
      setFpLoading(false);
    }
  }

  // ── Reset Password ───────────────────────────────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setFpError(""); setFpLoading(true);
    if (newPw !== confirmPw) { setFpError("Passwords do not match"); setFpLoading(false); return; }
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok) { setFpError(data.error || "Reset failed"); return; }
      setView("success");
    } catch {
      setFpError("Network error. Please try again.");
    } finally {
      setFpLoading(false);
    }
  }

  // ── Shared styles ────────────────────────────────────────
  const ic = "w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 text-sm px-10 py-3 focus:outline-none focus:border-white transition-colors";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-md overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SAM Enterprises" className="object-contain w-12 h-12"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest text-white">SAM</span>
              <span className="text-sm font-light tracking-widest text-gray-500 ml-1">ENTERPRISES</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 tracking-widest uppercase mt-2">Admin Panel</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8">

          {/* ── LOGIN VIEW ── */}
          {view === "login" && (
            <>
              <h1 className="text-xl font-black text-white mb-1">Sign In</h1>
              <p className="text-sm text-gray-500 mb-7">Enter your credentials to access the CMS.</p>

              {error && (
                <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 text-sm mb-5">
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" required autoComplete="email"
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="samenterprises2112@gmail.com" className={ic} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showPw ? "text" : "password"} required autoComplete="current-password"
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" className={`${ic} pr-12`} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <button type="button"
                    onClick={() => { setView("forgot"); setFpEmail(email); setFpError(""); setFpSuccess(""); }}
                    className="text-xs text-gray-500 hover:text-white transition-colors underline underline-offset-2">
                    Forgot password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-white text-gray-950 font-black text-sm tracking-widest uppercase py-3.5 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
              <p className="text-xs text-gray-600 text-center mt-8">Protected by JWT authentication. All actions are logged.</p>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === "forgot" && (
            <>
              <button onClick={() => setView("login")}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={13} /> Back to login
              </button>
              <h1 className="text-xl font-black text-white mb-1">Forgot Password</h1>
              <p className="text-sm text-gray-500 mb-7">
                Enter your admin email. We&apos;ll send a 6-digit OTP to reset your password.
              </p>

              {fpError && (
                <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 text-sm mb-5">
                  <AlertCircle size={15} className="shrink-0" /> {fpError}
                </div>
              )}

              <form onSubmit={handleForgot} className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">Admin Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                      placeholder="samenterprises2112@gmail.com" className={ic} />
                  </div>
                </div>
                <button type="submit" disabled={fpLoading}
                  className="w-full bg-white text-gray-950 font-black text-sm tracking-widest uppercase py-3.5 hover:bg-gray-100 transition-colors disabled:opacity-50">
                  {fpLoading ? "Sending OTP…" : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {/* ── OTP + NEW PASSWORD VIEW ── */}
          {view === "otp" && (
            <>
              <button onClick={() => setView("forgot")}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={13} /> Change email
              </button>
              <h1 className="text-xl font-black text-white mb-1">Reset Password</h1>
              <p className="text-sm text-gray-500 mb-7">
                Enter the OTP sent to{" "}
                <span className="text-white font-semibold">{fpEmail}</span>{" "}
                and choose a new password.
              </p>

              {fpError && (
                <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 text-sm mb-5">
                  <AlertCircle size={15} className="shrink-0" /> {fpError}
                </div>
              )}
              {fpSuccess && (
                <div className="flex items-center gap-3 bg-green-950/50 border border-green-800 text-green-300 px-4 py-3 text-sm mb-5">
                  <CheckCircle size={15} className="shrink-0" /> {fpSuccess}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">6-Digit OTP</label>
                  <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456" maxLength={6} required
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder:text-gray-600 text-2xl font-black tracking-[0.5em] text-center py-4 focus:outline-none focus:border-white transition-colors" />
                  <p className="text-xs text-gray-600 mt-1.5">OTP expires in 15 minutes.</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type={showNewPw ? "text" : "password"} required minLength={8}
                      value={newPw} onChange={e => setNewPw(e.target.value)}
                      placeholder="Min. 8 characters" className={`${ic} pr-12`} />
                    <button type="button" onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 tracking-widest uppercase block mb-2">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="password" required
                      value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                      placeholder="Repeat new password" className={ic} />
                  </div>
                  {newPw && confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={fpLoading}
                  className="w-full bg-white text-gray-950 font-black text-sm tracking-widest uppercase py-3.5 hover:bg-gray-100 transition-colors disabled:opacity-50">
                  {fpLoading ? "Resetting…" : "Reset Password"}
                </button>

                <button type="button" onClick={handleForgot} disabled={fpLoading}
                  className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1">
                  Didn&apos;t receive OTP? Resend
                </button>
              </form>
            </>
          )}

          {/* ── SUCCESS VIEW ── */}
          {view === "success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h2 className="text-lg font-black text-white mb-2">Password Reset!</h2>
              <p className="text-sm text-gray-500 mb-6">
                Your password has been reset successfully. Please sign in with your new password.
              </p>
              <button onClick={() => { setView("login"); setEmail(fpEmail); setPassword(""); }}
                className="w-full bg-white text-gray-950 font-black text-sm tracking-widest uppercase py-3.5 hover:bg-gray-100 transition-colors">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
