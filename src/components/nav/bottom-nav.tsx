"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import {
  HomeOutlineIcon,
  HomeFilledIcon,
  ArticleOutlineIcon,
  ArticleFilledIcon,
  InfoOutlineIcon,
  InfoFilledIcon,
  UserOutlineIcon,
  UserFilledIcon,
  PencilOutlineIcon,
  PencilFilledIcon,
} from "@/components/icons/nav-icons";

interface BottomNavProps {
  userRole?: Role;
}

export function BottomNav({ userRole }: BottomNavProps) {
  const pathname = usePathname();

  // Hide on auth pages
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/admin-login") ||
    pathname.startsWith("/admin-signup")
  ) {
    return null;
  }

  const isWriterOrAdmin = userRole === "WRITER" || userRole === "ADMIN";

  const navItems = isWriterOrAdmin
    ? [
        { href: "/", label: "Accueil", Outline: HomeOutlineIcon, Filled: HomeFilledIcon },
        { href: "/articles", label: "Articles", Outline: ArticleOutlineIcon, Filled: ArticleFilledIcon },
        { href: "/admin/posts", label: "Posts", Outline: PencilOutlineIcon, Filled: PencilFilledIcon },
        { href: "/infos", label: "Infos", Outline: InfoOutlineIcon, Filled: InfoFilledIcon },
        { href: "/profile", label: "Profil", Outline: UserOutlineIcon, Filled: UserFilledIcon },
      ]
    : [
        { href: "/", label: "Accueil", Outline: HomeOutlineIcon, Filled: HomeFilledIcon },
        { href: "/articles", label: "Articles", Outline: ArticleOutlineIcon, Filled: ArticleFilledIcon },
        { href: "/infos", label: "Infos", Outline: InfoOutlineIcon, Filled: InfoFilledIcon },
        { href: "/profile", label: "Profil", Outline: UserOutlineIcon, Filled: UserFilledIcon },
      ];

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-50 border-t-2 border-primary/20 backdrop-blur supports-[backdrop-filter]:bg-background/95 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const Icon = isActive ? item.Filled : item.Outline;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <span
                key={isActive ? "filled" : "outline"}
                className={cn(
                  "flex items-center justify-center transition-transform duration-200 ease-out animate-in fade-in zoom-in-75",
                  isActive ? "scale-110" : "scale-100 group-active:scale-90",
                )}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="transition-colors duration-200">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}