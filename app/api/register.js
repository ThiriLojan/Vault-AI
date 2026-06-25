import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use." });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" });
    } else {
        res.status(405).json({ error: "Method not allowed." });
    }
}
