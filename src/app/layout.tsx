import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Digital Legacy Self",
  description: "A decentralized AI companion and digital continuation.",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground min-h-screen selection:bg-muted selection:text-foreground`}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
