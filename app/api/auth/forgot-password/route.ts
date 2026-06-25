import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByEmail, updateUser } from '@/data/users';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = findUserByEmail(email);

    if (!user) {
      // For security, do not reveal whether the user exists or not
      return NextResponse.json({ message: "If that email exists, a reset link has been generated." });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash it for secure storage
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set expiration to 1 hour from now
    const resetTokenExpiry = Date.now() + 3600000;

    updateUser(user.id, {
      resetToken: hashedToken,
      resetTokenExpiry
    });

    // In a real application, you would email the unhashed `resetToken` here.
    // For this development environment, we will return the reset URL directly in the response.
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    return NextResponse.json({ 
      message: "If that email exists, a reset link has been generated.",
      devResetUrl: resetUrl // Only for Option A development!
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
