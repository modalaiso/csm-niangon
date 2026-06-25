import { getSearchResults } from "@/app/actions/search";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Résultats de recherche | CSM Niangon",
  description: "Résultats de votre recherche",
};

interface SearchResultsPageProps {
  searchParams: {
    q?: string;
    selected?: string;
  };
}

export default async function SearchResultsPage({
  searchParams,
}: SearchResultsPageProps) {
  const query = searchParams.q || "";
  const selectedId = searchParams.selected;

  const results = await getSearchResults(query, 50);

  const selectedResult = selectedId
    ? results.find((r) => r.id === selectedId)
    : null;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container px-3 sm:px-4 py-3 sm:py-4 md:py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 rounded-full">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-3 sm:mt-4 line-clamp-2">
            Résultats de recherche
            {query && <span className="text-primary text-base sm:text-lg"> : {query}</span>}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            {results.length === 0
              ? "Aucun résultat trouvé"
              : `${results.length} résultat${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container px-3 sm:px-4 py-6 sm:py-8">
        {/* Selected Result Highlight */}
        {selectedResult && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-accent/30 border border-primary/20 rounded-lg">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Résultat sélectionné</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              {selectedResult.thumbnail && (
                <img
                  src={selectedResult.thumbnail}
                  alt={selectedResult.title}
                  className="w-full sm:w-32 h-32 sm:h-32 object-cover rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-1 line-clamp-2">
                  {selectedResult.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Par {selectedResult.author.username}
                  {selectedResult.publishedAt && (
                    <> • {new Date(selectedResult.publishedAt).toLocaleDateString("fr-FR")}</>
                  )}
                </p>
                <p className="text-xs sm:text-sm line-clamp-3 mb-3">{selectedResult.summary}</p>
                <Link href={`/${selectedResult.slug}`}>
                  <Button size="sm" className="mt-2 sm:mt-3">
                    Lire l&apos;article
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun résultat ne correspond à votre recherche
            </p>
            <Link href="/">
              <Button className="text-white">Retour à l&apos;accueil</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-6">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={`p-3 sm:p-4 md:p-6 border border-border rounded-lg hover:bg-accent/30 transition-colors ${
                  selectedResult?.id === result.id ? "bg-accent/30 border-primary/40" : ""
                }`}
              >
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
                  {result.thumbnail && (
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full xs:w-16 xs:h-16 md:w-20 md:h-20 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 flex-wrap">
                      <Link href={`/${result.slug}`}>
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-primary hover:underline line-clamp-2">
                          {result.title}
                        </h2>
                      </Link>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded whitespace-nowrap flex-shrink-0">
                        {result.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      Par{" "}
                      <span className="font-semibold">
                        {result.author.username}
                      </span>
                      {result.publishedAt && (
                        <>
                          {" "}
                          •{" "}
                          {new Date(result.publishedAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/90 line-clamp-2 mb-3">
                      {result.summary}
                    </p>
                    <Link href={`/${result.slug}`}>
                      <Button size="sm" variant="outline">
                        Lire plus
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
