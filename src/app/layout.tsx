import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AccountProvider } from "@/lib/context/AccountContext";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { SettingsProvider } from "@/lib/context/SettingsContext";
import { ChatProvider } from "@/lib/context/ChatContext";
import { ChatAssistant } from "@/components/Chat/ChatAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Savings Calculator",
  description: "A comprehensive savings calculator for tracking multiple accounts and financial goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SettingsProvider>
            <AccountProvider>
              <ChatProvider>
                {children}
                <ChatAssistant />
              </ChatProvider>
            </AccountProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
