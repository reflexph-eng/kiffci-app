# PATCH KIFFCI — Sprint 1.5 Auth + Modération + Rôle Modérateur

Objectif : corriger les écrans qui restent bloqués après connexion, sécuriser la page de modération et ajouter le rôle `moderator` sans affaiblir les droits admin.

## Modifications incluses

- `context/AuthContext.tsx` : ajout d'un `try/catch/finally` autour du chargement du profil Firestore pour éviter un chargement infini.
- `components/AuthGuard.tsx` : ajout de `allowedRoles` pour autoriser proprement `admin` + `moderator` sur une page précise.
- `types/index.ts` : ajout du rôle `moderator`.
- `app/admin/users/page.tsx` : ajout du rôle Modérateur dans la gestion des rôles.
- `app/admin/moderation/page.tsx` : accès autorisé aux admins et modérateurs, gestion d'erreur, plus aucun écran bloqué indéfiniment.
- `components/Nav.tsx` : lien direct Modération pour les comptes modérateurs.
- `firestore.rules` : ajout sécurisé de `isModerator()` et `isStaff()` ; lecture/modération limitée aux admins et modérateurs.

## Important sécurité

- Le modérateur ne peut pas accéder à l'administration complète.
- Le modérateur ne peut pas gérer les rôles.
- Le modérateur ne peut pas modifier les paramètres, publicités, pages, rubriques, campagnes ou utilisateurs.
- Le modérateur peut uniquement lire les contenus à modérer, approuver/rejeter et écrire les logs de modération.
- Les règles admin existantes restent protégées.

## Commandes après copie du patch

```bash
npm install
npm run type-check
npm run build
firebase deploy --only firestore:rules
npm run dev
```

Puis tester :

- Connexion utilisateur simple.
- Pages publiques avec filtres.
- Connexion admin.
- Admin > Utilisateurs : nommer un utilisateur en Modérateur.
- Connexion modérateur.
- Accès `/admin/moderation`.
- Refus d'accès à `/admin/users` pour le modérateur.
- Approbation/rejet d'un établissement ou événement.
