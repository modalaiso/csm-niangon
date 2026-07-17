import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-6xl font-extrabold">404</h1>
      <p className="mt-4 text-xl">Page non trouvée</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center px-4"
      >
        <Button variant="default" className="text-white">
          Retour à l'accueil
        </Button>
      </Link>
    </main>
  );
}
