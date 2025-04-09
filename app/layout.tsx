import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Image from "next/image";
import NextAuthProvider from "./sessionProvider";
import Navbar from "@/app/navbar";
import Footer from "@/app/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "./context/authContext";

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
        <NextAuthProvider>
          <AuthProvider>
            <div className="fixed top-0 w-full z-50">
              <Navbar />
            </div>
            <div className="mx-6 md:mx-16 lg:mx-auto max-w-5xl">{children}</div>
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-black/60 z-10" />
              <Image
                src="/landingbg.png"
                fill
                alt="Landing page background"
                className="object-cover"
              />
            </div>
            <Footer />
          </AuthProvider>
        </NextAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
