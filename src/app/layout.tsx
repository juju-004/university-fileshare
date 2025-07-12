import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";
import { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "File Share",
  description:
    "University File Sharing System — send and receive files securely between institutions.",
  keywords: [
    "file sharing",
    "university",
    "student portal",
    "uploads",
    "downloads",
    "Nigeria",
  ],
  authors: [{ name: "David Udoh" }],
  creator: "David Udoh",
  applicationName: "File Share",
  themeColor: "#2563eb", // Tailwind blue-600
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "File Share",
    description: "Secure file sharing system for Nigerian universities.",
    url: "https://university-fileshare.vercel.app", // update with your real domain
    siteName: "File Share",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <Toaster />
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
