import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalPageLayout(props: Readonly<LegalPageLayoutProps>) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-10 sm:py-14">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {props.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dernière mise à jour : {props.lastUpdated}
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {props.children}
        </div>
      </div>
    </main>
  );
}
