"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Sparkles, CheckCircle2, ArrowLeft, Palette, Sliders, Save, Camera, Image as ImageIcon, Crop, ZoomIn, Move, X } from "lucide-react";
import Link from "next/link";

export default function ProfileCustomization() {
    const { data: session } = useSession();
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("Neural Quantitative Investor");
    const [ringColor, setRingColor] = useState("#00d4aa");
    const [riskPreference, setRiskPreference] = useState("Balanced Neural Engine");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [savedToast, setSavedToast] = useState(false);
    const [loading, setLoading] = useState(false);

    // Crop Modal State
    const [showCropModal, setShowCropModal] = useState(false);
    const [tempImage, setTempImage] = useState("");
    const [cropZoom, setCropZoom] = useState(1);
    const [cropX, setCropX] = useState(0); // -60 to 60
    const [cropY, setCropY] = useState(0); // -60 to 60
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const activeUserId = session?.user?.name || (session?.user as any)?.username || session?.user?.email?.split('@')[0] || "Guest Investor";

    useEffect(() => {
        const isDemoUser = session?.user?.email === 'demo@vaultai.io' || (session?.user as any)?.username === 'demo';
        if (isDemoUser) {
            localStorage.removeItem("vault_profile_photo");
            localStorage.removeItem("vault_custom_username");
            localStorage.removeItem("vault_user_bio");
            setDisplayName("Vault AI Demo");
            setBio("Demo Showcase Account • Live Preview");
            setProfilePhoto("");
            return;
        }

        // Load local preferences immediately
        const savedName = localStorage.getItem("vault_custom_username");
        const savedRing = localStorage.getItem("vault_ring_color");
        const savedBio = localStorage.getItem("vault_user_bio");
        const savedRisk = localStorage.getItem("vault_ai_mode");
        const savedPhoto = localStorage.getItem("vault_profile_photo");
        if (savedName) setDisplayName(savedName);
        if (savedRing) setRingColor(savedRing);
        if (savedBio) setBio(savedBio);
        if (savedRisk) setRiskPreference(savedRisk);
        if (savedPhoto) setProfilePhoto(savedPhoto);

        if (session?.user) {
            setEmail(session.user.email || "investor@vault.ai");
            const u = session.user?.name || (session.user as any)?.username || session.user?.email || "demo";
            fetch(`/api/db/profile?userId=${u}`, { cache: 'no-store' })
                .then(res => res.json())
                .then(data => {
                    if (data && data.success && data.profile) {
                        const p = data.profile;
                        if (p.username) setDisplayName(p.username);
                        if (p.bio) setBio(p.bio);
                        if (p.ringColor) setRingColor(p.ringColor);
                        if (p.profilePhoto) setProfilePhoto(p.profilePhoto);
                        if (p.aiMode) setRiskPreference(p.aiMode);
                    } else if (!savedName) {
                        setDisplayName(activeUserId);
                    }
                })
                .catch(() => { if (!savedName) setDisplayName(activeUserId); });
        } else if (!savedName) {
            setDisplayName(activeUserId);
        }
    }, [session]);

    // Live Crop Canvas Renderer
    useEffect(() => {
        if (!showCropModal || !tempImage || !previewCanvasRef.current) return;
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.onload = () => {
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            const aspect = img.width / img.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            if (aspect > 1) {
                drawWidth = canvas.width * aspect;
            } else {
                drawHeight = canvas.height / aspect;
            }
            drawWidth *= cropZoom;
            drawHeight *= cropZoom;
            const offsetX = (canvas.width - drawWidth) / 2 + (cropX * drawWidth) / 100;
            const offsetY = (canvas.height - drawHeight) / 2 + (cropY * drawHeight) / 100;
            ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };
        img.src = tempImage;
    }, [showCropModal, tempImage, cropZoom, cropX, cropY]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setCropZoom(1);
                setCropX(0);
                setCropY(0);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = ""; // reset input
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        setCropX(prev => Math.max(-80, Math.min(80, prev + dx * 0.4)));
        setCropY(prev => Math.max(-80, Math.min(80, prev + dy * 0.4)));
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleApplyCrop = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.onload = () => {
            ctx?.clearRect(0, 0, 250, 250);
            const aspect = img.width / img.height;
            let drawWidth = 250;
            let drawHeight = 250;
            if (aspect > 1) {
                drawWidth = 250 * aspect;
            } else {
                drawHeight = 250 / aspect;
            }
            drawWidth *= cropZoom;
            drawHeight *= cropZoom;
            const offsetX = (250 - drawWidth) / 2 + (cropX * drawWidth) / 100;
            const offsetY = (250 - drawHeight) / 2 + (cropY * drawHeight) / 100;
            ctx?.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            const croppedBase64 = canvas.toDataURL("image/jpeg", 0.8);
            setProfilePhoto(croppedBase64);
            setShowCropModal(false);
        };
        img.src = tempImage;
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const u = session?.user?.name || (session?.user as any)?.username || session?.user?.email || "demo";

        try {
            await fetch('/api/db/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: u,
                    displayName,
                    bio,
                    ringColor,
                    riskPreference,
                    profilePhoto
                })
            });
        } catch (err) {}

        try {
            localStorage.setItem("vault_ring_color", ringColor);
            localStorage.setItem("vault_user_bio", bio);
            localStorage.setItem("vault_ai_mode", riskPreference);
            if (displayName) localStorage.setItem("vault_custom_username", displayName);
            if (profilePhoto) localStorage.setItem("vault_profile_photo", profilePhoto);
        } catch (storageErr) {
            console.log("Storage quota limit reached for image cache.");
        }

        window.dispatchEvent(new Event("vaultPreferencesChanged"));
        setLoading(false);
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
    };

    const colorPresets = [
        { name: "Neon Emerald", hex: "#00d4aa" },
        { name: "Cyber Cyan", hex: "#06b6d4" },
        { name: "Quantum Purple", hex: "#a855f7" },
        { name: "Solar Gold", hex: "#f59e0b" },
        { name: "Crimson Pulse", hex: "#ec4899" }
    ];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px', color: '#fff', animation: 'fadeIn 0.3s ease-out' }}>
            {savedToast && (
                <div style={{ position: 'fixed', top: '32px', right: '32px', zIndex: 9999, background: 'rgba(0, 212, 170, 0.95)', color: '#04060e', padding: '14px 24px', borderRadius: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(0,212,170,0.4)', animation: 'slideDown 0.3s ease-out' }}>
                    <CheckCircle2 size={20} /> Profile Synced to DB & Telemetry!
                </div>
            )}

            {/* Custom Crop Modal Viewport */}
            {showCropModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, background: 'rgba(4,6,14,0.88)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s' }}>
                    <div style={{ background: '#080b16', border: `1px solid ${ringColor}`, borderRadius: '28px', padding: '32px', maxWidth: '440px', width: '100%', boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 35px ${ringColor}22`, textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowCropModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: ringColor, fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                            <Crop size={16} /> Neural Avatar Cropper
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px 0', color: '#fff' }}>Frame Your Portrait</h3>
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 24px 0' }}>Drag picture inside circle or use sliders below</p>

                        <div 
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            style={{ width: '220px', height: '220px', borderRadius: '50%', border: `3px solid ${ringColor}`, margin: '0 auto 24px auto', position: 'relative', overflow: 'hidden', background: '#04060e', cursor: isDragging ? 'grabbing' : 'grab', boxShadow: `0 0 30px ${ringColor}33` }}
                        >
                            <canvas 
                                ref={previewCanvasRef} 
                                width={220} 
                                height={220} 
                                style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} 
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', textAlign: 'left', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ZoomIn size={14}/> Zoom Scale</span>
                                    <span style={{ color: ringColor }}>{cropZoom.toFixed(1)}x</span>
                                </div>
                                <input 
                                    type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: ringColor, cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Move size={14}/> Horizontal Alignment</span>
                                </div>
                                <input 
                                    type="range" min="-80" max="80" step="1" value={cropX} onChange={(e) => setCropX(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: ringColor, cursor: 'pointer' }}
                                />
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Move size={14} style={{ transform: 'rotate(90deg)' }}/> Vertical Alignment</span>
                                </div>
                                <input 
                                    type="range" min="-80" max="80" step="1" value={cropY} onChange={(e) => setCropY(parseInt(e.target.value))}
                                    style={{ width: '100%', accentColor: ringColor, cursor: 'pointer' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowCropModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button onClick={handleApplyCrop} style={{ flex: 2, padding: '14px', borderRadius: '14px', background: `linear-gradient(135deg, ${ringColor} 0%, #06b6d4 100%)`, border: 'none', color: '#04060e', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 15px ${ringColor}44` }}>
                                Apply Neural Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#94a3b8', textDecoration: 'none', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Profile Customization</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Configure your identity, custom cropped photo, and terminal telemetry</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '28px', alignItems: 'start' }}>
                {/* Left Preview Card */}
                <div style={{ background: 'rgba(8, 11, 22, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100px', background: `linear-gradient(180deg, ${ringColor}22 0%, transparent 100%)` }} />
                    
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#080b16', border: `3px solid ${ringColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 800, color: ringColor, boxShadow: `0 0 30px ${ringColor}44`, overflow: 'hidden' }}>
                            {profilePhoto ? (
                                <img src={profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                displayName ? displayName.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        <label htmlFor="photoUploadBtn" style={{ position: 'absolute', bottom: '2px', right: '2px', background: ringColor, color: '#04060e', borderRadius: '50%', padding: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', transition: 'transform 0.2s' }} title="Upload & Crop Custom Photo">
                            <Camera size={15} />
                            <input id="photoUploadBtn" type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </label>
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0', color: '#fff' }}>{displayName || activeUserId}</h2>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: ringColor, background: `${ringColor}18`, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${ringColor}44`, marginBottom: '16px' }}>
                        {bio || "Quantitative Tier"}
                    </span>

                    <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '13px', color: '#94a3b8' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={15} style={{ color: '#64748b' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{email || "investor@vault.ai"}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={15} style={{ color: '#00d4aa' }} />
                            <span>MongoDB Synced Account</span>
                        </div>
                    </div>
                </div>

                {/* Right Edit Form */}
                <form onSubmit={handleSaveProfile} style={{ background: 'rgba(8, 11, 22, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Display Username</label>
                            <input 
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter trading alias..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                <ImageIcon size={14} /> Custom Profile Photo URL (or click camera icon on avatar)
                            </label>
                            <input 
                                type="text"
                                value={profilePhoto}
                                onChange={(e) => setProfilePhoto(e.target.value)}
                                placeholder="Paste image URL (https://...) or click camera on left to crop file..."
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '13px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quant Bio / Designation</label>
                            <input 
                                type="text"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="e.g. Algorithmic Asset Allocator"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                                <Palette size={14} /> Avatar Neural Ring Glow Accent
                            </label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {colorPresets.map((preset) => (
                                    <button
                                        key={preset.hex}
                                        type="button"
                                        onClick={() => setRingColor(preset.hex)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px', background: ringColor === preset.hex ? `${preset.hex}22` : 'rgba(255,255,255,0.03)', border: ringColor === preset.hex ? `1px solid ${preset.hex}` : '1px solid rgba(255,255,255,0.08)', color: ringColor === preset.hex ? preset.hex : '#94a3b8', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: preset.hex, boxShadow: ringColor === preset.hex ? `0 0 10px ${preset.hex}` : 'none' }} />
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                <Sliders size={14} /> Default Quant Strategy Preference
                            </label>
                            <select
                                value={riskPreference}
                                onChange={(e) => setRiskPreference(e.target.value)}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="Balanced Neural Engine">Balanced Neural Engine</option>
                                <option value="Aggressive Growth Engine">Aggressive Growth Engine</option>
                                <option value="Conservative Yield Engine">Conservative Yield Engine</option>
                            </select>
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 28px', borderRadius: '14px', background: 'linear-gradient(135deg, #00d4aa 0%, #06b6d4 100%)', color: '#04060e', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,212,170,0.3)', opacity: loading ? 0.7 : 1 }}
                            >
                                <Save size={18} /> {loading ? "Syncing DB..." : "Save & Synchronize DB Profile"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
