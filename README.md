# 📺 CSM Niangon TV

<div align="center">

[![Déploiement sur Vercel](https://img.shields.io/badge/deploy-vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![License MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev)

**Une plateforme web moderne et performante pour les écoles, clubs et associations**

[Installation](#-installation) • [Documentation](#-utilisation) • [Contribuer](#-contribution) • [License](#-license)

</div>

---

## 📋 Table of Contents

- [À Propos](#-à-propos)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Stack Technique](#-stack-technique)
- [📦 Prérequis](#-prérequis)
- [🚀 Installation](#-installation)
- [⚙️ Configuration](#-configuration)
- [👨‍💻 Utilisation](#-utilisation)
- [📁 Architecture](#-architecture)
- [🤝 Contribution](#-contribution)
- [📄 License](#-license)
- [💬 Support](#-support)

---

## 🎯 À Propos

**CSM Niangon TV** est une plateforme web complète et modulable dédiée à la diffusion d'informations scolaires. Elle permet aux écoles, clubs et associations de partager facilement :

- 📰 **Actualités et articles** : Publication d'informations institutionnelles
- 📅 **Événements** : Calendrier et annonces d'événements  
- 📄 **Communiqués** : Diffusion d'informations officielles
- 📚 **Ressources pédagogiques** : Partage de documents et contenus éducatifs
- 👥 **Gestion utilisateurs** : Rôles et permissions avancés

Construite avec les technologies les plus modernes, elle offre une **base performante, sécurisée et réutilisable** pour toute institution souhaitant disposer d'une vitrine numérique professionnelle.

---

## ✨ Fonctionnalités

### 📝 Gestion de Contenu
- ✅ Publication et gestion d'articles/actualités
- ✅ Support de plusieurs types de contenu (INFO, ARTICLE, ACTU, INTERVIEW)
- ✅ États du contenu (DRAFT, PUBLISHED, ARCHIVED)
- ✅ Markdown et contenu riche supporté
- ✅ Système de commentaires et likes

### 👤 Gestion Utilisateurs
- ✅ Authentification sécurisée (Supabase/JWT)
- ✅ Rôles et permissions (USER, WRITER, MODERATOR, ADMIN)
- ✅ Profils utilisateurs avec avatars
- ✅ Gestion des accès granulaire

### 🎨 Interface Utilisateur
- ✅ Design moderne et responsive
- ✅ Thème clair/sombre
- ✅ Animations fluides (Framer Motion)
- ✅ Accessibilité optimale (Radix UI)
- ✅ Navigation intuitive (Top nav & Bottom nav)

### ⚡ Performance & Architecture
- ✅ **Next.js App Router** : Pages statiques et dynamiques optimisées
- ✅ **SSR/SSG** : Rendu côté serveur et génération statique
- ✅ **Prisma ORM** : Accès base de données type-safe
- ✅ **React Query** : Gestion d'état et cache côté client
- ✅ **Vercel Analytics** : Monitoring des performances

### 🔐 Sécurité
- ✅ Chiffrement des mots de passe (bcryptjs)
- ✅ Middlewares d'authentification
- ✅ Validation des données (React Hook Form)
- ✅ Variables d'environnement sécurisées

---

## 🛠️ Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Framework** | Next.js | 16.0.7 |
| **Runtime** | React | 19.2.1 |
| **Langage** | TypeScript | 5.0+ |
| **Styling** | Tailwind CSS | Latest |
| **BDD** | Prisma + PostgreSQL | 6.19.3 |
| **Authentification** | Supabase | 2.108.2 |
| **UI Components** | Radix UI | Latest |
| **Animations** | Framer Motion | 12.23.24 |
| **Icons** | Lucide React | 0.553.0 |
| **Requêtes** | React Query | 5.90.7 |
| **Linting** | Biome | Latest |
| **Déploiement** | Vercel | - |

---

## 📦 Prérequis

Avant de commencer, assurez-vous que vous disposez de :

- **Node.js** 18+ (LTS recommandé) — [Télécharger](https://nodejs.org)
- **npm**, **pnpm** ou **yarn**
- **PostgreSQL** 12+ ou accès à une base PostgreSQL hébergée
- **Git** pour le contrôle de version
- **(Optionnel)** Un compte [Supabase](https://supabase.com) pour l'authentification
- **(Optionnel)** Un compte [Vercel](https://vercel.com) pour le déploiement

Vérifiez votre installation :

```bash
node --version    # v18.0.0+
npm --version     # 10.0.0+
git --version     # 2.0.0+
```

---

## 🚀 Installation

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/modalaiso/csm-niangon.git
cd csm-niangon
```

### 2️⃣ Installer les dépendances

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

### 3️⃣ Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Base de données
# Connexion à Postgres via le pooler de mode transactionnel partagé (IPv4 uniquement)
DATABASE_URL="postgresql://postgres.[ID du projet]:[Mot de passe]@[Region].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Connexion à Postgres via le pooler en mode session partagé (utilisé pour les migrations)
DIRECT_URL="postgresql://postgres.[ID du projet]:[Mot de passe]@[Region].pooler.supabase.com:5432/postgres"

# Supabase (authentification)
NEXT_PUBLIC_SUPABASE_URL=https://[ID du projet].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX...
SUPABASE_URL=https://[ID du projet].supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXX...
SUPABASE_SECRET_KEY=sb_secret_XXXX...
SUPABASE_JWKS_URL=https://[ID du projet].supabase.co/auth/v1/.well-known/jwks.json
```

Un fichier `.env.example` est fourni en référence.

### 4️⃣ Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:push

# (Optionnel) Peupler la BD avec des données de test
npm run prisma:seed
```

### 5️⃣ Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur. La page se recharge automatiquement lors des modifications.

---

## ⚙️ Configuration

### Base de Données

Pour configurer une **nouvelle base de données PostgreSQL** :

```bash
# Créer une migration
npx prisma migrate dev --name init

# Visualiser votre BD avec Prisma Studio
npm run prisma:studio
```

### Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres.[ID du projet]` |
| `DIRECT_URL` | URL directe (pour migrations) | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJxxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur Supabase | `eyJxxx...` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | `http://localhost:3000` |
| `NODE_ENV` | Environnement | `development` \| `production` |

---

## 👨‍💻 Utilisation

### Commandes Disponibles

```bash
# Développement
npm run dev              # Démarrer le serveur local
npm run build            # Build production
npm start                # Lancer l'app en production

# Linting & Formatting
npm run lint             # Vérifier avec Biome
npm run format           # Formater le code

# Prisma
npm run prisma:generate  # Générer le client Prisma
npm run prisma:push      # Exécuter les migrations
npm run prisma:studio    # Ouvrir Prisma Studio
npm run prisma:seed      # Peupler la BD avec des données
```

### Structure des Dossiers

```
csm-niangon/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── page.tsx           # Page d'accueil
│   │   ├── layout.tsx         # Layout principal
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Pages authentification
│   │   ├── admin/             # Pages admin
│   │   └── dashboard/         # Dashboard utilisateur
│   ├── components/             # Composants réutilisables
│   │   ├── forms/             # Formulaires
│   │   ├── nav/               # Navigation
│   │   └── ui/                # Composants UI génériques
│   ├── lib/                   # Utilitaires et helpers
│   │   ├── prisma.ts         # Client Prisma
│   │   ├── supabase/         # Clients Supabase
│   │   └── utils.ts          # Fonctions utilitaires
│   ├── types/                # Types TypeScript
│   └── utils/                # Utilitaires
├── prisma/
│   ├── schema.prisma         # Schéma de la base de données
│   ├── migrations/           # Historique des migrations
│   └── seed.ts              # Script de seed
├── public/                   # Fichiers statiques
├── docs/                    # Documentation et designs
├── .env.local               # Variables d'environnement (à créer)
├── biome.json              # Configuration Biome
├── tsconfig.json           # Configuration TypeScript
├── tailwind.config.js      # Configuration Tailwind
├── next.config.ts          # Configuration Next.js
└── package.json            # Dépendances du projet
```

### Modèle de Données

Le projet utilise **Prisma** avec **PostgreSQL**. Voici les principales entités :

```
User (Utilisateur)
├── roles: USER, WRITER, MODERATOR, ADMIN
├── posts: Articles créés
├── comments: Commentaires
└── likes: Contenus aimés

Post (Contenu/Article)
├── types: INFO, ARTICLE, ACTU, INTERVIEW
├── status: DRAFT, PUBLISHED, ARCHIVED
├── author: Utilisateur
├── comments: Commentaires
└── likes: Likes

Comment (Commentaire)
├── author: Utilisateur
└── post: Article

Like (Like)
├── user: Utilisateur
└── post: Article
```

---

## 📁 Architecture

### Principes de Design

1. **App Router** : Utilisation du dernier router Next.js pour des pages optimisées
2. **Server Components** : Composants serveur par défaut pour la performance
3. **Type Safety** : TypeScript strict pour éviter les bugs
4. **Modularité** : Séparation claire des responsabilités
5. **DRY** : Réutilisation maximale du code
6. **Accessibilité** : Composants accessible (WCAG 2.1)

### Authentification

- Intégration **Supabase** pour l'authentification
- Middleware pour protéger les routes
- JWT pour les sessions utilisateur
- Rôles et permissions granulaires

### Sécurité

- HTTPS obligatoire en production
- CORS configuré
- Protection CSRF
- Validation des données côté serveur
- Sanitisation des inputs

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Suivez ces étapes :

### 1. Fork le projet

```bash
# Sur GitHub, cliquez sur "Fork"
```

### 2. Créer une branche feature

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Faire vos modifications

```bash
# Développez votre fonctionnalité
# Assurez-vous que le linting passe
npm run lint
npm run format
```

### 4. Commit avec des messages clairs

```bash
git commit -m "feat: ajouter nouvelle fonctionnalité"
```

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour une correction de bug
- `docs:` pour la documentation
- `style:` pour le formatage
- `refactor:` pour une refonte
- `test:` pour les tests
- `chore:` pour les tâches de maintenance

### 5. Push et créer une Pull Request

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Créez une PR sur GitHub avec une description claire de vos modifications.

### Guidelines

- 📝 Écrivez des tests pour les nouvelles fonctionnalités
- 🎨 Respectez le style de code du projet
- 📖 Documentez les changements importants
- ♿ Assurez-vous que le code est accessible
- 🔒 Ne committez pas de fichiers sensibles (.env, clés API)
- ✅ Vérifiez que tout passe localement avant de pousser

---

## 📄 License

Ce projet est sous licence **MIT**. Consultez le fichier [LICENSE](LICENSE) pour plus de détails.

Cela signifie que vous êtes libre de :
- ✅ Utiliser le code à titre commercial
- ✅ Modifier le code
- ✅ Distribuer le code
- ✅ Utiliser à titre privé

À condition de :
- ⚠️ Inclure une copie de la license
- ⚠️ Inclure la notice de copyright

---

## 💬 Support

### Questions ?

- 📖 Consultez la [documentation Next.js](https://nextjs.org/docs)
- 🐛 Vérifiez les [issues existantes](https://github.com/modalaiso/csm-niangon/issues)
- 💬 [Ouvrez une issue](https://github.com/modalaiso/csm-niangon/issues/new)
- 📧 Contactez les mainteneurs

### Ressources Utiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)

---

## 🙌 Remerciements

- [Next.js](https://nextjs.org) - Framework React moderne
- [Prisma](https://www.prisma.io) - ORM type-safe
- [Supabase](https://supabase.com) - Backend open source
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Radix UI](https://www.radix-ui.com) - Composants accessibles
- Tous les contributeurs et la communauté

---

## 📈 Roadmap

### ✅ Complété
- [x] Authentification utilisateur
- [x] Gestion de contenu
- [x] Système de rôles
- [x] Interface responsive

### 🚧 En cours
- [ ] Notifications en temps réel
- [ ] Système de recherche avancée
- [ ] API publique REST

### 🔮 Futur
- [ ] Export PDF des articles
- [ ] Calendrier interactif
- [ ] Système de modération
- [ ] Support multilingue
- [ ] Analytics avancées

---

<div align="center">

Made with ❤️ by the [CSM Niangon](https://github.com/modalaiso/csm-niangon) team

[GitHub](https://github.com/modalaiso/csm-niangon) • [Issues](https://github.com/modalaiso/csm-niangon/issues) • [Discussions](https://github.com/modalaiso/csm-niangon/discussions)

⭐ Si ce projet vous a été utile, n'oubliez pas de laisser une star !

</div>
