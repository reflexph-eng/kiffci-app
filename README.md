# Kiffci — Vis. Explore. Kiffe. 🇨🇮

Plateforme de découverte d'expériences et loisirs en Côte d'Ivoire.
Module Partenaires intégré : établissements, événements, statistiques, modération.

---

## Stack

- **Next.js 15** · React 18 · TypeScript strict
- **Tailwind CSS** (tokens : solar, tropical, anthracite, sand, lagoon)
- **Firebase Auth** (email/password + Google)
- **Firestore** (7 collections)
- **Firebase Storage** (experiences, establishments, events, avatars)
- **Leaflet** (carte interactive)

---

## Collections Firestore

| Collection              | Contenu                                          |
|-------------------------|--------------------------------------------------|
| `experiences`           | Expériences Kiffci (admin seulement)             |
| `users`                 | Profils + points + level + badges + **role**     |
| `favorites`             | Favoris par utilisateur                          |
| `completedExperiences`  | Expériences validées                             |
| `challenges`            | Défis thématiques                                |
| `establishments`        | Établissements soumis par les partenaires        |
| `events`                | Événements soumis par les partenaires            |

---

## Rôles utilisateurs

| Rôle      | Accès                                                              |
|-----------|--------------------------------------------------------------------|
| `user`    | Expériences, favoris, passeport, défis                             |
| `partner` | + Espace partenaire : établissements, événements, stats            |
| `admin`   | + Dashboard admin, modération, CRUD expériences et défis           |

---

## Pages

### Public
- `/` · `/experiences` · `/experiences/[id]` · `/map` · `/challenges` · `/passport` · `/favorites` · `/profile`

### Auth
- `/login` · `/register`

### Partenaire (role: partner ou admin)
- `/partner/dashboard` — dashboard + stats
- `/partner/establishments` — liste des établissements
- `/partner/create-establishment` — formulaire création
- `/partner/edit-establishment/[id]` — modification
- `/partner/events` — liste des événements
- `/partner/create-event` — formulaire création
- `/partner/edit-event/[id]` — modification

### Admin
- `/admin` — dashboard CRUD expériences + défis
- `/admin/moderation` — validation établissements et événements

---

## Installation

```bash
cp .env.example .env.local
# Remplir les variables Firebase
npm install
npm run dev
```

---

## Configurer Firebase

1. Console Firebase → nouveau projet `kiffci-ci`
2. Auth → Email/password + Google
3. Firestore → Mode production
4. Storage → Mode production
5. Paramètres → Web app → copier la config dans `.env.local`

---

## Déployer les règles

```bash
npm install -g firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## Seed des données démo

1. Créer un compte sur `/register`
2. Firebase Console → Firestore → `users/{uid}` → `role: "admin"`
3. Aller sur `/admin` → bouton **"Seed données démo"**

---

## Passer un compte en partenaire

Firebase Console → Firestore → `users/{uid}` → `role: "partner"`

---

## Déploiement

```bash
npm run build
firebase deploy --only hosting
```

---

## Monétisation future (prévue dans le modèle)

Les champs `isFeatured`, `isSponsored`, `premiumUntil` sont présents sur Establishment et KiffEvent.
La logique de facturation sera ajoutée dans une prochaine version.
