import { addUser, findUserByUsername, findUserByEmail } from "@/data/users";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        try {
            await connectToDatabase();
            const existingDbUser: any = await UserModel.findOne({ $or: [{ username }, { email }] });
            if (existingDbUser) {
                return NextResponse.json({ error: "Username or email already registered." }, { status: 400 });
            }
            await UserModel.create({ username, email, password });
        } catch (dbErr) {
            console.log("MongoDB Register fallback active");
        }

        if (findUserByUsername(username)) {
            return NextResponse.json({ error: "User already exists." }, { status: 400 });
        }

        if (findUserByEmail(email)) {
            return NextResponse.json({ error: "Email already registered." }, { status: 400 });
        }

        addUser({
            id: Date.now().toString(),
            username,
            email,
            password
        });

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
        console.error("Registration Error:", error);  // <-- Added error log for better debugging
        return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
    }
}
