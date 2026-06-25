import { findUserByUsername, findUserByEmail } from "@/data/users";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { identifier } = await req.json(); // Accepts both username or email

        if (!identifier) {
            return NextResponse.json({ error: "Please provide a username or email." }, { status: 400 });
        }

        // Search by username first, then fallback to email
        const user = findUserByUsername(identifier) || findUserByEmail(identifier);

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // Simulate password reset process
        // In a real-world project, you should send a reset email or generate a secure token here
        return NextResponse.json({ success: `Password reset link sent to ${user.email}.` }, { status: 200 });

    } catch (error) {
        console.error("Forgot Password Error:", error);  // For easier debugging
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}
