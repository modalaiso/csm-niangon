// src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/*<header className="absolute top-4 right-4">
        <Link href="/signup">
          <Button variant="outline" className="hover:bg-gray-200">
            Inscrivez vous maintenant
          </Button>
        </Link>
      </header>*/}
      <main className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/*Logo*/}
          <div className="mb-6 inline-block animate-slide-up">
            <img src="../logo-w.png" alt="Logo" width={150} height={100} />
          </div>

          {/* Message principal */}
          <div className="p-8 md:p-12 animate-slide-up">
            <div className="mb-6">
              <span className="inline-block bg-secondary-500 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                Bientôt disponible
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Plateforme en cours de développement
            </h2>
          </div>

          {/* Footer */}
          <div className="mt-8 text-primarys2-200 text-sm">
            <p>&copy; 2025 Club NTIC. Tous droits réservés.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
