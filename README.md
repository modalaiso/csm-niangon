# CSM Niangon TV

- ![Déploiement sur Vercel](https://img.shields.io/badge/deploy-vercel-000000?logo=vercel)
- ![Actions GitHub](https://img.shields.io/github/actions/workflow/status/modalaiso/csm-niangon/ci.yml?branch=main&label=CI)
- ![Codecov](https://img.shields.io/codecov/c/gh/modalaiso/csm-niangon)
- ![Licence MIT](https://img.shields.io/badge/license-MIT-green)

CSM Niangon TV est une plateforme web dédiée à la diffusion d’informations scolaires : actualités, événements, communiqués, documents pédagogiques, etc.
Développée avec Next.js, elle offre une base moderne, performante et réutilisable pour toute école, club ou association souhaitant disposer d’une vitrine numérique fiable.


---

🚩 Fonctionnalités

Publication d’articles / actualités

Pages statiques et dynamiques (Next.js App Router)

Gestion du contenu via Prisma

Intégration Supabase possible (dépendances incluses)

Interface moderne : Tailwind CSS, Radix UI, Framer Motion

Architecture modulaire et facilement extensible



---

🔧 Stack Technique

Next.js 16.0.7

React 19.2.1 / React DOM 19.2.1

Tailwind CSS + tailwindcss-animate

Prisma (@prisma/client + prisma)

Supabase (@supabase/supabase-js)

React Query (@tanstack/react-query)

Radix UI, Headless UI, Framer Motion

TypeScript



---

📦 Prérequis

Node.js 18+ (LTS recommandé)

npm / pnpm / yarn

Base de données compatible Prisma (PostgreSQL conseillé)

Compte Vercel si déploiement prévu



---

▶️ Installation (locale)

1. Cloner le dépôt

```git clone https://github.com/modalaiso/csm-niangon.git
cd csm-niangon
```

2. Installer les dépendances

```npm install
```

3. Configurer les variables d’environnement

Créer un fichier .env ou .env.local :

```NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

> 💡 Fournir un fichier .env.example avec les variables requises est recommandé.



4. Initialiser Prisma

```npm run prisma:generate
npm run prisma:push
npm run prisma:studio   # interface Prisma Studio
```


---

🧰 Commandes Utiles

```npm run dev           # Dev local (http://localhost:3000)
npm run build         # Build production
npm start             # Serveur Next.js en production

npm run lint          # Lint
npm run format        # Formatage (Biome/Prettier)
```

Scripts Prisma :

```npm run prisma:generate
npm run prisma:push
npm run prisma:studio
npm run prisma:seed   # si un script seed existe
```


---

📁 Structure recommandée

```src/
  app/
  components/
  lib/
public/
prisma/
tailwind.config.js
next.config.ts
tsconfig.json
package.json
```


---

🚀 Déploiement

Vercel (recommandé)

1. Connecter le repo GitHub.


2. Ajouter les variables d’environnement (environnement production/staging).


3. Push → déploiement automatique.



Alternatives :

Netlify

Fly.io

Render

Railway


Veiller à la compatibilité BDD + variables d’environnement.


---

🧪 Tests & CI

Workflow GitHub Actions (lint + build + tests).

Intégration Codecov possible pour la couverture.

Badges déjà configurés dans l’en-tête du README.



---

🔒 Sécurité

Ne jamais committer de clés secrètes.

Utiliser les variables d’environnement côté serveur pour Supabase et Prisma.

Garder Prisma, Supabase, Next.js et toutes dépendances critiques à jour.



---

📝 Contribution

1. Fork du projet


2. Nouvelle branche :

```
feature/<nom-de-feature>
```


3. Implémentation + tests


4. Pull Request propre et documentée


5. Respect du formatage automatique (Biome/Prettier)




---

📜 Licence — MIT

MIT License
Copyright (c) 2025 modalaiso

Permission is hereby granted, free of charge, to any person obtaining a copy
...

Le projet est libre d’utilisation, de modification et de distribution, avec obligation de conserver l’avis de copyright.


---

👤 Auteur

Mainteneur principal : modalaiso

Démo : https://csm-niangon.vercel.app

Repo GitHub : https://github.com/modalaiso/csm-niangon
