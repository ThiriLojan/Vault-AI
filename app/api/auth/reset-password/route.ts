import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { findUserByResetToken, updateUser } from '@/data/users';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
    }

    // Hash the incoming token to compare with the db
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = findUserByResetToken(hashedToken);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
    }

    // Usually you would hash the new password here (e.g. bcrypt). 
    // Since the mock db stores passwords in plaintext, we just save it.
    
    updateUser(user.id, {
      password: password,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    return NextResponse.json({ 
      success: true,
      message: "Password has been successfully reset." 
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
