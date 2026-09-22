import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PlanetPulse — Track Your Carbon Footprint",
  description:
    "Log your daily activities and see your carbon footprint. Set weekly targets, track progress, and make a positive impact on the environment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full dark`}
      data-theme="dark"
      suppressHydrationWarning
    >
      <head />
      <body
        className="h-full antialiased font-sans bg-dark-980 text-dark-100 selection:bg-primary-500 selection:text-white dark"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
