function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la publication"
      className="min-h-screen bg-background"
    >
      <div className="container max-w-3xl px-4 py-6 sm:py-8">
        <Pulse className="h-5 w-16" />
        <div className="mt-7 space-y-4">
          <Pulse className="h-6 w-20 rounded-full" />
          <Pulse className="h-9 w-full sm:h-10" />
          <Pulse className="h-9 w-4/5 sm:h-10" />
          <Pulse className="h-5 w-full" />
          <Pulse className="h-5 w-2/3" />
        </div>
        <div className="mt-6 flex items-center justify-between border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <Pulse className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Pulse className="h-4 w-32" />
              <Pulse className="h-3 w-20" />
            </div>
          </div>
          <Pulse className="h-4 w-32" />
        </div>
        <Pulse className="mt-6 aspect-video w-full" />
        <div className="mt-8 space-y-3">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-2/3" />
        </div>
      </div>
      <section className="border-t border-border bg-muted px-4 py-10">
        <div className="container max-w-5xl">
          <Pulse className="mb-5 h-7 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-border bg-muted/50"
              >
                <Pulse className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Pulse className="h-5 w-4/5" />
                  <Pulse className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
