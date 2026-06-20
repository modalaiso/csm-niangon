"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const signupSchema = z
  .object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    classe: z.string().min(1, "La classe est requise"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit?: (data: SignupFormData) => void;
}

const CLASS_OPTIONS = [
  "Sixième",
  "Cinquième",
  "Quatrième",
  "Troisième",
  "Seconde",
  "Premiere",
  "Terminal",
];

import { signup } from "@/app/actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ... imports

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleFormSubmit = async (data: SignupFormData) => {
    setServerError(null);
    try {
      const result = await signup(data);
      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        router.push("/");
      }
    } catch (error) {
      setServerError("Une erreur inattendue est survenue");
    }
  };

  const selectedClass = watch("classe");

  return (
    <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-green-500 bg-white p-8 shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Inscription</h2>
        {/*{serverError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                        {serverError}
                    </div>
                )}*/}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              placeholder="Votre nom"
              {...register("nom")}
              className={errors.nom ? "border-red-500" : ""}
            />
            {errors.nom && (
              <p className="text-sm text-red-500">{errors.nom.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="prenom">Prénoms</Label>
            <Input
              id="prenom"
              placeholder="Prénoms"
              {...register("prenom")}
              className={errors.prenom ? "border-red-500" : ""}
            />
            {errors.prenom && (
              <p className="text-sm text-red-500">{errors.prenom.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            placeholder="Votre pseudo (min 3 car.)"
            {...register("username")}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="classe">Classe</Label>
          <Select
            onValueChange={(value) => setValue("classe", value)}
            defaultValue={selectedClass}
          >
            <SelectTrigger
              className={`bg-white ${errors.classe ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Sélectionner votre classe" />
            </SelectTrigger>

            <SelectContent>
              {CLASS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classe && (
            <p className="text-sm text-red-500">{errors.classe.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 caractères"
              {...register("password")}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Création en cours..." : "Créer un compte"}
        </Button>

        {serverError && (
          <div className="text-center text-sm text-red-500">{serverError}</div>
        )}

        <div className="text-center text-sm">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Connectez-vous
          </Link>
        </div>
      </form>
    </div>
  );
}
