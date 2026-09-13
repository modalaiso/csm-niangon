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
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-background px-3 py-6 md:block">
        <div className="mb-8 flex items-center gap-2 px-3">
          <Pulse className="h-8 w-8 rounded-md" />
          <Pulse className="h-4 w-24" />
        </div>
        <div className="space-y-3 px-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Pulse key={index} className="h-10 w-full rounded-full" />
          ))}
        </div>
      </aside>
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col">
        <header className="hidden items-center justify-end border-b border-border bg-background px-6 py-4 md:flex">
          <div className="space-y-2">
            <Pulse className="ml-auto h-4 w-32" />
            <Pulse className="ml-auto h-3 w-20" />
          </div>
          <Pulse className="ml-3 h-10 w-10 rounded-full" />
        </header>
        <main className="min-w-0 flex-1 space-y-8 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Pulse className="h-8 w-48" />
            <Pulse className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-background p-4"
              >
                <Pulse className="h-3 w-16" />
                <Pulse className="mt-3 h-8 w-20" />
                <Pulse className="mt-2 h-3 w-24" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <Pulse className="mb-6 h-5 w-40" />
            <Pulse className="h-56 w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-background p-5"
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
