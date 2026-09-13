function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement des résultats"
      className="min-h-screen bg-background"
    >
      <div className="container flex items-center justify-between gap-4 px-4 py-6 sm:py-8">
        <Pulse className="h-5 w-20" />
        <Pulse className="h-4 w-48" />
      </div>
      <div className="container px-4 pb-2">
        <Pulse className="h-8 w-64" />
      </div>
      <div className="container grid grid-cols-1 gap-4 px-3 py-6 sm:grid-cols-2 sm:px-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-border bg-muted/70"
          >
            <Pulse className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Pulse className="h-5 w-4/5" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-2/3" />
              <Pulse className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
