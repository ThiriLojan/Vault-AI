"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Briefcase, 
  Bot, 
  TrendingUp, 
  Activity, 
  Target, 
  Calculator, 
  LogOut,
  User
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const [profilePhoto, setProfilePhoto] = useState("");
  const [ringColor, setRingColor] = useState("#00d4aa");
  const [customUsername, setCustomUsername] = useState("");

  const loadProfile = () => {
    const isDemo = session?.user?.email === 'demo@vaultai.io' || (session?.user as any)?.username === 'demo';
    if (isDemo) {
      setProfilePhoto("");
      setCustomUsername("Vault AI Demo");
      return;
    }
    const photo = localStorage.getItem("vault_profile_photo");
    const ring = localStorage.getItem("vault_ring_color");
    const name = localStorage.getItem("vault_custom_username");
    if (photo) setProfilePhoto(photo);
    if (ring) setRingColor(ring);
    if (name) setCustomUsername(name);
  };

  useEffect(() => {
    loadProfile();
    window.addEventListener("vaultPreferencesChanged", loadProfile);
    
    if (session) {
      const u = session.user?.name || (session.user as any)?.username || session.user?.email || "demo";
      const isDemo = u === 'demo' || u === 'demo@vaultai.io' || u === 'guest' || session.user?.email === 'demo@vaultai.io';
      if (isDemo) {
        localStorage.removeItem("vault_profile_photo");
        localStorage.removeItem("vault_custom_username");
        localStorage.removeItem("vault_bio");
        setProfilePhoto("");
        setCustomUsername("Vault AI Demo");
      } else {
        fetch(`/api/db/profile?userId=${u}`, { cache: 'no-store' }).then(r => r.json()).then(d => {
          if (d && d.success && d.profile) {
            if (d.profile.profilePhoto) setProfilePhoto(d.profile.profilePhoto);
            if (d.profile.ringColor) setRingColor(d.profile.ringColor);
            if (d.profile.username) setCustomUsername(d.profile.username);
          }
        }).catch(()=>{});
      }
    }

    return () => window.removeEventListener("vaultPreferencesChanged", loadProfile);
  }, [session]);

  const navItems = [
    { section: "Main" },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Portfolio", href: "/portfolio-tracker", icon: Briefcase },
    { label: "AI Advisor", href: "/advisor", icon: Bot },
    { section: "Analysis" },
    { label: "Market Prediction", href: "/prediction", icon: TrendingUp },
    { label: "Sentiment", href: "/sentiment-analysis", icon: Activity },
    { section: "Management" },
    { label: "Goals", href: "/goal-trackers", icon: Target },
    { label: "Tools", href: "/tools-calculators", icon: Calculator },
    { label: "Chatbot", href: "/chatbot", icon: Bot },
  ];

  if (!session) return null; // Don't show sidebar if not logged in

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} id="sidebar">
      <div className="sidebar-header">
        <button className="sidebar-logo-btn" onClick={() => setCollapsed(!collapsed)}>
          V
        </button>
        <div className="sidebar-title">Vault AI</div>
      </div>

      <div className="sidebar-nav">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div key={index} className="nav-section-label">
                {item.section}
              </div>
            );
          }

          const Icon = item.icon as React.ElementType;
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={index}
              href={item.href || "/"}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="nav-icon flex items-center justify-center">
                <Icon size={18} />
              </div>
              <div className="nav-label">{item.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <Link href="/profile" className="user-card" style={{ textDecoration: 'none', transition: 'transform 0.2s' }} title="Open Profile Settings">
          <div className="user-avatar" style={{ border: `2px solid ${ringColor}`, overflow: 'hidden', background: '#080b16', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 12px ${ringColor}33` }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (customUsername || session.user?.name || (session.user as any)?.username || session.user?.email)?.charAt(0).toUpperCase() || <User size={14} />
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{customUsername || session.user?.name || (session.user as any)?.username || session.user?.email?.split('@')[0] || "Guest"}</div>
            <div className="user-role">{session.user?.email || "No email"}</div>
          </div>
        </Link>
        <button className="btn-signout" onClick={() => signOut({ callbackUrl: "/signin" })}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
