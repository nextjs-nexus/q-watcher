import React from 'react';
//import Link from 'next/link';
//import Image from 'next/image';

import "../globals.css";

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
