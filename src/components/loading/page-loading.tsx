function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function DefaultPageLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Chargement de la page"
      className="min-h-screen bg-background"
    >
      <div className="container max-w-5xl px-4 py-8 sm:py-12">
        <div className="mb-8 space-y-3">
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-72 max-w-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <Pulse className="h-5 w-40" />
              <Pulse className="mt-4 h-4 w-full" />
              <Pulse className="mt-2 h-4 w-5/6" />
              <Pulse className="mt-2 h-4 w-2/3" />
            </div>
          ))}
        </div>
      </div>
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
        <Pulse className="h-[50px] w-[75px] rounded-xl" />
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
