import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Client Intake | L3ad Solutions",
    template: "%s | L3ad Solutions",
  },
  description:
    "Client intake and project questionnaire tool for L3ad Solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-body min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
