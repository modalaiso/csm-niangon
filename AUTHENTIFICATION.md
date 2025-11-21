# Pages d'Authentification - CSM Niangon

Ce document décrit les pages d'authentification créées pour l'application CSM Niangon.

## Pages Créées

### 1. Page d'Accueil (`/`)
La page d'accueil affiche trois cartes permettant d'accéder aux différentes sections :
- **Connexion** : Accès à la page de connexion utilisateur
- **Admin** : Accès à la page de connexion administrateur
- **Inscription** : Accès à la page d'inscription

**Fichier** : `src/app/page.tsx`

### 2. Page de Connexion Utilisateur (`/login`)
Formulaire de connexion pour les utilisateurs normaux (Utilisateurs, Modérateurs, Contributeurs).

**Champs** :
- Nom (ou Email)
- Mot de passe
- Clé d'accès

**Fonctionnalités** :
- Validation des champs
- Lien vers l'inscription
- Lien vers la connexion admin (via bouton)

**Fichier** : `src/app/login/page.tsx`

### 3. Page de Connexion Admin (`/admin-login`)
Formulaire de connexion simplifié pour les administrateurs.

**Champs** :
- Email / Nom d'utilisateur
- Mot de passe

**Fonctionnalités** :
- Bouton retour en haut à droite
- Icône de protection (shield)
- Lien de retour vers la connexion utilisateur

**Fichier** : `src/app/admin-login/page.tsx`

### 4. Page d'Inscription (`/signup`)
Formulaire complet d'inscription avec tous les champs nécessaires.

**Champs** :
- Nom
- Prénoms
- Nom d'utilisateur
- Classe (sélecteur)
- Email
- Mot de passe
- Confirmation du mot de passe
- Clé d'accès

**Fonctionnalités** :
- Validation complète des champs
- Sélecteur de classe
- Vérification de correspondance des mots de passe
- Lien vers la connexion

**Fichier** : `src/app/signup/page.tsx`

## Composants Créés

### Formulaires
- **LoginForm** : `src/components/forms/login-form.tsx`
- **AdminLoginForm** : `src/components/forms/admin-login-form.tsx`
- **SignupForm** : `src/components/forms/signup-form.tsx`

### Composants UI
- **Button** : `src/components/ui/button.tsx`
- **Input** : `src/components/ui/input.tsx`
- **Label** : `src/components/ui/label.tsx`
- **Select** : `src/components/ui/select.tsx`

## Schémas de Validation (Zod)

### LoginSchema
```typescript
{
  nameOrEmail: string (min 1),
  password: string (min 1),
  accessKey: string (min 1)
}
```

### AdminLoginSchema
```typescript
{
  email: string (email valide),
  password: string (min 1)
}
```

### SignupSchema
```typescript
{
  lastName: string (min 1),
  firstName: string (min 1),
  username: string (min 3),
  class: string (min 1),
  email: string (email valide),
  password: string (min 8),
  confirmPassword: string (doit correspondre à password),
  accessKey: string (min 1)
}
```

## Design

- **Palette de couleurs** : 
  - Fond : Gradient bleu à vert
  - Cartes : Blanc avec bordure verte (4px)
  - Boutons : Bleu (#2563eb)
  - Focus : Anneau bleu

- **Bordures** : Arrondies (rounded-lg, rounded-3xl)
- **Espacement** : Padding 4-8 (16-32px)
- **Typographie** : Geist sans et mono

## Intégrations Futures

Pour intégrer l'authentification réelle, modifiez la prop `onSubmit` de chaque formulaire :

```typescript
<LoginForm onSubmit={handleLogin} />
```

Où `handleLogin` effectuera la requête d'authentification vers votre backend.

## Fichiers de Configuration Utilisés

- `tailwind.config.js` : Stylisation Tailwind CSS
- `next.config.ts` : Configuration Next.js
- `tsconfig.json` : Configuration TypeScript
- `package.json` : Dépendances du projet

## Dépendances Requises

- `react-hook-form` : Gestion des formulaires
- `@hookform/resolvers` : Intégration Zod avec react-hook-form
- `zod` : Validation des schémas
- `@radix-ui/react-select` : Composant Select
- `lucide-react` : Icônes
- `tailwind-merge` : Fusion des classes Tailwind
- `clsx` : Fusion conditionnelle des classes

Toutes ces dépendances sont déjà présentes dans `package.json`.
