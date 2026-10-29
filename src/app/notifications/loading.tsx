function Pulse({ className }: Readonly<{ className: string }>) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement des notifications"
      className="min-h-screen bg-background"
    >
      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        <Pulse className="h-8 w-48" />
        <Pulse className="mt-2 h-4 w-full max-w-md" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <Pulse className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-4/5" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
