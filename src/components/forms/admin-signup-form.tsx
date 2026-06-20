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
import { adminSignup } from "@/app/actions/auth";
import { useState } from "react";

const adminSignupSchema = z
  .object({
    lastName: z.string().min(1, "Le nom est requis"),
    firstName: z.string().min(1, "Le prénom est requis"),
    username: z
      .string()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
    role: z.string().min(1, "Le rôle est requis"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    accessKey: z.string().min(1, "La clé d'accès est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type AdminSignupFormData = z.infer<typeof adminSignupSchema>;

interface AdminSignupFormProps {
  onSubmit?: (data: AdminSignupFormData) => void;
}

const ROLE_OPTIONS = ["ADMIN", "MODERATOR", "WRITER"];

export function AdminSignupForm({ onSubmit }: AdminSignupFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema),
  });

  const handleFormSubmit = async (data: AdminSignupFormData) => {
    setServerError(null);
    try {
      const result = await adminSignup(data);
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError("Une erreur inattendue est survenue");
    }
  };

  const selectedRole = watch("role");

  return (
    <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-red-500 bg-white p-8 shadow-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-900">Inscription</h2>
        <p className="mt-2 text-sm text-gray-600">Accès réservé aux admins</p>
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
              placeholder="Nom"
              {...register("lastName")}
              className={errors.lastName ? "border-red-500" : ""}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">Prénoms</Label>
            <Input
              id="firstName"
              placeholder="Prénoms"
              {...register("firstName")}
              className={errors.firstName ? "border-red-500" : ""}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            placeholder="Pseudo"
            {...register("username")}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Select
            onValueChange={(value) => setValue("role", value)}
            defaultValue={selectedRole}
          >
            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@csm-niangon.com"
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
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Création..." : "Créer un compte"}
        </Button>
        {serverError && (
          <div className="text-center text-sm text-red-500">{serverError}</div>
        )}
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-red-600 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
