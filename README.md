# CSM Niangon TV

[csm-niangon.vercel.app](https://csm-niangon.vercel.app)

- ![Déploiement sur Vercel](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel)
- ![Actions GitHub](https://img.shields.io/github/actions/workflow/status/modalaiso/csm-niangon/ci.yml?branch=main&label=CI)
- ![Codecov](https://img.shields.io/codecov/c/gh/modalaiso/csm-niangon)
- ![Licence MIT](https://img.shields.io/badge/license-MIT-green)

Description
CSM Niangon est une plateforme de diffusion d'informations (site type blog / intranet scolaire) développée avec Next.js. Elle est pensée pour partager actualités, événements et contenus pédagogiques pour une école ou une collectivité. Projet open-source, gratuit et réutilisable — attribution requise (voir section Licence).

Principales fonctionnalités
- Publication d'articles / actualités
- Pages statiques et pages dynamiques (Next.js)
- Gestion de contenu côté back (Prisma / base de données)
- Intégration Supabase possible (dépendances présentes)
- UI moderne avec Tailwind CSS, Radix UI et Framer Motion

Stack technique (extraits pertinents)
- next 16.0.7
- react 19.2.1 / react-dom 19.2.1
- tailwindcss (+ tailwindcss-animate)
- prisma (@prisma/client & prisma)
- supabase (@supabase/supabase-js)
- @tanstack/react-query
- radux/radix-ui components, headlessui, framer-motion
- TypeScript

Prérequis
- Node.js (version recommandée : 18+ ou la version LTS récente)
- npm (ou pnpm/yarn si vous adaptez les commandes)
- (Optionnel) accès à une base de données pour Prisma (SQLite, Postgres, MySQL...)
- Compte Vercel pour déploiement facilité

Installation (locale)
1. Cloner le dépôt
   git clone https://github.com/modalaiso/csm-niangon.git
   cd csm-niangon

2. Installer les dépendances
   npm install

3. Configuration des variables d'environnement
   - Créez un fichier .env à la racine (ou .env.local)
   - Variables typiques (adapter selon votre config) :
     NEXT_PUBLIC_SUPABASE_URL=
     NEXT_PUBLIC_SUPABASE_ANON_KEY=
     DATABASE_URL="postgresql://user:password@host:5432/dbname"
   - Exemple : créer un fichier .env.example dans le repo pour montrer les variables requises.

4. Générer / pousser le schéma Prisma (si utilisé)
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:studio   # pour ouvrir l'interface Prisma Studio

Commandes utiles
- Développement
  npm run dev
  (ouvre le site en local, par défaut sur http://localhost:3000)

- Build de production
  npm run build
  npm start  # démarre le serveur Next en mode production (si nécessaire)

- Lint / format
  npm run lint
  npm run format

- Prisma (exemples présents dans package.json)
  npm run prisma:generate
  npm run prisma:push
  npm run prisma:studio
  npm run prisma:seed  # si un script de seed est fourni

Configuration et remarques
- Versions Next.js et React : le projet est configuré pour next@16.0.7 et react@19.2.1. Vérifiez bien la compatibilité des plugins et de vos dépendances si vous mettez à jour.
- Tailwind CSS est configuré (fichier tailwind.config.js présent). Pour modifier le thème ou ajouter des plugins, éditez ce fichier.
- Si vous utilisez Supabase, configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY. Pour SSR côté serveur, utilisez les clés serveur en variables d'environnement non exposées côté client.
- Prisma : vérifiez prisma/schema.prisma (dossier prisma/) pour adapter les modèles et la connexion à la base de données.

Déploiement
- Recommandé : Vercel (déploiement optimisé pour Next.js).
  1. Connectez le repo GitHub à Vercel.
  2. Configurez les variables d'environnement dans le tableau de bord Vercel.
  3. Déployez (push sur main déclenche un nouveau déploiement).
- Alternatives : Netlify, Fly, Render — assurez-vous que les variables d'environnement et la base de données sont accessibles.

Structure recommandée du dépôt (à titre indicatif)
- src/ — code source (pages/app/components)
- public/ — ressources publiques (images, icônes)
- prisma/ — schéma Prisma, seeds
- postcss.config.js, tailwind.config.js, next.config.ts, tsconfig.json, package.json

Tests & CI
- Ajouter un workflow GitHub Actions (ex : tests, lint, build) puis insérer un badge CI en haut du README.
- Pour la couverture, utiliser un outil comme vitest + c8 ou Jest + coverage + Codecov/Codecov action et afficher le badge Codecov.

Contribuer
- Forkez le dépôt
- Créez une branche descriptive feature/mon-changement
- Ouvrez une Pull Request détaillant vos changements et tests associés
- Respectez le formatage (biome / prettier / eslint si configurés)

Exemples rapides (création d’un article)
- L’interface d’administration/d’édition dépend de l’implémentation spécifique du projet. En général :
  1. Créez un modèle Post dans prisma/schema.prisma
  2. Exposez des routes API (pages/api/* ou app/router) pour CRUD
  3. Côté front, créez un formulaire (react-hook-form) et postez les données à l’API
  4. Rafraîchissez la liste d’articles (react-query pour la gestion du cache / revalidation)

Sécurité
- Ne commitez jamais vos clés secrètes dans le dépôt.
- Utilisez les variables d’environnement sur la plateforme de déploiement (Vercel, etc.).
- Vérifiez les dépendances critiques (prisma, supabase, bcryptjs) et mettez à jour selon les recommandations de sécurité.

Licence
Je te propose la licence MIT : elle permet à tout le monde d'utiliser, modifier et distribuer le code librement (usage gratuit), à condition de conserver l'avis de droit d'auteur et la licence. Si tu veux explicitement que ton nom apparaisse, ajoute la section copyright dans le fichier LICENSE :

MIT License

Copyright (c) 2025 modalaiso

Permission is hereby granted, free of charge, to any person obtaining a copy
... (texte complet de la licence MIT) ...

Remplace "modalaiso" par le nom exact que tu souhaites voir apparaître si besoin.

Contact / Auteur
- Mainteneur principal : modalaiso
- Démo : https://csm-niangon.vercel.app