import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GrãoSeguro",
  description:
    "Dashboard agrícola do GrãoSeguro para monitoramento inteligente das safras e gestão de riscos no campo.",
  metadataBase: new URL("https://graoseguro.com"),
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {/* Providers globais podem ser adicionados aqui futuramente */}
        {children}
      </body>
    </html>
  );
}
