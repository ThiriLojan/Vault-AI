"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RobotScene, { RobotAction } from "@/components/ui/RobotScene";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [robotAction, setRobotAction] = useState<RobotAction>("wave");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      setMessage({ text: "Please fill in all the fields.", type: "error" });
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setRobotAction("success");
        setMessage({ text: "Registration successful! Redirecting to Sign In...", type: "success" });
        setTimeout(() => router.push("/signin"), 2000);
      } else {
        setRobotAction("error");
        setMessage({ text: data.error || "Registration failed. Please try again.", type: "error" });
        setTimeout(() => setRobotAction("idle"), 3000);
      }
    } catch (error) {
      setRobotAction("error");
      setMessage({ text: "Something went wrong. Please try again later.", type: "error" });
      setTimeout(() => setRobotAction("idle"), 3000);
    }
  };

  return (
    <div className="auth-page active">
      <div className="auth-bg-scene"></div>
      <div className="auth-scanlines"></div>
      <div className="auth-figure-glow" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(124,106,245,0.07) 0%, transparent 70%)" }}></div>
      
      <div className="auth-figure">
        <RobotScene accentHex={0x7c6af5} currentAction={robotAction} />
      </div>

      <div className="auth-topbar">
        <div className="auth-topbar-logo">
          <div className="logo-mark" style={{ background: "linear-gradient(135deg, #7c6af5, #3b8beb)" }}>V</div>
          <div className="logo-text">Vault AI</div>
        </div>
        <div className="auth-topbar-right hidden md:block">Next Generation Financial Advisory</div>
      </div>

      <div className="auth-tagline-wrap">
        <h1 className="auth-tagline">
          Build your wealth<br />with <em>intelligence.</em>
        </h1>
        <p className="auth-tagline-sub">
          Join Vault AI to harness the power of predictive analytics and automated portfolio tracking.
        </p>
      </div>

      <div className="auth-form-float relative">
        <Link href="/signin" className="inline-flex items-center text-[10px] text-white/30 hover:text-white/70 transition-colors mb-6 uppercase tracking-widest font-bold">
          <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-sub">Sign up to get started with your Vault.</p>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-md text-sm text-center border ${
            message.type === "success" 
              ? "bg-teal-500/20 text-teal-400 border-teal-500/30" 
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary mt-2" style={{ background: "linear-gradient(135deg, #7c6af5, #3b8beb)" }}>
            Register
          </button>
          
          <div className="auth-switch">
            Already have an account? <Link href="/signin">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
