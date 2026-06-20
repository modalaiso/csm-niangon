"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Role } from "@prisma/client";

// Schemas (matching the form schemas)
const signupSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  username: z.string().min(3),
  classe: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  nameOrEmail: z.string().min(1),
  password: z.string().min(1),
});

const adminSignupSchema = z.object({
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  username: z.string().min(3),
  role: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  accessKey: z.string().min(1),
});

const adminLoginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
  accessKey: z.string().min(1),
});

// Helper to check if password is compromised
async function checkPasswordCompromise(password: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();

    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );
    if (!response.ok) {
      console.error("Erreur lors de la vérification de la compromission du mot de passe:", response.statusText);
      return false; // Fail open if API is down
    }

    const text = await response.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [lineSuffix] = line.split(":");
      if (lineSuffix.trim() === suffix) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erreur dans checkPasswordCompromise:", error);
    return false;
  }
}

export async function signup(formData: z.infer<typeof signupSchema>) {
  const supabase = await createClient();

  // 0. Check if user already exists in Prisma
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: formData.email }, { username: formData.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === formData.email) {
      return { error: "Cet email est déjà utilisé" };
    }
    if (existingUser.username === formData.username) {
      return { error: "Ce nom d'utilisateur est déjà pris" };
    }
  }

  // Check for compromised password
  const isCompromised = await checkPasswordCompromise(formData.password);
  if (isCompromised) {
    return { error: "Veuillez en choisir un mot de passe plus fort" };
  }

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
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Erreur lors de la création du compte" };
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
        role: "USER",
      },
    });
  } catch (error) {
    console.error("Erreur Prisma:", error);
    // Rollback Supabase user if Prisma fails?
    // For now, just return error. Ideally we'd delete the auth user.
    return { error: "Erreur lors de la création du profil utilisateur" };
  }

  return { success: true };
}

export async function login(formData: z.infer<typeof loginSchema>) {
  const supabase = await createClient();

  let email = formData.nameOrEmail;

  // Check if input is an email
  const isEmail = z.string().email().safeParse(email).success;

  if (!isEmail) {
    // Assume it's a username and look up the email
    const user = await prisma.user.findUnique({
      where: { username: email },
      select: { email: true },
    });

    if (!user) {
      console.log(`[LOGIN] Nom d'utilisateur non trouvé: ${email}`);
      return { error: "Identifiants invalides" };
    }
    console.log(`[LOGIN] Nom d'utilisateur trouvé: ${user.email}`);
    email = user.email;
  } else {
    console.log(`[LOGIN] Tentative de connexion avec: ${email}`);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: formData.password,
  });

  if (error) {
    console.log(`[LOGIN] Erreur Supabase: ${error.message}`);
    return { error: error.message };
  }

  console.log(`[LOGIN] Connexion réussie: ${email}`);
  return { success: true };
}

export async function adminSignup(formData: z.infer<typeof adminSignupSchema>) {
  const supabase = await createClient();

  // 0. Check if user already exists in Prisma
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: formData.email }, { username: formData.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === formData.email) {
      return { error: "Cet email est déjà utilisé" };
    }
    if (existingUser.username === formData.username) {
      return { error: "Ce nom d'utilisateur est déjà pris" };
    }
  }

  // 1. Verify Access Key
  const accessKeyRecord = await prisma.accessKey.findUnique({
    where: { key: formData.accessKey },
  });

  if (!accessKeyRecord) {
    return { error: "Clé d'accès invalide" };
  }

  if (accessKeyRecord.isUsed) {
    return { error: "Cette clé d'accès a déjà été utilisée" };
  }

  // Verify role matches key role (optional, but good practice if keys are role-specific)
  // Assuming keys might be generic or specific. Let's trust the form role for now
  // OR enforce that the key's role matches the requested role.
  // For strictness:
  if (accessKeyRecord.role !== (formData.role as Role)) {
    return {
      error: `Cette clé n'est pas valide pour le rôle ${formData.role}`,
    };
  }

  // Check for compromised password
  const isCompromised = await checkPasswordCompromise(formData.password);
  if (isCompromised) {
    return {
      error:
        "Ce mot de passe a été compromis dans une fuite de données. Veuillez en choisir un autre pour votre sécurité.",
    };
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
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Erreur lors de la création du compte" };
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
          classe: "STAFF",
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
    ]);
  } catch (error) {
    console.error("Erreur Prisma:", error);
    return { error: "Erreur lors de la finalisation du compte" };
  }

  return { success: true };
}

export async function adminLogin(formData: z.infer<typeof adminLoginSchema>) {
  const supabase = await createClient();

  let email = formData.emailOrUsername;

  // Check if input is an email
  const isEmail = z.string().email().safeParse(email).success;

  if (!isEmail) {
    // Assume it's a username and look up the email
    const user = await prisma.user.findUnique({
      where: { username: email },
      select: { email: true },
    });

    if (!user) {
      return { error: "Identifiants invalides" };
    }
    email = user.email;
  }

  // 1. Sign In
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!authData.user) {
    return { error: "Erreur d'authentification" };
  }

  // 2. Verify Access Key ownership
  // We check if the provided access key was the one used by this user
  const accessKeyRecord = await prisma.accessKey.findUnique({
    where: { key: formData.accessKey },
  });

  if (!accessKeyRecord || accessKeyRecord.usedBy !== authData.user.id) {
    await supabase.auth.signOut();
    return { error: "Clé d'accès invalide pour cet utilisateur" };
  }

  // 3. Verify Role (Double check)
  const user = await prisma.user.findUnique({
    where: { id: authData.user.id },
  });

  if (!user || !["ADMIN", "MODERATOR", "WRITER"].includes(user.role)) {
    await supabase.auth.signOut();
    return { error: "Accès non autorisé" };
  }

  return { success: true };
}
