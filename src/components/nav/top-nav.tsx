"use client"

import Link from "next/link"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function TopNav() {
    const pathname = usePathname()

    // Hide on auth pages
    if (pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/admin-login") || pathname.startsWith("/admin-signup")) {
        return null
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background/95">
            <div className="container flex h-14 items-center justify-between px-4">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-2 ml-2">
                        <img src="/logo-g.png" alt="CSM Niangon TV" className="h-8 w-auto dark:hidden" />
                        <img src="/logo-w.png" alt="CSM Niangon TV" className="hidden h-8 w-auto dark:block" />
                    </Link>
                </div>

                {/* Right: Search & Menu */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Search className="h-5 w-5 stroke-primary" />
                        <span className="sr-only">Rechercher</span>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5 stroke-primary" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="flex flex-col gap-4 py-4">
                                <img
                                    src="../logo-g.png"
                                    alt="Logo"
                                    width={50}
                                />
                                {/* Add menu items here later */}
                                <nav className="flex flex-col gap-2">
                                    <Link href="/" className="text-sm font-medium hover:underline">
                                        Accueil
                                    </Link>
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}
