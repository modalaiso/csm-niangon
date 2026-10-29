function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page À propos"
      className="min-h-screen bg-background"
    >
      <Pulse className="h-105 w-full rounded-none md:h-130" />
      <Pulse className="h-24 w-full rounded-none" />
      <div className="container grid gap-8 px-4 py-14 md:grid-cols-2">
        <div className="space-y-4">
          <Pulse className="h-4 w-32" />
          <Pulse className="h-9 w-4/5" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-2/3" />
        </div>
        <Pulse className="aspect-4/3 w-full rounded-3xl" />
      </div>
    </main>
  );
}
