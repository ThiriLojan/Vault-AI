"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const { data: session } = useSession();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div
            className={`bg-[#212121] text-[#E4E4E7] transition-all duration-300 
                        ${isSidebarOpen ? "w-64" : "w-9"}`}
        >
            {/* Sidebar Header with Toggle Button */}
            <div className="p-4 flex items-center space-x-2">
                <button
                    onClick={toggleSidebar}
                    className="p-2 bg-[#212121] rounded-full hover:bg-[#40414F]"
                    aria-label="Toggle Sidebar"
                >
                    <Bot size={24} />
                </button>
                {isSidebarOpen && <h1 className="text-xl font-bold">Finance Chatbot</h1>}
            </div>

            {/* Navigation Links */}
            {isSidebarOpen && (
                <nav className="flex flex-col space-y-2 pl-4">
                    <Link
                        href={session ? "/dashboard" : "/"}
                        className="p-2 rounded hover:bg-[#40414F]"
                    >
                        {session ? "Dashboard" : "Home"}
                    </Link>
                    <Link href="/portfolio-tracker" className="p-2 rounded hover:bg-[#40414F]">
                        Portfolio Tracker
                    </Link>
                    <Link href="/advisor" className="p-2 rounded hover:bg-[#40414F]">
                        Advisor
                    </Link>
                    <Link href="/prediction" className="p-2 rounded hover:bg-[#40414F]">
                        Prediction
                    </Link>
                    <Link href="/sentiment-analysis" className="p-2 rounded hover:bg-[#40414F]">
                        Sentiment Analysis
                    </Link>
                    <Link href="/chatbot" className="p-2 rounded hover:bg-[#40414F]">
                        Chatbot
                    </Link>
                </nav>
            )}

            {/* Sign In / Sign Out Button */}
            {isSidebarOpen && (
                <div className="mt-auto p-4">
                    {session ? (
                        <button
                            onClick={() => signOut()}
                            className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                        >
                            🚪 Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/signin"
                            className="w-full block bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                        >
                            🔐 Sign In
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
