import type { Metadata } from "next";
import "./globals.css";
import "98.css/dist/98.css"

export const metadata: Metadata = {
  title: "Noted 98 ",
  description: "Generate notes in classic windows 98",
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
