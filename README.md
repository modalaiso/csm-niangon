# CSM Niangon

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

CSM Niangon est une plateforme web moderne dédiée à la publication et à la gestion de contenu pour les établissements, clubs et associations. Elle centralise les actualités, événements et communications institutionnelles afin d'améliorer la diffusion d’information et la présence numérique.

Le projet vise à offrir une expérience simple, rapide et sécurisée pour organiser le contenu éditorial tout en intégrant des rôles utilisateurs, des outils de modération et des fonctionnalités de gestion de contenu évoluées.

---

## 📚 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Variables d’environnement](#-variables-denvironnement)
- [Utilisation](#️-utilisation)
- [Architecture du projet](#-architecture-du-projet)
- [Contribution](#-contribution)
- [Auteur & contact](#-auteur--contact)
- [Licence](#-licence)

---

## 🌍 À propos

CSM Niangon permet à une organisation de gérer son contenu en ligne avec une structure claire et performante. La plateforme prend en charge la publication d’articles, la gestion des événements, l’authentification, le rôle des utilisateurs et la mise à jour de contenus selon des permissions définies.

Elle est conçue pour être facilement déployable, maintenable et extensible, avec une base technique orientée performance, sécurité et qualité de code.

---

## ✨ Fonctionnalités

- Gestion des contenus éditoriaux : actualités, annonces, articles et ressources
- Système d’authentification et gestion des rôles utilisateurs
- Modération et validation des messages et contenus
- Interface responsive et ergonomique pour mobile et desktop
- Publication structurée avec support des médias et du contenu enrichi
- Tableau de bord administratif pour une gestion centralisée
- Intégration avec Supabase et Prisma pour un backend robuste et scalable

---

## 🧰 Stack technique

| Catégorie | Technologie |
| --- | --- |
| Framework | Next.js |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API routes |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Authentification | Supabase |
| Validation | Zod |
| UI | Radix UI, Tailwind |
| Animations | Framer Motion |
| Tests | Vitest, Playwright |
| Déploiement | Vercel |

---

## ✅ Prérequis

Avant de commencer, assurez-vous d’avoir installé :

- Node.js >= 18
- npm ou pnpm ou yarn
- Git
- PostgreSQL
- Un projet Supabase
- Docker (optionnel, selon votre environnement de développement)

Vérification rapide :

```bash
node --version
npm --version
git --version
```

---

## 🚀 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/modalaiso/csm-niangon.git
cd csm-niangon
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d’environnement

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Puis remplissez les variables nécessaires.

### 4. Générer le client Prisma

```bash
npm run prisma:generate
```

### 5. Appliquer les migrations

```bash
npx prisma migrate dev
```

ou en production :

```bash
npm run prisma:deploy
```

### 6. Démarrer le projet

```bash
npm run dev
```

Le projet sera accessible sur :

```text
http://localhost:3000
```

---

## 🔐 Variables d’environnement

Le projet utilise des variables de configuration essentielles pour la base de données, l’authentification et les rôles d’accès.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `DIRECT_URL` | URL directe de connexion PostgreSQL pour les migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase côté client |
| `SUPABASE_URL` | URL Supabase côté serveur |
| `SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase côté serveur |
| `SUPABASE_SECRET_KEY` | Clé secrète Supabase |
| `SUPABASE_JWKS_URL` | URL JWKS pour la validation des JWT |
| `MODERATOR_KEYS` | Clés d’accès pour les modérateurs |
| `WRITER_KEYS` | Clés d’accès pour les rédacteurs |
| `ADMIN_KEYS` | Clés d’accès pour les administrateurs |

Exemple :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/csm_niangon"
DIRECT_URL="postgresql://user:password@localhost:5432/csm_niangon"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your_publishable_key"
SUPABASE_SECRET_KEY="your_secret_key"
SUPABASE_JWKS_URL="https://your-project.supabase.co/auth/v1/.well-known/jwks.json"

MODERATOR_KEYS="key1,key2"
WRITER_KEYS="writer-key-1"
ADMIN_KEYS="admin-key-1"
```

---

## 🛠️ Utilisation

### Commandes utiles

```bash
# Démarrage en développement
npm run dev

# Build production
npm run build

# Démarrage production
npm run start

# Vérification du code
npm run lint

# Formatage
npm run format

# Prisma
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
```

### Exécution des tests

```bash
npm run test:unit
npm run test:e2e
```

---

## 🧱 Architecture du projet

```text
csm-niangon/
├── AGENTS.md
├── CLAUDE.md
├── LICENSE
├── README.md
├── biome.json
├── components.json
├── docs/
├── e2e/
│   ├── auth.spec.ts
│   ├── home.spec.ts
│   ├── legal-pages.spec.ts
│   └── schedules.spec.ts
├── eslint.config.js
├── next.config.ts
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── postcss.config.mjs
├── prisma/
│   ├── migrations/
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── 100years.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── bg.png
│   ├── file.svg
│   ├── globe.svg
│   ├── logo-b.png
│   ├── logo-g.png
│   ├── logo-w.png
│   ├── logo.png
│   ├── miniature.png
│   ├── vercel.svg
│   ├── web-app-manifest-192x192.png
│   ├── web-app-manifest-512x512.png
│   └── window.svg
├── sonar-project.properties
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   ├── admin-comments.ts
│   │   │   ├── admin-dashboard.ts
│   │   │   ├── admin-posts.ts
│   │   │   ├── admin-users.ts
│   │   │   ├── analytics.ts
│   │   │   ├── announcements.ts
│   │   │   ├── auth.ts
│   │   │   ├── comments.ts
│   │   │   ├── infobar.ts
│   │   │   ├── likes.ts
│   │   │   ├── moderation.ts
│   │   │   ├── posts.ts
│   │   │   ├── profile.ts
│   │   │   ├── schedules.ts
│   │   │   └── search.ts
│   │   ├── actus/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │   ├── comments/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx
│   │   │   ├── page.tsx
│   │   │   ├── posts/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── schedules/
│   │   │   │   ├── [classId]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── users/
│   │   │       └── page.tsx
│   │   ├── admin-login/
│   │   │   └── page.tsx
│   │   ├── admin-signup/
│   │   │   └── page.tsx
│   │   ├── apple-icon.png
│   │   ├── apple-touch-icon.png
│   │   ├── cgu/
│   │   │   └── page.tsx
│   │   ├── confidentialite/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── emplois-du-temps/
│   │   │   ├── [classId]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── icon0.svg
│   │   ├── icon1.png
│   │   ├── infos/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── manifest.json
│   │   ├── mentions-legales/
│   │   │   └── page.tsx
│   │   ├── not-found.tsx
│   │   ├── page.tsx
│   │   ├── posts/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── results/
│   │   │       └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── site.webmanifest
│   ├── components/
│   │   ├── actus/
│   │   │   └── actu-explorer.tsx
│   │   ├── admin/
│   │   │   ├── admin-comments-table.tsx
│   │   │   ├── admin-posts-table.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── admin-topbar.tsx
│   │   │   ├── admin-users-table.tsx
│   │   │   ├── announcement-duration-select.tsx
│   │   │   ├── class-subject-manager.tsx
│   │   │   ├── content-editor.tsx
│   │   │   ├── moderation-keywords-panel.tsx
│   │   │   ├── moderation-log-list.tsx
│   │   │   ├── moderation-queue.tsx
│   │   │   ├── moderation-tabs.tsx
│   │   │   ├── multi-image-upload-field.tsx
│   │   │   ├── post-create-wizard.tsx
│   │   │   ├── schedule-editor.tsx
│   │   │   ├── table-pagination.tsx
│   │   │   ├── useAdminList.ts
│   │   │   └── visit-trend-chart.tsx
│   │   ├── analytics/
│   │   │   ├── analytics-gate.tsx
│   │   │   └── visit-tracker.tsx
│   │   ├── announcements/
│   │   │   ├── announcement-events.ts
│   │   │   └── announcement-popup.tsx
│   │   ├── cookies/
│   │   │   └── cookie-consent-banner.tsx
│   │   ├── footer/
│   │   │   └── site-footer.tsx
│   │   ├── forms/
│   │   │   ├── admin-login-form.tsx
│   │   │   ├── admin-signup-form.tsx
│   │   │   ├── login-form.tsx
│   │   │   └── signup-form.tsx
│   │   ├── home/
│   │   │   ├── hero-carousel.tsx
│   │   │   └── posts-explorer.tsx
│   │   ├── icons/
│   │   │   ├── icons.tsx
│   │   │   ├── nav-icons.tsx
│   │   │   └── social-icons.tsx
│   │   ├── info-bar/
│   │   │   └── info-bar.tsx
│   │   ├── infos/
│   │   │   └── info-explorer.tsx
│   │   ├── legal/
│   │   │   └── legal-page-layout.tsx
│   │   ├── nav/
│   │   │   ├── bottom-nav.tsx
│   │   │   ├── profile-menu.tsx
│   │   │   └── top-nav.tsx
│   │   ├── posts/
│   │   │   ├── comment-section.tsx
│   │   │   ├── like-button.tsx
│   │   │   ├── post-gallery.tsx
│   │   │   ├── post-results.tsx
│   │   │   ├── post-type-explorer.tsx
│   │   │   └── share-button.tsx
│   │   ├── profile/
│   │   │   ├── avatar-upload.tsx
│   │   │   └── profile-form.tsx
│   │   ├── schedule/
│   │   │   ├── other-classes-list.tsx
│   │   │   ├── schedule-document.tsx
│   │   │   └── schedule-export.tsx
│   │   ├── search/
│   │   │   └── search-dropdown.tsx
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── sheet.tsx
│   │       └── view-mode-toggle.tsx
│   ├── lib/
│   │   ├── access-keys.ts
│   │   ├── auth/
│   │   │   └── admin-guard.ts
│   │   ├── cookie-consent.ts
│   │   ├── prisma.ts
│   │   ├── render-post-content.tsx
│   │   ├── schedules.ts
│   │   ├── supabase/
│   │   │   └── server.ts
│   │   ├── utils.ts
│   │   └── viewCount.ts
│   ├── proxy.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── supabase/
│           ├── client.ts
│           └── middleware.ts
├── tailwind.config.js
├── tests/
│   ├── integration/
│   │   ├── moderation.test.ts
│   │   ├── posts.test.ts
│   │   └── schedules-actions.test.ts
│   ├── setup.ts
│   └── unit/
│       ├── render-post-content.test.tsx
│       ├── schedules.test.ts
│       └── utils.test.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche :

   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```

3. Committez vos changements :

   ```bash
   git commit -m "Ajout de ma fonctionnalité"
   ```

4. Poussez vers votre fork :

   ```bash
   git push origin feature/ma-fonctionnalite
   ```

5. Ouvrez une Pull Request

Merci de respecter les standards de qualité, le style de code existant et la documentation associée.

---

## 👤 Auteur & contact

- Nom : modalaiso
- GitHub : [@modalaiso](https://github.com/modalaiso)
- Site / portfolio : [GitHub profile](https://github.com/modalaiso)

Pour toute question, suggestion ou proposition de collaboration, contactez l’auteur via GitHub ou via le dépôt du projet.

---

## 📄 Licence

Ce projet est distribué sous la licence MIT.

Voir le fichier `LICENSE` pour plus de détails.
