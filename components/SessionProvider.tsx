"use client"; // 👈 Add this to make it a Client Component

import { SessionProvider as Provider } from "next-auth/react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

export default function SessionProvider({ children }: Props) {
    return <Provider>{children}</Provider>;
}
