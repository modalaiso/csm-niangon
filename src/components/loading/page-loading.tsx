function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function PostCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-muted/50">
      <Pulse className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Pulse className="h-5 w-4/5" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function DefaultPageLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page"
      className="min-h-screen bg-background"
    >
      <section className="relative h-105 w-full overflow-hidden bg-muted sm:h-120 md:h-140">
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

export function LegalPageLoading({ label }: { label: string }) {
  return (
    <main
      aria-busy="true"
      aria-label={`Chargement de ${label}`}
      className="min-h-screen bg-background"
    >
      <div className="container max-w-3xl px-4 py-10 sm:py-14">
        <Pulse className="h-8 w-3/4 sm:h-9" />
        <Pulse className="mt-3 h-4 w-52" />
        <div className="mt-8 space-y-7">
          {Array.from({ length: 6 }, (_, index) => (
            <section key={index} className="space-y-3">
              <Pulse className="h-5 w-2/5" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-4/5" />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

export function AuthPageLoading({
  label,
  variant,
}: {
  label: string;
  variant: "login" | "signup";
}) {
  const fieldCount = variant === "signup" ? 7 : 2;

  return (
    <main
      aria-busy="true"
      aria-label={`Chargement de ${label}`}
      className="flex min-h-screen flex-col items-center bg-background p-4"
    >
      <div className="mb-8 mt-4 flex flex-col items-center gap-2">
        <Pulse className="h-12.5 w-18.75 rounded-xl" />
        <Pulse className="h-4 w-28" />
      </div>
      <section className="w-full max-w-2xl space-y-8 rounded-3xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <Pulse className="mx-auto h-7 w-36" />
        <div className="space-y-6">
          {Array.from({ length: fieldCount }, (_, index) => (
            <div key={index} className="space-y-2">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-10 w-full rounded-md" />
            </div>
          ))}
          {variant === "signup" && <Pulse className="h-10 w-4/5 rounded-md" />}
          <Pulse className="h-10 w-full rounded-md" />
          <Pulse className="mx-auto h-4 w-48" />
        </div>
      </section>
    </main>
  );
}
