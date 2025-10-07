"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            GS
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-foreground">GrãoSeguro</span>
            <span className="text-xs text-muted-foreground">Silo Monitor</span>
          </div>
        </Link>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Abrir notificações"
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        <span className="absolute right-2 top-2 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
        </span>
      </Button>
    </header>
  )
}
