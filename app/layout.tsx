import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "DULIF Marketplace - Berkeley Student Marketplace",
  description: "The trusted marketplace for UC Berkeley students to buy and sell items safely on campus.",
  keywords: "Berkeley, UC Berkeley, marketplace, students, buy, sell, textbooks, furniture",
  authors: [{ name: "DULIF Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#003262",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DULIF Marketplace",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
