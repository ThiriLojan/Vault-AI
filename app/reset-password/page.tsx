"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import RobotScene, { RobotAction } from "@/components/ui/RobotScene";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [robotAction, setRobotAction] = useState<RobotAction>("wave");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setRobotAction("error");
      setMessage({ text: "Missing reset token in URL.", type: "error" });
      setTimeout(() => setRobotAction("idle"), 3000);
      return;
    }

    if (password !== confirmPassword) {
      setRobotAction("error");
      setMessage({ text: "Passwords do not match.", type: "error" });
      setTimeout(() => setRobotAction("idle"), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setRobotAction("success");
        setMessage({ text: "Password reset successfully! Redirecting...", type: "success" });
        setTimeout(() => {
          router.push("/signin");
        }, 2000);
      } else {
        setRobotAction("error");
        setMessage({ text: data.error || "Failed to reset password.", type: "error" });
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
    <>
      <div className="auth-figure">
        <RobotScene accentHex={0xffb74d} currentAction={robotAction} />
      </div>

      <div className="auth-form-float">
        <h2 className="auth-form-title">Create New Password</h2>
        <p className="auth-form-sub">Your new password must be different from previous used passwords.</p>

        {message.text && (
          <div className={`bg-${message.type === 'error' ? 'red' : 'emerald'}-500/20 text-${message.type === 'error' ? 'red' : 'emerald'}-400 p-3 rounded-md text-sm text-center mb-4 border border-${message.type === 'error' ? 'red' : 'emerald'}-500/30`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: "1rem" }}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>

          <div className="auth-switch">
            <Link href="/signin">Back to Sign In</Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default function ResetPassword() {
  return (
    <div className="auth-page active">
      <div className="auth-bg-scene"></div>
      <div className="auth-scanlines"></div>
      <div className="auth-figure-glow" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(255,183,77,0.07) 0%, transparent 70%)" }}></div>
      
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

      <Suspense fallback={<div className="auth-form-float text-white text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
