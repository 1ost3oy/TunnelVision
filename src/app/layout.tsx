import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "@/lib/process-cleanup";
import "./globals.css";

export const metadata: Metadata = {
  title: "TunnelVision",
  description: "Manage and create network tunnels with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><g fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%221.1%22><path stroke=%22%23e10885%22 d=%22M8 15S5 6.5 1 4c1 .2 3.3.5 4.5.5c1 .5 2.5 3 2.5 4c0-1 1.5-3.5 2.5-4A31 31 0 0 0 15 4c-4 2.5-7 11-7 11%22 /><path stroke=%22%23928d99%22 d=%22M3.4 2.6S5 1 7.7 1S12 2.6 12 2.6m-10.9 4S.5 8.7 2 11a6 6 0 0 0 3.4 3m4.6 0s2.2-.6 3.5-3c1.4-2.2.8-4.5.8-4.5%22 /></g></svg>" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
