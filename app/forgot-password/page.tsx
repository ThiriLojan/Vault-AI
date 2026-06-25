"use client";

import { useState } from "react";
import Link from "next/link";
import RobotScene, { RobotAction } from "@/components/ui/RobotScene";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [devLink, setDevLink] = useState("");
  const [robotAction, setRobotAction] = useState<RobotAction>("wave");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    setDevLink("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setRobotAction("success");
        setMessage({ text: data.message, type: "success" });
        if (data.devResetUrl) {
          setDevLink(data.devResetUrl);
        }
      } else {
        setRobotAction("error");
        setMessage({ text: data.error || "Failed to process request.", type: "error" });
        setTimeout(() => setRobotAction("idle"), 3000);
      }
    } catch (error) {
      setRobotAction("error");
      setMessage({ text: "Something went wrong. Please try again later.", type: "error" });
      setTimeout(() => setRobotAction("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page active">
      <div className="auth-bg-scene"></div>
      <div className="auth-scanlines"></div>
      <div className="auth-figure-glow" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,183,77,0.07) 0%, transparent 70%)" }}></div>
      
      <div className="auth-figure">
        <RobotScene accentHex={0xffb74d} currentAction={robotAction} />
      </div>

      <div className="auth-topbar">
        <div className="auth-topbar-logo">
          <div className="logo-mark">V</div>
          <div className="logo-text">Vault AI</div>
        </div>
        <div className="auth-topbar-right hidden md:block">Secure Password Recovery</div>
      </div>

      <div className="auth-tagline-wrap">
        <h1 className="auth-tagline">
          Regain your access<br />with <em>confidence.</em>
        </h1>
        <p className="auth-tagline-sub">
          A secure cryptographic process to verify your identity and restore access to your Vault.
        </p>
      </div>

      <div className="auth-form-float relative">
        <Link href="/signin" className="inline-flex items-center text-[10px] text-white/30 hover:text-white/70 transition-colors mb-6 uppercase tracking-widest font-bold">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h2 className="auth-form-title">Reset Password</h2>
        <p className="auth-form-sub">Enter your email to receive a secure reset link.</p>

        {message.text && (
          <div className={`bg-${message.type === 'error' ? 'red' : 'emerald'}-500/20 text-${message.type === 'error' ? 'red' : 'emerald'}-400 p-3 rounded-md text-sm text-center mb-4 border border-${message.type === 'error' ? 'red' : 'emerald'}-500/30`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {devLink && (
            <div className="mt-4 mb-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
              <p className="text-orange-300 text-xs mb-2">DEVELOPMENT MODE ONLY</p>
              <Link href={devLink} className="text-white hover:text-orange-400 text-sm underline decoration-orange-500/50 underline-offset-4 transition-colors">
                Click here to reset your password
              </Link>
            </div>
          )}

          <button type="submit" className="btn-primary mt-2" disabled={isSubmitting} style={{ background: "linear-gradient(135deg, #7c6af5, #3b8beb)" }}>
            {isSubmitting ? "Processing..." : "Send Reset Link"}
          </button>

          <div className="auth-switch">
            Remember your password? <Link href="/signin">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
