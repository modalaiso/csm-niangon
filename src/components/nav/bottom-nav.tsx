"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { School, Newspaper, Info, User, LayoutDashboard, FileText, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Role } from "@prisma/client"

interface BottomNavProps {
    userRole?: Role
}

export function BottomNav({ userRole }: BottomNavProps) {
    const pathname = usePathname()

    // Hide on auth pages
    if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/admin-login") || pathname.startsWith("/admin-signup")) {
        return null
    }

    const isWriterOrAdmin = userRole === "WRITER" || userRole === "ADMIN"
    // Re-reading plan: User/Moderator vs Writer/Admin.
    // Actually, Moderator usually needs some admin tools, but the plan grouped User/Moderator. I will stick to the plan.

    // Wait, if I am an ADMIN, I might want to see the User view too. 
    // The "nav-select" implies switching. 
    // For now, I'll render based on the role. If ADMIN, show Admin nav.

    const navItems = isWriterOrAdmin
        ? [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/posts", label: "Posts", icon: FileText },
            { href: "/admin/users", label: "Utilisateurs", icon: Users },
            { href: "/admin/settings", label: "Paramètres", icon: Settings },
        ]
        : [
            { href: "/", label: "Accueil", icon: School },
            { href: "/article", label: "Articles", icon: Newspaper },
            { href: "/info", label: "Infos", icon: Info },
            { href: "/profile", label: "Profil", icon: User },
        ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-lg md:hidden">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive)} />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
