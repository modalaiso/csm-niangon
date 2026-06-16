"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { User } from "@supabase/supabase-js";

interface TopNavProps {
  user?: User | null;
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Hide on auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup")
  ) {
    return null;
  }

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/article", label: "Articles" },
    { href: "/info", label: "Infos" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 ml-2">
            <img
              src="/logo-g.png"
              alt="CSM Niangon TV"
              width={85}
              className="dark:hidden"
            />
            <img
              src="/logo-w.png"
              alt="CSM Niangon TV"
              width={85}
              className="hidden dark:block"
            />
          </Link>
        </div>

        <div className="container flex h-14 items-center justify-center px-4">
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Search & Menu/Auth */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800">
            <Input
              type="text"
              placeholder="Recherche"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 focus-visible:ring-0 w-40 outline-none"
            />
            <div className="px-2">
              <Search className="h-5 w-5 stroke-primary cursor-pointer" />
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <Link href="/profile"></Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-white rounded-full">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5 stroke-primary" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
                <div className="flex flex-col gap-4 py-4">
                  <img src="../logo-g.png" alt="Logo" width={50} />
                  <nav className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm font-medium hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {!user && (
                      <>
                        <div className="h-px bg-border my-2" />
                        <Link
                          href="/login"
                          className="text-sm font-medium hover:underline"
                        >
                          Se connecter
                        </Link>
                        <Link
                          href="/signup"
                          className="text-sm font-medium hover:underline"
                        >
                          S'inscrire
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
