"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/app/actions/auth"
import { useState } from "react"

const loginSchema = z.object({
    nameOrEmail: z.string().min(1, "Le nom ou l'email est requis"),
    password: z.string().min(1, "Le mot de passe est requis"),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
    onSubmit?: (data: LoginFormData) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
    const [serverError, setServerError] = useState<string | null>(null)
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const handleFormSubmit = async (data: LoginFormData) => {
        setServerError(null)
        try {
            const result = await login(data)
            if (result?.error) {
                setServerError(result.error)
            }
        } catch (error) {
            setServerError("Une erreur inattendue est survenue")
        }
    }

    return (
        <div className="w-full max-w-md space-y-8 rounded-3xl border border-green-500 bg-white p-8 shadow-lg">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
                {/*{serverError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                        {serverError}
                    </div>
                )}*/}
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="nameOrEmail">Nom ou Email</Label>
                    <Input
                        id="nameOrEmail"
                        placeholder="Entrez votre nom ou email"
                        {...register("nameOrEmail")}
                        className={errors.nameOrEmail ? "border-red-500" : ""}
                    />
                    {errors.nameOrEmail && (
                        <p className="text-sm text-red-500">{errors.nameOrEmail.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="●●●●●●●●●●"
                        {...register("password")}
                        className={errors.password ? "border-red-500" : ""}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
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
                    <div className="text-center text-sm text-red-500">
                        {serverError}
                    </div>
                )}

                <div className="text-center text-sm">
                    Pas encore de compte ?{" "}
                    <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                        Créer un compte
                    </Link>
                </div>
            </form>

            {/* Hidden/Subtle Admin Login Link as requested "user-field" button behavior
            <div className="mt-4 flex justify-center hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" onClick={() => router.push('/admin-login')}>
                    Admin Access
                </Button>
            </div> */}
        </div>
    )
}
