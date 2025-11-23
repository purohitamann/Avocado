import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Avacado - Plan Your Next Move",
  description: "Avacado helps you estimate the cost of living for your next move with ease and accuracy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
