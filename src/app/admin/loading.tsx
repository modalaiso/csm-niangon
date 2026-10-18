function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Chargement du tableau de bord"
      className="flex min-h-screen flex-col bg-muted/30 md:flex-row"
    >
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-background px-3 py-5 md:block">
        <div className="mb-7 flex items-center gap-3 px-2">
          <Pulse className="h-9 w-9 rounded-md" />
          <Pulse className="h-4 w-24" />
        </div>
        <div className="space-y-5 px-1">
          {Array.from({ length: 3 }, (_, index) => (
            <Pulse key={index} className="h-24 w-full rounded-md" />
          ))}
        </div>
      </aside>
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Pulse className="h-8 w-8 rounded-md" />
          <Pulse className="h-4 w-24" />
        </div>
        <Pulse className="h-10 w-20 rounded-md" />
      </header>
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <header className="hidden min-h-14 items-center justify-between border-b border-border bg-background px-6 py-2 md:flex">
          <Pulse className="h-4 w-44" />
          <Pulse className="h-10 w-28 rounded-md" />
        </header>
        <main className="min-w-0 flex-1 space-y-6 overflow-x-hidden bg-muted/20 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <div className="space-y-3">
            <Pulse className="h-8 w-48" />
            <Pulse className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-background p-4"
              >
                <Pulse className="h-3 w-16" />
                <Pulse className="mt-3 h-8 w-20" />
                <Pulse className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-background p-5">
            <Pulse className="mb-6 h-5 w-40" />
            <Pulse className="h-56 w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-background p-5"
              >
                <Pulse className="h-5 w-5 rounded-full" />
                <Pulse className="mt-5 h-8 w-20" />
                <Pulse className="mt-2 h-4 w-36" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}
