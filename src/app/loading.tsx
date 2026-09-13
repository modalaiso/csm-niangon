function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted/50">
      <Pulse className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Pulse className="h-5 w-4/5" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page"
      className="min-h-screen bg-background"
    >
      <section className="relative h-[420px] w-full overflow-hidden bg-muted sm:h-[480px] md:h-[560px]">
        <Pulse className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-20 sm:px-20 md:px-28 md:pb-26">
          <div className="max-w-xl space-y-4">
            <Pulse className="h-7 w-4/5 bg-background/60 sm:h-9" />
            <Pulse className="h-4 w-full max-w-lg bg-background/60" />
            <Pulse className="h-4 w-2/3 max-w-md bg-background/60" />
            <Pulse className="h-10 w-28 rounded-full bg-primary/40" />
          </div>
        </div>
      </section>

      <section className="container px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Pulse className="h-7 w-64" />
          <div className="hidden gap-2 md:flex">
            <Pulse className="h-9 w-16 rounded-full" />
            <Pulse className="h-9 w-16 rounded-full" />
            <Pulse className="h-9 w-20 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
