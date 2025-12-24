"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Shield } from "lucide-react";

const adminLoginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "L'email ou le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
  accessKey: z.string().min(1, "La clé d'accès est requise"),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface AdminLoginFormProps {
  onSubmit?: (data: AdminLoginFormData) => void;
}

import { adminLogin } from "@/app/actions/auth";
import { useState } from "react";

// ... imports

export function AdminLoginForm({ onSubmit }: AdminLoginFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  const handleFormSubmit = async (data: AdminLoginFormData) => {
    setServerError(null);
    try {
      const result = await adminLogin(data);
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError("Une erreur inattendue est survenue");
    }
  };

  return (
    <div className="relative w-full max-w-md space-y-8 rounded-3xl border border-green-500 bg-white p-8 shadow-lg">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="mt-2 text-sm text-gray-600">Accès réservé aux admins</p>
        {/*{serverError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                        {serverError}
                    </div>
                )}*/}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="emailOrUsername">Email / Nom d'utilisateur</Label>
          <Input
            id="emailOrUsername"
            placeholder="Entrez votre email ou identifiant"
            {...register("emailOrUsername")}
            className={errors.emailOrUsername ? "border-red-500" : ""}
          />
          {errors.emailOrUsername && (
            <p className="text-sm text-red-500">
              {errors.emailOrUsername.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accessKey">Clé d'accès</Label>
          <Input
            id="accessKey"
            type="password"
            placeholder="Votre clé d'accès"
            {...register("accessKey")}
            className={errors.accessKey ? "border-red-500" : ""}
          />
          {errors.accessKey && (
            <p className="text-sm text-red-500">{errors.accessKey.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Connexion..." : "Connectez-vous"}
        </Button>

        {serverError && (
          <div className="text-center text-sm text-red-500">{serverError}</div>
        )}

        <div className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Retour à la connexion utilisateur
          </Link>
        </div>
      </form>
    </div>
  );
}
