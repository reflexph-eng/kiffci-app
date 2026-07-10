# KIFFCI — Sprint 3

## Activation du propriétaire

Ajouter dans `.env.local` :

```env
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=votre-email-firebase
```

Redémarrer l'application, se connecter avec ce compte administrateur, puis ouvrir **Administration > Utilisateurs & rôles** et cliquer sur **Activer mon compte propriétaire**.

## Déploiement des règles

```bash
firebase deploy --only firestore:rules
```
