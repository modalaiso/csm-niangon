"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: any; reset?: () => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-4xl font-bold">Erreur</h1>
      <p className="mt-2 text-gray-600">Une erreur est survenue: {error?.message}</p>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => reset && reset()}
          variant="default"
          className="text-white"
        >
          Réessayer
        </Button>
        <Link href="/" className="px-4 py-2 border rounded">
          Accueil
        </Link>
      </div>
    </main>
  );
}
