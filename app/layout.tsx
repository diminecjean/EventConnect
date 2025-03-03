import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

import Navbar from "@/app/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EventConnect",
  description: "The first tech-oriented event app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // TODO: add darkmode toggle
    <html lang="en" className="dark">
      {/* <html lang="en"> */}
      <body className={inter.className}>
        <div className="fixed top-0 w-full z-50">
          <Navbar />
        </div>
        <div className="mx-6 md:mx-16 lg:mx-auto max-w-5xl">
          {children}
        </div>
      </body>
    </html>
  );
}
