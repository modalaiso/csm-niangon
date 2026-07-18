"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Calendar, ListFilter } from "lucide-react";
import type { HomePostCard } from "@/app/actions/posts";
import { cn } from "@/lib/utils";

interface PostsExplorerProps {
  posts: HomePostCard[];
}

const FILTERS: { label: string; value: "ALL" | "ACTU" | "INFO" | "ARTICLE" }[] = [
  { label: "Tous", value: "ALL" },
  { label: "Actu", value: "ACTU" },
  { label: "Infos", value: "INFO" },
  { label: "Articles", value: "ARTICLE" },
];

const TYPE_BADGES: Record<string, { label: string; className: string }> = {
  ACTU: { label: "Actu", className: "bg-blue-600" },
  ARTICLE: { label: "Article", className: "bg-emerald-500" },
  INFO: { label: "Info", className: "bg-amber-500" },
  INTERVIEW: { label: "Interview", className: "bg-purple-500" },
};

function formatRelativeTime(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days}j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Il y a ${months}m`;
  const years = Math.floor(months / 12);
  return `Il y a ${years}an${years > 1 ? "s" : ""}`;
}

export function PostsExplorer({ posts }: PostsExplorerProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("ALL");
  // Contrôle l'affichage des boutons de filtre sur mobile (repliés par défaut)
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    if (filter === "ALL") return posts;
    return posts.filter((post) => post.type === filter);
  }, [posts, filter]);

  return (
    <section className="container px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          aria-expanded={isFilterOpen}
          aria-controls="post-type-filters"
          aria-label="Afficher les filtres"
          className={cn(
            "flex-shrink-0 rounded-full p-1.5 transition-colors md:pointer-events-none md:p-0",
            isFilterOpen ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <ListFilter className="h-5 w-5" />
        </button>

        <div
          id="post-type-filters"
          className={cn(
            "gap-2 overflow-x-auto",
            // Mobile: replié par défaut, se déroule horizontalement au clic
            isFilterOpen ? "flex animate-in fade-in slide-in-from-right-2" : "hidden",
            // Desktop: toujours visible
            "md:flex",
          )}
        >
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === item.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary/40",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <p className="text-base font-medium text-muted-foreground">
            Aucun post pour l&apos;instant
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl py-16 text-center">
          <p className="text-base font-medium text-muted-foreground">
            Aucun post dans cette catégorie pour l&apos;instant
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredPosts.map((post) => {
            const badge = TYPE_BADGES[post.type] ?? {
              label: post.type,
              className: "bg-gray-500",
            };
            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      Pas d&apos;image
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-1 text-base font-bold text-foreground">
                    {post.title}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {post.summary}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Créé par{" "}
                        <span className="font-medium text-foreground">
                          {post.author.prenom} {post.author.nom}
                        </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatRelativeTime(post.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}