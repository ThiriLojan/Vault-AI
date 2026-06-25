// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByUsername } from "@/data/users";
import { connectToDatabase } from "@/lib/mongodb";
import UserModel from "@/models/User";
import type { NextAuthOptions, User as NextAuthUser } from "next-auth";


interface CustomUser extends NextAuthUser {
    id: string;
    username: string;
    email: string;
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                let dbUser = null;
                try {
                    await connectToDatabase();
                    dbUser = await UserModel.findOne({ username: credentials?.username });
                } catch (err) {
                    console.log("MongoDB Auth fallback active");
                }

                if (dbUser) {
                    if (dbUser.password !== credentials?.password) {
                        throw new Error("Invalid password");
                    }
                    return {
                        id: dbUser._id.toString(),
                        username: dbUser.username,
                        email: dbUser.email
                    };
                }

                const user = findUserByUsername(credentials?.username as string);

                if (!user) {
                    throw new Error("User not found");
                }

                if (user.password !== credentials?.password) {
                    throw new Error("Invalid password");
                }

                return user;
            }
        })
    ],
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.email = token.email as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                const customUser = user as CustomUser;  // Cast `user` as CustomUser
                token.id = customUser.id;
                token.username = customUser.username;
                token.email = customUser.email;
            }
            return token;
        }
    }       
});

export { handler as GET, handler as POST };
