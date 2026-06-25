"use client";

import { ReactNode } from "react";

interface ButtonProps {
    onClick: () => void;
    children: ReactNode;
    className?: string;
    variant?: "primary" | "secondary" | "danger";
}

export default function Button({ onClick, children, className = "", variant = "primary" }: ButtonProps) {
    const baseStyles = "p-2 rounded-md w-full text-white transition duration-300";
    const variants = {
        primary: "bg-green-500 hover:bg-green-600",
        secondary: "bg-blue-500 hover:bg-blue-600",
        danger: "bg-red-500 hover:bg-red-600",
    };

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}
