# Guide d'Utilisation - Pages d'Authentification CSM Niangon

## 🚀 Démarrage Rapide

### Installation
```bash
npm install
```

### Lancer le serveur de développement
```bash
npm run dev
```

L'application sera disponible à : `http://localhost:3000`

---

## 📍 Navigation des Pages

### Page d'Accueil
**URL** : `http://localhost:3000` ou `http://localhost:3000/`

Affiche 3 cartes d'accueil permettant d'accéder à :
- Connexion utilisateur
- Connexion administrateur
- Inscription

---

### 🔐 Connexion Utilisateur
**URL** : `http://localhost:3000/login`

**Formulaire** :
```
┌─────────────────────────────────────┐
│  LOGO (CSM Niangon)                 │
├─────────────────────────────────────┤
│                                     │
│ Nom                                 │
│ ┌─────────────────────────────────┐ │
│ │ [Entrez votre nom ou email]     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Mot de passe                        │
│ ┌─────────────────────────────────┐ │
│ │ [●●●●●●●●●●]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Clé d'accès                         │
│ ┌─────────────────────────────────┐ │
│ │ [Entrez votre clé d'accès]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  Connectez-vous                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│ Pas encore de compte ? Créer un compte │
│                                     │
└─────────────────────────────────────┘
```

**Champs** :
- `Nom` : Nom ou email de l'utilisateur
- `Mot de passe` : Mot de passe de l'utilisateur
- `Clé d'accès` : Clé d'accès fournie

**Validations** :
- Tous les champs sont obligatoires
- Le mot de passe doit contenir au moins 1 caractère

**Boutons** :
- `Connectez-vous` : Soumet le formulaire
- `Créer un compte` : Redirige vers `/signup`

---

### 👨‍💼 Connexion Administrateur
**URL** : `http://localhost:3000/admin-login`

**Formulaire** :
```
┌─────────────────────────────────────┐
│  🛡️ (coin supérieur droit)          │
├─────────────────────────────────────┤
│                                     │
│ LOGO (CSM Niangon)                  │
│ Connexion Administrateur            │
│                                     │
│ Email / Nom d'utilisateur           │
│ ┌─────────────────────────────────┐ │
│ │ [Entrez votre email ou identifiant]│ │
│ └─────────────────────────────────┘ │
│                                     │
│ Mot de passe                        │
│ ┌─────────────────────────────────┐ │
│ │ [●●●●●●●●●●]                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  Connectez-vous                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│ Retour à la connexion utilisateur   │
│                                     │
└─────────────────────────────────────┘
```

**Champs** :
- `Email / Nom d'utilisateur` : Identifiant administrateur
- `Mot de passe` : Mot de passe administrateur

**Validations** :
- L'email doit être une adresse valide
- Le mot de passe est obligatoire

**Boutons** :
- `Connectez-vous` : Soumet le formulaire
- `Retour à la connexion utilisateur` : Redirige vers `/login`
- 🛡️ (coin supérieur droit) : Retour vers `/login`

---

### 📝 Inscription
**URL** : `http://localhost:3000/signup`

**Formulaire** :
```
┌──────────────────────────────────────────┐
│  LOGO (CSM Niangon)                      │
├──────────────────────────────────────────┤
│                                          │
│ Nom                  │  Prénoms          │
│ ┌──────────────┐    ┌──────────────┐   │
│ │ [Votre nom]  │    │ [Prénoms]    │   │
│ └──────────────┘    └──────────────┘   │
│                                          │
│ Nom d'utilisateur                        │
│ ┌──────────────────────────────────┐   │
│ │ [Votre pseudo (min 3 car.)]      │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Classe                                   │
│ ┌──────────────────────────────────┐   │
│ │ [Sélectionner votre classe]  ▼   │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Email                                    │
│ ┌──────────────────────────────────┐   │
│ │ [votre@email.com]                │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Mot de passe (min 8 caractères)         │
│ ┌──────────────────────────────────┐   │
│ │ [●●●●●●●●●●●●●●●●●●●●●●●●]    │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Confirmer le mot de passe                │
│ ┌──────────────────────────────────┐   │
│ │ [●●●●●●●●●●●●●●●●●●●●●●●●]    │   │
│ └──────────────────────────────────┘   │
│                                          │
│ Clé d'accès                              │
│ ┌──────────────────────────────────┐   │
│ │ [Votre clé d'accès]              │   │
│ └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐  │
│  │  Créer un compte                 │  │
│  └──────────────────────────────────┘  │
│                                          │
│ Déjà un compte ? Connectez-vous          │
│                                          │
└──────────────────────────────────────────┘
```

**Champs** :
- `Nom` : Nom de famille
- `Prénoms` : Prénoms
- `Nom d'utilisateur` : Pseudo unique (min 3 caractères)
- `Classe` : Sélection parmi 6ème, 5ème, 4ème, 3ème, 2nde, 1ère, Terminale
- `Email` : Adresse email valide
- `Mot de passe` : Min 8 caractères
- `Confirmer le mot de passe` : Doit correspondre au mot de passe
- `Clé d'accès` : Clé d'accès fournie

**Validations** :
- Tous les champs sont obligatoires
- L'email doit être valide
- Le mot de passe doit contenir au moins 8 caractères
- Les deux mots de passe doivent correspondre
- Le nom d'utilisateur doit contenir au moins 3 caractères

**Boutons** :
- `Créer un compte` : Soumet le formulaire
- `Connectez-vous` : Redirige vers `/login`

---

## 🎨 Thème et Design

### Couleurs
- **Fond** : Dégradé bleu → vert pâle
- **Cartes** : Blanc pur avec bordure verte (4px)
- **Boutons** : Bleu (#2563eb)
- **Focus** : Anneau bleu (#2563eb) avec offset
- **Texte d'erreur** : Rouge (#dc2626)

### Typographie
- **Police** : Geist (sans et mono)
- **Titres** : Gras, 24-28px
- **Texte** : 14-16px
- **Labels** : Gras 14px

### Espacement
- **Padding interne** : 32px
- **Espacement entre champs** : 24px
- **Rayon des coins** : 8-24px

---

## 🔄 Flux de Navigation

```
┌──────────────┐
│  Accueil (/) │
└──────────┬───┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
 [Login] [Admin] [Signup]
    │      │        │
    └──────┼────────┘
           │
    (Connexion)
```

---

## 📋 États du Formulaire

### Normal
- Tous les champs sont accessibles
- Bouton actif

### Chargement (Loading)
- Tous les champs sont désactivés
- Bouton affiche "Connexion en cours..." ou "Création en cours..."
- Curseur se change en attente

### Erreur
- Message d'erreur rouge en haut du formulaire
- Les champs erronés sont marqués en rouge
- Messages d'erreur spécifiques sous chaque champ

---

## 🔧 Intégration avec le Backend

Pour intégrer avec votre backend, modifiez les fonctions `onSubmit` :

### Exemple - Login
```typescript
async function handleLogin(data: LoginFormData) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Erreur de connexion');
  }
  
  const { token } = await response.json();
  localStorage.setItem('token', token);
  router.push('/dashboard');
}

// Dans le composant
<LoginForm onSubmit={handleLogin} />
```

---

## 📚 Structure des Fichiers

```
src/
├── app/
│   ├── page.tsx                 # Page d'accueil
│   ├── login/
│   │   └── page.tsx            # Page de connexion utilisateur
│   ├── admin-login/
│   │   └── page.tsx            # Page de connexion admin
│   └── signup/
│       └── page.tsx            # Page d'inscription
└── components/
    ├── forms/
    │   ├── login-form.tsx       # Formulaire de connexion
    │   ├── admin-login-form.tsx # Formulaire connexion admin
    │   └── signup-form.tsx      # Formulaire d'inscription
    └── ui/
        ├── button.tsx           # Composant Button
        ├── input.tsx            # Composant Input
        ├── label.tsx            # Composant Label
        └── select.tsx           # Composant Select
```

---

## ✅ Checklist de Déploiement

- [ ] Intégrer les endpoints d'authentification
- [ ] Configurer les variables d'environnement (DATABASE_URL, etc.)
- [ ] Mettre à jour le schéma Prisma si nécessaire
- [ ] Tester tous les formulaires
- [ ] Vérifier la validation côté serveur
- [ ] Ajouter la gestion des tokens JWT
- [ ] Configurer la protection des routes
- [ ] Tester sur mobile et desktop

---

## 📞 Support

Pour toute question ou problème, consultez la documentation de :
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Radix UI Select](https://radix-ui.com/docs/primitives/components/select)
- [Tailwind CSS](https://tailwindcss.com/)
