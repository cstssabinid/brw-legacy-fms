import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Berwa Photo Hub",
  description: "Berwa Photo Hub studio blog, photography portfolio, packages, and booking.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/studio-blog/icon.png",
    shortcut: "/studio-blog/icon.png",
    apple: "/studio-blog/icon.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#061a38",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
