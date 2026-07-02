"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  searchPosts,
  getRecentPosts,
  type SearchResult,
} from "@/app/actions/search";

export function SearchDropdown() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Fermer dropdown au clic extérieur ────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Posts récents au montage ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const posts = await getRecentPosts(10);
        if (!cancelled) setResults(posts);
      } catch (err) {
        console.error("Erreur chargement récents :", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ─── Recherche avec debounce + AbortController ────────────────────────────
  useEffect(() => {
    if (!searchQuery.trim()) return; // géré par l'effect du montage + handleClear

    const controller = new AbortController();

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchPosts(searchQuery, 10);
        if (!controller.signal.aborted) setResults(data);
      } catch (err) {
        if (!controller.signal.aborted) console.error("Erreur recherche :", err);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleClear = useCallback(async () => {
    setSearchQuery("");
    setIsOpen(true);
    setIsLoading(true);
    try {
      const posts = await getRecentPosts(5);
      setResults(posts);
    } catch (err) {
      console.error("Erreur rechargement récents :", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      e.preventDefault();
      router.push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
    }
    setIsOpen(false);
  };

  const handleResultClick = (postId: string) => {
    // Navigation directe vers le post, pas besoin de passer par /search/results
    router.push(`/posts/${postId}`);
    setIsOpen(false);
    setSearchQuery("");
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative flex-1">
      {/* Barre de recherche */}
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="search-listbox"
        className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800"
      >
        <Input
          type="search"
          placeholder="Recherche"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Rechercher des articles"
          aria-autocomplete="list"
          className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 outline-none w-40"
        />

        {searchQuery && (
          <button
            onClick={handleClear}
            aria-label="Effacer la recherche"
            className="absolute right-9 px-0 hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5 stroke-muted-foreground" />
          </button>
        )}

        <button
          onClick={handleSearchClick}
          aria-label="Lancer la recherche"
          className="px-3 hover:opacity-70 transition-opacity"
        >
          <Search className="h-5 w-5 stroke-primary cursor-pointer" />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div>
        <ul
          id="search-listbox"
          role="listbox"
          aria-label="Résultats de recherche"
          className="absolute top-full mt-4 left-1/2 transform -translate-x-3/4 w-[145%] sm:left-auto sm:right-0 sm:translate-x-0 sm:transform-none sm:w-96 bg-background border border-border rounded-lg shadow-lg z-40 max-h-[400px] overflow-y-auto divide-y divide-border"
        >
          {isLoading ? (
            <li className="p-4 text-center text-sm text-muted-foreground" role="status">
              Chargement...
            </li>
          ) : results.length === 0 ? (
            <li className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery.trim() ? "Aucun résultat trouvé" : "Aucun post disponible"}
            </li>
          ) : (
            results.map((result) => (
              <li key={result.id} role="option">
                <button
                  onClick={() => handleResultClick(result.id)}
                  className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors focus:outline-none focus:bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    {result.thumbnail && (
                      <img
                        src={result.thumbnail}
                        alt=""
                        aria-hidden="true"
                        className="w-20 h-14 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base truncate">{result.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.author.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.summary}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
        </div>
      )}
    </div>
  );
}