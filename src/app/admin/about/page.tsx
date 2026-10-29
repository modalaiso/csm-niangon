import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { getAboutContent } from "@/app/actions/about";
import { AboutEditor } from "@/components/admin/about-editor";
import { requirePostManager } from "@/lib/auth/admin-guard";

export const metadata = {
  title: "À propos | Dashboard - CSM Niangon",
};

export default async function AdminAboutPage() {
  await requirePostManager();
  const content = await getAboutContent();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Page À propos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifiez chaque section de la page publique. Les changements sont
            visibles dès l'enregistrement.
          </p>
        </div>
        <Link
          href="/about"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          <ExternalLink className="h-4 w-4" />
          Voir la page
        </Link>
      </div>
      <AboutEditor initial={content} />
    </div>
  );
}
