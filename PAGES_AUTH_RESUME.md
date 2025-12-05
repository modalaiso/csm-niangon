# Pages d'Authentification - Résumé

## 📍 URLs des Pages

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/` | Page d'accueil avec 3 cartes |
| Login | `/login` | Connexion utilisateur (Nom + Mot de passe + Clé) |
| Admin Login | `/admin-login` | Connexion admin (Email + Mot de passe) |
| Signup | `/signup` | Inscription utilisateur (formulaire complet) |

## 📝 Champs par Formulaire

### Connexion Utilisateur
- Nom (ou Email)
- Mot de passe
- Clé d'accès

### Connexion Admin
- Email / Nom d'utilisateur
- Mot de passe

### Inscription
- Nom
- Prénoms
- Nom d'utilisateur (min 3 caractères)
- Classe (sélecteur)
- Email
- Mot de passe (min 8 caractères)
- Confirmation mot de passe
- Clé d'accès

## 🎨 Design

- Fond : Dégradé bleu à vert pâle
- Cartes : Blanc avec bordure verte (4px)
- Boutons : Bleu (#2563eb)
- Bordures : Arrondies
- Police : Geist sans/mono

## ✨ Fonctionnalités

✅ Validation Zod complète
✅ Gestion des erreurs
✅ États loading
✅ Navigation intuitives entre pages
✅ Responsive design
✅ Accessibilité (labels, ARIA)
✅ Icônes lucide-react

## 🚀 Commandes

```bash
# Installation
npm install

# Dev
npm run dev

# Build
npm run build

# Linting
npm run lint

# Format
npm run format
```

## 📂 Fichiers Créés

### Pages
- src/app/page.tsx
- src/app/login/page.tsx
- src/app/admin-login/page.tsx
- src/app/signup/page.tsx

### Formulaires
- src/components/forms/login-form.tsx
- src/components/forms/admin-login-form.tsx
- src/components/forms/signup-form.tsx

### Composants UI
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/select.tsx

## 🔗 Navigation

Accueil (/) → Login (/login) → Signup (/signup)
Accueil (/) → Admin Login (/admin-login) ← Login (/login)
