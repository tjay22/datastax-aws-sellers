import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalConfig } from "./app.config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: GlobalConfig.title,
  description: GlobalConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
