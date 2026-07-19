"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";


interface errorProps {
  error: any;
  reset?: () => void;
}

export default function GlobalError(props: errorProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900">
      <h1 className="text-4xl font-bold">Erreur</h1>
      <p className="mt-2 text-gray-600 w-5/12">Une erreur est survenue: {props.error?.message}</p>
      <div className="mt-6 flex gap-3">
        <Button
          onClick={() => props.reset?.()}
          variant="default"
          className="text-white"
        >
          Réessayer
        </Button>
        <Link href="/" className="px-4 py-2 border rounded-full">
          Accueil
        </Link>
      </div>
    </main>
  );
}
