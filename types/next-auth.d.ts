import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            username?: string;
            email?: string;
            name?: string;
            [key: string]: any;
        };
    }

    interface User {
        id?: string;
        username?: string;
        email?: string;
        name?: string;
        [key: string]: any;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        username?: string;
        email?: string;
        [key: string]: any;
    }
}