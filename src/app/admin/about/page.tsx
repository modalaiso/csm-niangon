import { ArrowUpRight, Building2, FilePenLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AboutPageEditor } from "@/components/admin/about-page-editor";
import { getAboutPageContent } from "@/lib/about-page";
import { requireAdmin } from "@/lib/auth/admin-guard";

export const metadata: Metadata = {
  title: "Page À propos | Dashboard - CSM Niangon",
};

export default async function AdminAboutPage() {
  await requireAdmin();
  const content = await getAboutPageContent();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-5 rounded-2xl border border-border bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Administration du site
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Page À propos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Présentez l’identité, la mission et les valeurs du CSM Niangon à
              votre communauté.
            </p>
          </div>
        </div>
        <Link
          href="/about"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <FilePenLine className="h-4 w-4" aria-hidden="true" />
          <span>Voir la page</span>
          <ArrowUpRight
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
      </header>

      <AboutPageEditor content={content} />
    </div>
  );
}
