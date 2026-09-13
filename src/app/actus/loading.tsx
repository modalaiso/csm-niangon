function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement des actualités"
      className="min-h-screen bg-background"
    >
      <div className="container mt-16 px-4 pb-6">
        <Pulse className="h-8 w-40" />
        <Pulse className="mt-3 h-4 w-64" />
      </div>
      <div className="container px-3 pb-10 sm:px-4">
        <div className="mb-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <Pulse
              key={index}
              className="h-9 w-20 flex-shrink-0 rounded-full"
            />
          ))}
        </div>
        <div className="mb-5 flex items-center justify-between">
          <Pulse className="h-4 w-28" />
          <Pulse className="h-10 w-44 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border bg-muted/50"
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
      </div>
    </main>
  );
}
