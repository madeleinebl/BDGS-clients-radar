import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BDGS Client Radar",
  description:
    "Financial intelligence platform for monitoring corporate clients, tracking deal activity, and identifying financing opportunities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
