import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM - Customer Relationship Management",
  description: "The modern CRM platform trusted by thousands of organizations worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
