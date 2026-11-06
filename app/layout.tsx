import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import { site } from "@/constants/site";
import "./globals.css";

const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: `${site.name} – ${site.tagline}`, template: `%s – ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = { themeColor: "#141311" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
