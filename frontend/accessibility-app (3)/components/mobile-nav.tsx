"use client"

import { Phone, MessageSquareText, Cpu, BarChart3, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    {
      name: "Help",
      href: "/call-for-help",
      icon: <Phone className="h-6 w-6" />,
      ariaLabel: "Call for help",
    },
    {
      name: "AI",
      href: "/ai-assistant",
      icon: <MessageSquareText className="h-6 w-6" />,
      ariaLabel: "AI Assistant",
    },
    {
      name: "Gadgets",
      href: "/gadgets",
      icon: <Cpu className="h-6 w-6" />,
      ariaLabel: "Gadgets",
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-6 w-6" />,
      ariaLabel: "Reports",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-6 w-6" />,
      ariaLabel: "Settings",
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-2 w-full",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
              )}
              aria-label={item.ariaLabel}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
