import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JS Clarity Lab",
  description: "Interactive visual demos for confusing JavaScript async behavior."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
