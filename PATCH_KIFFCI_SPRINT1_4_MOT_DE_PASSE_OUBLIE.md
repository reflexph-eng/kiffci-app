# KIFFCI — Patch Sprint 1.4 : Mot de passe oublié

## Objectif
Ajouter la récupération de mot de passe sur la page de connexion, sans toucher à Firestore, aux règles de sécurité, à l'admin ou à la logique métier.

## Fichiers modifiés

- `app/login/page.tsx`
- `context/AuthContext.tsx`

## Fonctionnalité ajoutée

- Ajout du lien `Mot de passe oublié ?` sous le champ mot de passe.
- Utilisation de Firebase Auth `sendPasswordResetEmail`.
- Message de confirmation neutre : `Si ce compte existe, un email de réinitialisation a été envoyé.`
- Aucun changement Firestore.
- Aucun changement des règles de sécurité.

## Commandes de validation

```bash
npm install
npm run type-check
npm run build
npm run dev
```

## Note sécurité
Le message de confirmation est volontairement neutre afin de ne pas révéler si une adresse email existe ou non dans Firebase Auth.
