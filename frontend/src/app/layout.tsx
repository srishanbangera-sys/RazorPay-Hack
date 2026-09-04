import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "razorpay-autonomous-merchant • A Smart AI Agent for E-commerce",
  description: "AI Agent for E-commerce transactions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
