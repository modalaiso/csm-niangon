'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { Role } from '@prisma/client'

// Schemas (matching the form schemas)
const signupSchema = z.object({
    nom: z.string().min(1),
    prenom: z.string().min(1),
    username: z.string().min(3),
    classe: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
})

const loginSchema = z.object({
    nameOrEmail: z.string().min(1),
    password: z.string().min(1),
})

const adminSignupSchema = z.object({
    lastName: z.string().min(1),
    firstName: z.string().min(1),
    username: z.string().min(3),
    role: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    password: z.string().min(8),
    accessKey: z.string().min(1),
})

const adminLoginSchema = z.object({
    emailOrUsername: z.string().min(1),
    password: z.string().min(1),
    accessKey: z.string().min(1),
})

export async function signup(formData: z.infer<typeof signupSchema>) {
    const supabase = await createClient()

    // 1. Create Supabase User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                username: formData.username,
                full_name: `${formData.prenom} ${formData.nom}`,
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Erreur lors de la création du compte" }
    }

    // 2. Create Prisma User
    try {
        await prisma.user.create({
            data: {
                id: authData.user.id, // Link to Supabase ID
                email: formData.email,
                nom: formData.nom,
                prenom: formData.prenom,
                username: formData.username,
                classe: formData.classe,
                role: 'USER',
            },
        })
    } catch (error) {
        console.error("Prisma error:", error)
        // Rollback Supabase user if Prisma fails? 
        // For now, just return error. Ideally we'd delete the auth user.
        return { error: "Erreur lors de la création du profil utilisateur" }
    }

    redirect('/')
}

export async function login(formData: z.infer<typeof loginSchema>) {
    const supabase = await createClient()

    // For now, we assume the user enters an email. 
    // If we want to support username login, we'd need to lookup the email by username first.
    // Since Supabase Auth works with email, we'll pass the input as email.
    // TODO: Implement username lookup if needed.

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.nameOrEmail,
        password: formData.password,
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/')
}

export async function adminSignup(formData: z.infer<typeof adminSignupSchema>) {
    const supabase = await createClient()

    // 1. Verify Access Key
    const accessKeyRecord = await prisma.accessKey.findUnique({
        where: { key: formData.accessKey },
    })

    if (!accessKeyRecord) {
        return { error: "Clé d'accès invalide" }
    }

    if (accessKeyRecord.isUsed) {
        return { error: "Cette clé d'accès a déjà été utilisée" }
    }

    // Verify role matches key role (optional, but good practice if keys are role-specific)
    // Assuming keys might be generic or specific. Let's trust the form role for now 
    // OR enforce that the key's role matches the requested role.
    // For strictness:
    if (accessKeyRecord.role !== formData.role as Role) {
        return { error: `Cette clé n'est pas valide pour le rôle ${formData.role}` }
    }

    // 3. Create Supabase User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                username: formData.username,
                full_name: `${formData.firstName} ${formData.lastName}`,
                role: formData.role,
            },
        },
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Erreur lors de la création du compte" }
    }

    // 4. Create Prisma User & Mark Key Used
    try {
        await prisma.$transaction([
            prisma.user.create({
                data: {
                    id: authData.user.id,
                    email: formData.email,
                    nom: formData.lastName,
                    prenom: formData.firstName,
                    username: formData.username,
                    classe: "STAFF", // Or specific field
                    role: formData.role as Role,
                },
            }),
            prisma.accessKey.update({
                where: { id: accessKeyRecord.id },
                data: {
                    isUsed: true,
                    usedBy: authData.user.id,
                    usedAt: new Date(),
                },
            }),
        ])
    } catch (error) {
        console.error("Prisma error:", error)
        return { error: "Erreur lors de la finalisation du compte" }
    }

    redirect('/')
}

export async function adminLogin(formData: z.infer<typeof adminLoginSchema>) {
    const supabase = await createClient()

    // 1. Sign In
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: formData.emailOrUsername,
        password: formData.password,
    })

    if (error) {
        return { error: error.message }
    }

    if (!authData.user) {
        return { error: "Erreur d'authentification" }
    }

    // 2. Verify Access Key ownership
    // We check if the provided access key was the one used by this user
    const accessKeyRecord = await prisma.accessKey.findUnique({
        where: { key: formData.accessKey },
    })

    if (!accessKeyRecord || accessKeyRecord.usedBy !== authData.user.id) {
        await supabase.auth.signOut()
        return { error: "Clé d'accès invalide pour cet utilisateur" }
    }

    // 3. Verify Role (Double check)
    const user = await prisma.user.findUnique({
        where: { id: authData.user.id },
    })

    if (!user || !['ADMIN', 'MODERATOR', 'WRITER'].includes(user.role)) {
        await supabase.auth.signOut()
        return { error: "Accès non autorisé" }
    }

    redirect('/')
}
