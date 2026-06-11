import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "FIFA World Cup 2026 Prediction Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a1628] text-slate-100">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="py-4 text-center text-slate-500 text-sm border-t border-slate-800">
            Prode Mundial 2026 &mdash; FIFA World Cup USA · Canada · Mexico
          </footer>
        </Providers>
      </body>
    </html>
  );
}
