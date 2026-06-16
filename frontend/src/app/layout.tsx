import { AppProviders } from "@/providers/app-providers";
import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FactoryFlow — Factory Employee Management for Manufacturing",
  description:
    "Enterprise workforce management: attendance, shifts, payroll, compliance, and analytics for manufacturing teams.",
  openGraph: {
    title: "FactoryFlow — Factory Employee Management for Manufacturing",
    description:
      "Enterprise workforce management: attendance, shifts, payroll, compliance, and analytics for manufacturing teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
