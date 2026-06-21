"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPosts, getRecentPosts, type SearchResult } from "@/app/actions/search";

export function SearchDropdown() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load recent posts on mount
  useEffect(() => {
    loadRecentPosts();
  }, []);

  const loadRecentPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const recentPosts = await getRecentPosts(10);
      setResults(recentPosts);
    } catch (error) {
      console.error("Error loading recent posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      // If query is empty, show recent posts again
      await loadRecentPosts();
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const searchResults = await searchPosts(query, 10);
        setResults(searchResults);
      } catch (error) {
        console.error("Error searching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [loadRecentPosts]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
    handleSearch(value);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!searchQuery.trim()) {
      loadRecentPosts();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      router.push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      router.push(`/search/results?q=${encodeURIComponent(searchQuery)}`);
    }
    setIsOpen(false);
  };

  const handleResultClick = (postId: string) => {
    router.push(
      `/search/results?q=${encodeURIComponent(searchQuery)}&selected=${postId}`
    );
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsOpen(true);
    loadRecentPosts();
  };

  return (
    <div className="relative flex-1">
      <div className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-gray-800">
        <Input
          type="text"
          placeholder="Recherche"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-0 focus-visible:ring-0 flex-1 outline-none w-40 border-none"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute px-0 hover:opacity-70 transition-opacity right-9"
            aria-label="Effacer la recherche"
          >
            <X className="h-5 w-5 stroke-muted-foreground" />
          </button>
        )}
        <button
          onClick={handleSearchIconClick}
          className="px-3 hover:opacity-70 transition-opacity"
          aria-label="Rechercher"
        >
          <Search className="h-5 w-5 stroke-primary cursor-pointer" />
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute w-96 top-full right-0 mt-4 bg-background border border-border rounded-lg shadow-lg z-40 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery.trim()
                ? "Aucun résultat trouvé"
                : "Aucun post disponible"}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleResultClick(result.id)}
                    className="w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors focus:outline-none focus:bg-accent/50"
                  >
                    <div className="flex items-start gap-3">
                      {result.thumbnail && (
                        <img
                          src={result.thumbnail}
                          alt={result.title}
                          className="w-10 h-10 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {result.title}
                        </h3>
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
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
