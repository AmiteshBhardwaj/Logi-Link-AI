import "./(dashboard)/globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Logi-Link AI | Digital Dispatcher",
  description: "Hybrid Intelligence for logistics exception management"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background-primary text-text-primary`}>
        {children}
      </body>
    </html>
  );
}

