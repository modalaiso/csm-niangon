function Pulse({ className }: { readonly className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement des paramètres"
      className="min-h-screen bg-background"
    >
      <div className="container max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-8 space-y-2">
          <Pulse className="h-8 w-44 sm:h-9" />
          <Pulse className="h-4 w-full max-w-md" />
        </div>
        <div className="space-y-6">
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <Pulse className="h-10 w-10 shrink-0 rounded-xl" />
              <div className="space-y-2">
                <Pulse className="h-5 w-28" />
                <Pulse className="h-4 w-64 max-w-full" />
              </div>
            </div>
            <Pulse className="h-11 w-full rounded-xl" />
          </section>
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="space-y-2 border-b border-border px-5 py-5 sm:px-6">
              <Pulse className="h-5 w-20" />
              <Pulse className="h-4 w-full max-w-sm" />
            </div>
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 px-5 py-4 sm:px-6 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
              >
                <Pulse className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Pulse className="h-4 w-40 max-w-full" />
                  <Pulse className="h-4 w-56 max-w-full" />
                </div>
                <Pulse className="h-5 w-5 shrink-0 rounded-full" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
