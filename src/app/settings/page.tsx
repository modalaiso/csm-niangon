import { ChevronRight, Palette, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/profile";
import { ThemePreference } from "@/components/settings/theme-preference";

export const metadata = {
  title: "Paramètres | CSM Niangon",
};

export default async function SettingsPage() {
  const profile = await getMyProfile();

  if ("error" in profile) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            Paramètres
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Personnalisez votre expérience sur CSM Niangon.
          </p>
        </div>

        <div className="space-y-6">
          <section
            className="rounded-3xl border border-border bg-card p-5 sm:p-6"
            aria-labelledby="appearance-heading"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-primary">
                <Palette className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="appearance-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Apparence
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choisissez le thème qui vous convient le mieux.
                </p>
              </div>
            </div>
            <ThemePreference />
          </section>

          <section
            className="overflow-hidden rounded-3xl border border-border bg-card"
            aria-labelledby="account-heading"
          >
            <div className="border-b border-border px-5 py-5 sm:px-6">
              <h2
                id="account-heading"
                className="text-lg font-semibold text-foreground"
              >
                Compte
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gérez vos informations personnelles et vos données.
              </p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60 sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Informations du profil
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                  {profile.prenom} {profile.nom}
                </span>
              </span>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/confidentialite"
              className="flex items-center gap-4 border-t border-border px-5 py-4 transition-colors hover:bg-muted/60 sm:px-6"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Confidentialité
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Consultez notre politique de confidentialité.
                </span>
              </span>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
