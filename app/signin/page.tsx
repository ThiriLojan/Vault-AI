"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import RobotScene, { RobotAction } from "@/components/ui/RobotScene";

export default function SignIn() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [robotAction, setRobotAction] = useState<RobotAction>("wave");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Please fill in both fields.");
      return;
    }

    const result = await signIn("credentials", {
      ...formData,
      redirect: false,
    });

    if (result?.error) {
      setRobotAction("error");
      setError("Invalid username or password. Please try again.");
      setTimeout(() => setRobotAction("idle"), 3000);
    } else {
      setRobotAction("success");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }
  };

  return (
    <div className="auth-page active">
      <div className="auth-bg-scene"></div>
      <div className="auth-scanlines"></div>
      <div className="auth-figure-glow"></div>
      
      <div className="auth-figure">
        <RobotScene accentHex={0x00d4aa} currentAction={robotAction} />
      </div>

      <div className="auth-topbar">
        <div className="auth-topbar-logo">
          <div className="logo-mark">V</div>
          <div className="logo-text">Vault AI</div>
        </div>
        <div className="auth-topbar-right hidden md:block">Next Generation Financial Advisory</div>
      </div>

      <div className="auth-tagline-wrap">
        <h1 className="auth-tagline">
          Navigate the markets<br />with <em>precision.</em>
        </h1>
        <p className="auth-tagline-sub">
          Advanced sentiment analysis, predictive modeling, and intelligent portfolio tracking in one ecosystem.
        </p>
      </div>

      <div className="auth-form-float">
        <h2 className="auth-form-title">Welcome Back</h2>
        <p className="auth-form-sub">Enter your credentials to access your Vault.</p>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-md text-sm text-center mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '16px', marginBottom: '32px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#cbd5e1', fontSize: '13.5px', userSelect: 'none' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: '#00d4aa', cursor: 'pointer', borderRadius: '4px' }} />
              <span>Remember me</span>
            </label>
            <Link href="/forgot-password" style={{ color: '#00d4aa', fontSize: '13.5px', textDecoration: 'none', fontWeight: 600, transition: 'opacity 0.2s' }}>
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="btn-primary">Sign In</button>
          
          <div className="auth-switch">
            Don't have an account? <Link href="/register">Create one</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
