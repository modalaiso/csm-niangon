# CSM Niangon TV

<div align="center">

[![Deploiement sur Vercel](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.2.1-61dafb?style=for-the-badge&logo=react)](https://react.dev)

**Une plateforme web moderne et performante pour les ecoles, clubs et associations**

[Installation](#installation) - [Documentation](#utilisation) - [Contribuer](#contribution) - [License](#license)

</div>

---

## Table des matieres

- [A Propos](#a-propos)
- [Fonctionnalites](#fonctionnalites)
- [Stack Technique](#stack-technique)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [Contribution](#contribution)
- [License](#license)
- [Support](#support)

---

## A Propos

**CSM Niangon TV** est une plateforme web dediee a la diffusion d'informations scolaires. Elle permet aux ecoles, clubs et associations de partager :

- Actualites et articles
- Evenements
- Communiques
- Ressources pedagogiques
- Gestion des utilisateurs (roles et permissions)

Construite avec Next.js, Prisma et Supabase, elle offre une base reutilisable pour toute institution souhaitant disposer d'une vitrine numerique.

---

## Fonctionnalites

### Gestion de Contenu
- Publication et gestion d'articles/actualites
- Systeme de commentaires et likes

> Note : les types de contenu (INFO, ARTICLE, ACTU, INTERVIEW), les statuts (DRAFT, PUBLISHED, ARCHIVED) et le modele de donnees exact doivent etre verifies contre `prisma/schema.prisma`, qui fait foi.

### Gestion Utilisateurs
- Authentification via Supabase
- Roles : USER, WRITER, MODERATOR, ADMIN
- Cles d'acces dediees pour MODERATOR / WRITER / ADMIN (voir `src/lib/access-keys.ts`)

### Interface Utilisateur
- Design responsive (Tailwind CSS)
- Animations (Framer Motion)
- Composants accessibles (Radix UI)
- Navigation top/bottom (`top-nav.tsx`, `bottom-nav.tsx`)

### Performance & Architecture
- Next.js App Router (Server Components par defaut)
- Prisma ORM (acces base de donnees type-safe)
- React Query pour la gestion d'etat cote client
- Vercel Analytics

### Securite
- Chiffrement des mots de passe (bcryptjs)
- Middleware d'authentification (`proxy.ts`)
- Validation des donnees (React Hook Form + Zod)
- Variables d'environnement non commitees (`.env` exclu via `.gitignore`)

---

## Stack Technique

| Categorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 16.2.9 |
| Runtime | React | 19.2.1 |
| Langage | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4.18 |
| BDD | Prisma + PostgreSQL | 6.19.3 |
| Authentification | Supabase (`@supabase/supabase-js` + `@supabase/ssr`) | 2.108.2 / 0.7.0 |
| UI Components | Radix UI | multi-packages, voir `package.json` |
| Animations | Framer Motion | 12.23.24 |
| Icons | Lucide React | 0.553.0 |
| Requetes | React Query (`@tanstack/react-query`) | 5.90.7 |
| Formulaires | React Hook Form + Zod | 7.66.0 / 3.25.76 |
| State management | Zustand | 5.0.8 |
| Linting/Format | Biome | 2.2.0 |
| Deploiement | Vercel | - |

---

## Prerequis

- Node.js 18+ (LTS recommande) - [Telecharger](https://nodejs.org)
- npm, pnpm ou yarn
- Projet Supabase (PostgreSQL hebergee + authentification)
- Git
- (Optionnel) Compte [Vercel](https://vercel.com) pour le deploiement

Verifiez votre installation :

```bash
node --version    # v18.0.0+
npm --version     # 10.0.0+
git --version     # 2.0.0+
```

---

## Installation

### 1. Cloner le depot

```bash
git clone https://github.com/modalaiso/csm-niangon.git
cd csm-niangon
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Creer un fichier `.env` a la racine du projet (un `.env.example` est fourni comme reference) :

```env
# Base de donnees - pooler transaction mode (IPv4 uniquement)
DATABASE_URL="postgresql://postgres.[ID_PROJET]:[MOT_DE_PASSE]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Base de donnees - pooler session mode (utilise pour les migrations)
DIRECT_URL="postgresql://postgres.[ID_PROJET]:[MOT_DE_PASSE]@[REGION].pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[ID_PROJET].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX...
SUPABASE_URL=https://[ID_PROJET].supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX...
SUPABASE_SECRET_KEY=sb_secret_XXXX...
SUPABASE_JWKS_URL=https://[ID_PROJET].supabase.co/auth/v1/.well-known/jwks.json

# Cles d'acces (a remplir manuellement)
MODERATOR_KEY_1=
MODERATOR_KEY_2=
MODERATOR_KEY_3=
WRITER_KEY_1=
WRITER_KEY_2=
WRITER_KEY_3=
ADMIN_KEY_1=
ADMIN_KEY_2=
ADMIN_KEY_3=
```

Important : ces identifiants sont sensibles. Ne jamais les commiter, et regenerer le mot de passe Postgres ou les cles Supabase en cas de doute sur une fuite.

### 4. Initialiser la base de donnees

```bash
# Generer le client Prisma
npm run prisma:generate

# Appliquer les migrations existantes (recommande, coherent avec prisma/migrations/)
npx prisma migrate deploy

# (Optionnel, developpement uniquement) pousser le schema sans creer de migration
npm run prisma:push

# (Optionnel) peupler la BD avec les cles d'acces
npm run prisma:seed
```

> Le projet contient un historique de migrations (`prisma/migrations/`). En developpement comme en production, preferez `prisma migrate dev` / `prisma migrate deploy` a `prisma db push`, qui ne genere pas de fichier de migration et peut faire diverger le schema entre environnements.

### 5. Lancer le serveur de developpement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Configuration

### Base de donnees

```bash
# Creer une nouvelle migration apres modification du schema
npx prisma migrate dev --name nom_de_la_migration

# Visualiser la BD avec Prisma Studio
npm run prisma:studio
```

### Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL via le pooler (port 6543) |
| `DIRECT_URL` | URL de connexion directe/session, utilisee pour les migrations (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Cle publique Supabase (cote client) |
| `SUPABASE_SECRET_KEY` | Cle secrete Supabase (cote serveur uniquement) |
| `SUPABASE_JWKS_URL` | URL du JWKS pour la verification des JWT |
| `MODERATOR_KEYS` | Cles d'invitation pour le role MODERATOR |
| `WRITER_KEYS` | Cles d'invitation pour le role WRITER |
| `ADMIN_KEYS` | Cles d'invitation pour le role ADMIN |

---

## Utilisation

### Commandes disponibles

```bash
# Developpement
npm run dev              # Demarrer le serveur local
npm run build             # Build production
npm start                 # Lancer l'app en production

# Linting & Formatting
npm run lint               # Verifier avec Biome
npm run format             # Formater le code

# Prisma
npm run prisma:generate    # Generer le client Prisma
npm run prisma:push        # Pousser le schema (dev uniquement, sans migration)
npm run prisma:studio      # Ouvrir Prisma Studio
npm run prisma:seed        # Peupler la BD (cles d'acces)
```

### Structure des dossiers

```
csm-niangon/
├── src/
│   ├── app/                        # Pages Next.js App Router
│   │   ├── page.tsx                # Page d'accueil
│   │   ├── layout.tsx              # Layout principal
│   │   ├── globals.css             # Styles globaux
│   │   ├── manifest.json           # Manifest PWA
│   │   ├── favicon.ico / icon0.svg / icon1.png / apple-icon.png
│   │   ├── actions/
│   │   │   └── auth.ts             # Server action d'authentification
│   │   ├── login/
│   │   │   └── page.tsx            # Connexion utilisateur
│   │   ├── signup/
│   │   │   └── page.tsx            # Inscription utilisateur
│   │   ├── admin-login/
│   │   │   └── page.tsx            # Connexion admin/moderateur/redacteur
│   │   ├── admin-signup/
│   │   │   └── page.tsx            # Inscription admin/moderateur/redacteur
│   │   └── dashboard/
│   │       └── page.tsx            # Dashboard utilisateur
│   ├── components/
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   ├── admin-login-form.tsx
│   │   │   └── admin-signup-form.tsx
│   │   ├── nav/
│   │   │   ├── top-nav.tsx
│   │   │   └── bottom-nav.tsx
│   │   └── ui/                     # Composants Radix
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── sheet.tsx
│   ├── lib/
│   │   ├── prisma.ts               # Client Prisma (singleton)
│   │   ├── access-keys.ts          # Validation des cles d'acces
│   │   ├── utils.ts                # Fonctions utilitaires (cn, etc.)
│   │   └── supabase/
│   │       └── server.ts           # Client Supabase (server)
│   ├── utils/
│   │   └── supabase/               # Doublon avec lib/supabase a clarifier
│   │       ├── client.ts           # Client Supabase (browser)
│   │       ├── middleware.ts       # Client Supabase (middleware)
│   │       └── server.ts           # Client Supabase (server)
│   ├── proxy.ts                    # Middleware Supabase (auth refresh)
│   └── types/
│       └── index.ts                # Types TypeScript partages
├── prisma/
│   ├── schema.prisma                # Schema de la base de donnees
│   ├── seed.ts                      # Script de seed (cles d'acces)
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260619220156_init/
│           └── migration.sql
├── public/
│   ├── Logo.png / logo-b.png / logo-g.png / logo-w.png
│   ├── file.svg / globe.svg / next.svg / vercel.svg / window.svg
│   └── web-app-manifest-192x192.png / web-app-manifest-512x512.png
├── docs/
│   ├── cdc_app-media_c_ntic&info.odt / .pdf   # Cahier des charges
│   └── design/
│       ├── CSM Niangon.fig
│       ├── Auth/
│       ├── Wireframe/
│       └── nav/
│           ├── top_nav/
│           └── bottom_nav/
├── .vscode/
│   └── settings.json
├── .env                             # Variables d'environnement reelles (non commite)
├── .env.example                     # Modele des variables requises
├── .gitignore
├── biome.json
├── components.json
├── next.config.ts
├── next-env.d.ts
├── postcss.config.js / postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── package-lock.json
```

### Modele de donnees

Le projet utilise Prisma avec PostgreSQL. Le schema exact (entites, champs, relations) est defini dans `prisma/schema.prisma`, qui fait foi. A date de cette documentation, le projet expose au minimum un modele `AccessKey` (cles d'invitation par role) et un modele `User` lie a l'authentification Supabase.

---

## Architecture

### Principes de design

1. App Router : routage Next.js le plus recent
2. Server Components par defaut
3. TypeScript strict
4. Separation des responsabilites (app / components / lib / utils)
5. Composants accessibles (Radix UI)

### Authentification

- Supabase pour l'authentification (`@supabase/ssr`)
- Middleware (`proxy.ts`) pour rafraichir la session et proteger les routes
- Cles d'acces dediees pour l'attribution des roles MODERATOR / WRITER / ADMIN

### Securite

- Variables d'environnement exclues du depot via `.gitignore`
- Mots de passe hashes avec bcryptjs
- Validation des formulaires cote client et serveur (Zod)

---

## Contribution

### 1. Fork le projet

### 2. Creer une branche feature

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Faire vos modifications

```bash
npm run lint
npm run format
```

### 4. Commit avec des messages clairs

```bash
git commit -m "feat: ajouter nouvelle fonctionnalite"
```

Convention [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` nouvelle fonctionnalite
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage
- `refactor:` refonte
- `test:` tests
- `chore:` maintenance

### 5. Push et Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

### Guidelines

- Respectez le style de code du projet
- Documentez les changements importants
- Ne committez jamais de fichiers sensibles (`.env`, cles API)
- Verifiez que `npm run lint` et `npm run build` passent avant de pousser

---

## License

Projet sous licence MIT. Voir le fichier [LICENSE](LICENSE).

Vous etes libre de :
- Utiliser le code a titre commercial
- Modifier le code
- Distribuer le code
- Utiliser a titre prive

A condition de :
- Inclure une copie de la licence
- Inclure la notice de copyright

---

## Support

- [Documentation Next.js](https://nextjs.org/docs)
- [Issues existantes](https://github.com/modalaiso/csm-niangon/issues)
- [Ouvrir une issue](https://github.com/modalaiso/csm-niangon/issues/new)

### Ressources utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)

---

## Remerciements

- [Next.js](https://nextjs.org)
- [Prisma](https://www.prisma.io)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

---

## Roadmap

### Complete
- Authentification utilisateur
- Gestion des roles et cles d'acces
- Interface responsive

### En cours
- Gestion de contenu (articles, evenements, documents)
- Dashboard utilisateur

### Futur
- Notifications en temps reel
- Recherche avancee
- Export PDF des articles
- Support multilingue

---

<div align="center">

Cree par [Mobio Israel](https://github.com/modalaiso)

[GitHub](https://github.com/modalaiso/csm-niangon) - [Issues](https://github.com/modalaiso/csm-niangon/issues) - [Discussions](https://github.com/modalaiso/csm-niangon/discussions)

</div>