import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import AppLayout from "@/components/layout/AppLayout";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vault — AI Finance Platform",
  description: "Next Generation Financial Advisory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} antialiased`}
    >
      <body className="min-h-full">
        <SessionProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
