import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { DeviceUpdatesProvider } from "@/features/dashboard/hooks/use-device-updates";

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
        <DeviceUpdatesProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
              <AppSidebar />
              <SidebarInset className="flex min-h-screen flex-1 flex-col bg-muted/20">
                <Header />
                <div className="flex-1 overflow-y-auto">
                  {children}
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </DeviceUpdatesProvider>
      </body>
    </html>
  );
}
