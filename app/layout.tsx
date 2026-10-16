import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Q-Watcher",
  description: "Discover movies and TV shows, build your To Watch and Watched lists, and give every story your own rating. Free with an account.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#050807] text-white selection:bg-[#B6FF3C] selection:text-[#050807]`} suppressHydrationWarning={true}>
        {children}
        <Footer/>
      </body>
    </html>
  );
}