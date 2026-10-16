import { Geist, Geist_Mono, Geist_Pixel } from 'next/font/google';

import React from 'react';
//import Link from 'next/link';
//import Image from 'next/image';

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Q-Balance",
  description: "Quick Balance NextJS App",
};

type RootLayoutProps = {
  children: React.ReactNode
}

export default async function ContentLayout({children}: RootLayoutProps) {
  return (
    <div className="flex flex-col">
      <div className="flex overflow-auto">
        <div id="main-content" className="w-full bg-[#050807]">
          {children}
        </div>
      </div>
    </div>
  );
}
