export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page"
      className="min-h-screen bg-background"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
          <div className="hidden items-center gap-3 sm:flex">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          </div>
        </div>

        <section className="space-y-6">
          <div className="h-10 w-3/4 max-w-xl animate-pulse rounded-lg bg-muted sm:h-12" />
          <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 max-w-md animate-pulse rounded bg-muted" />

          <div className="grid gap-6 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="overflow-hidden rounded-xl border border-border bg-card"
                key={index}
              >
                <div className="aspect-[16/9] animate-pulse bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
