import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { SocketProvider } from "@/lib/SocketContext";
import { LoggerProvider } from "@/lib/logger/LoggerContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat App",
  description: "Chat with strangers in internet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <LoggerProvider>
          <ReactQueryProvider>
            <SocketProvider>
              {children}
              <Toaster />
            </SocketProvider>
          </ReactQueryProvider>
        </LoggerProvider>
      </body>
    </html>
  );
}
