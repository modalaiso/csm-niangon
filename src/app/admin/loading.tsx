function Pulse({ className }: { readonly className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement du tableau de bord"
      className="mx-auto max-w-7xl space-y-6"
    >
      <div className="space-y-3">
        <Pulse className="h-8 w-48" />
        <Pulse className="h-4 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-background p-4"
          >
            <Pulse className="h-3 w-32 max-w-full" />
            <Pulse className="mt-3 h-8 w-20" />
            <Pulse className="mt-2 h-3 w-28 max-w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <Pulse className="h-5 w-40" />
          <Pulse className="mt-5 h-56 w-full" />
        </div>
        <div className="rounded-lg border border-border bg-background p-4 sm:p-5">
          <Pulse className="h-5 w-28" />
          <Pulse className="mt-3 h-4 w-48 max-w-full" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <Pulse className="h-4 w-32 max-w-full" />
                  <Pulse className="h-3 w-40 max-w-full" />
                </div>
                <Pulse className="h-6 w-12 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Pulse className="h-5 w-48" />
        <Pulse className="mt-2 h-4 w-64 max-w-full" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-background px-4 py-3"
            >
              <Pulse className="h-3 w-24" />
              <div className="mt-3 flex justify-between">
                <Pulse className="h-7 w-16" />
                <Pulse className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
