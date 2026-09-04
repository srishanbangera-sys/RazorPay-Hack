import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mandate • Autonomous Commerce, Governed",
  description: "Bounded Autonomous AI Commerce with Deterministic Server-Side Mandate Enforcement",
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
