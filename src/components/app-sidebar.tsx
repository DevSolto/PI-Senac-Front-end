"use client"

import { useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BarChart3,
  Settings,
  Leaf,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useDeviceUpdatesContext } from "@/features/dashboard/hooks/use-device-updates"

const navigationItems = [
  {
    title: "Visão geral",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Safras monitoradas",
    href: "/safras",
    icon: Leaf,
    comingSoon: true,
  },
  {
    title: "Monitoramento em tempo real",
    href: "/monitoramento",
    icon: Activity,
    comingSoon: true,
  },
  {
    title: "Alertas e ocorrências",
    href: "/alertas",
    icon: AlertTriangle,
    comingSoon: true,
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    comingSoon: true,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    comingSoon: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { lastEventTimestamp } = useDeviceUpdatesContext()

  const userTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      return undefined
    }
  }, [])

  const formattedLastUpdate = useMemo(() => {
    if (!lastEventTimestamp) {
      return "Aguardando dados"
    }

    const date = new Date(lastEventTimestamp)

    if (Number.isNaN(date.getTime())) {
      return "Aguardando dados"
    }

    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: userTimeZone,
      }).format(date)
    } catch {
      return date.toLocaleString("pt-BR")
    }
  }, [lastEventTimestamp, userTimeZone])

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-semibold text-primary-foreground">
            GS
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              GrãoSeguro
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              Monitoramento agrícola
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  !item.comingSoon &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild={!item.comingSoon}
                      disabled={item.comingSoon}
                      aria-disabled={item.comingSoon || undefined}
                      tooltip={item.title}
                      isActive={isActive}
                      className={item.comingSoon ? "text-sidebar-foreground/70" : undefined}
                    >
                      {item.comingSoon ? (
                        <span className="flex items-center gap-2">
                          <Icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </span>
                      ) : (
                        <Link href={item.href as any} className="flex items-center gap-2">
                          <Icon className="size-4" aria-hidden="true" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.comingSoon ? (
                      <SidebarMenuBadge className="bg-muted text-xs font-medium text-muted-foreground">
                        Em breve
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3 text-xs text-sidebar-foreground/70">
        <p className="font-medium">Silo Monitor</p>
        <p className="text-[11px]">Última atualização em tempo real</p>
        <p className="text-[11px]" aria-live="polite">
          {formattedLastUpdate}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
