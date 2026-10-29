function Pulse({ className }: Readonly<{ className: string }>) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement du profil"
      className="min-h-screen bg-background"
    >
      <div className="container max-w-2xl px-4 py-8 sm:py-12">
        <Pulse className="mx-auto h-8 w-40 sm:h-9" />
        <div className="mt-8 flex justify-center">
          <Pulse className="h-28 w-28 rounded-full" />
        </div>
        <div className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-5 sm:p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Pulse className="h-10 w-full rounded-md" />
        </div>
      </div>
    </main>
  );
}
