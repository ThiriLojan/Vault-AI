"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actionLabel?: string;  // Dynamic button label (e.g., "Add Goal" or "Remove Selected")
    onAction?: () => void; // Optional action logic
}

export default function Dialog({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    actionLabel = "Close", 
    onAction 
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        const handleOutsideClick = (e: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        window.addEventListener("mousedown", handleOutsideClick);

        return () => {
            window.removeEventListener("keydown", handleEscape);
            window.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div
                ref={dialogRef}
                className="glass-card w-full max-w-2xl min-h-[600px] max-h-[90vh] flex flex-col overflow-y-auto custom-scrollbar shadow-2xl"
                style={{ padding: '48px', animation: 'fadeIn 0.2s ease-out' }}
            >
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-white/90 tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>,
        document.body
    );
}
