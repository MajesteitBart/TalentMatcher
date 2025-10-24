import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Matcher Agent",
  description: "AI-powered candidate matching system for rejected applicants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
