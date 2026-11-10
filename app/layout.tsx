import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buddy Learning | STEM Tutoring & Operations",
  description: "South African STEM tutoring operations and scholarship management system for high school learners, university tutors, and corporate sponsors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${headingFont.variable} ${sansFont.variable} ${monoFont.variable} font-sans bg-buddy-cream text-buddy-charcoal min-h-screen selection:bg-buddy-primaryLight selection:text-buddy-primaryDark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
