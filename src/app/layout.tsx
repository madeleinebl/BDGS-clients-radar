import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
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
        <div className="flex h-full">
          <Sidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
