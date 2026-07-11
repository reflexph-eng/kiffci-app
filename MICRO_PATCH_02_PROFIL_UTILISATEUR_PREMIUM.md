# KIFFCI — Micro Patch 02 : Profil utilisateur premium

## Périmètre
- Inscription avec prénom et pseudo public séparés.
- Profil modifiable : prénom, nom facultatif et pseudo.
- Avatar avec aperçu, validation JPG/PNG/WebP et limite de 3 Mo.
- Upload prêt sur `avatars/{uid}` dès disponibilité de Firebase Storage/Blaze.
- Pseudo prioritaire pour les nouveaux avis.
- Synchronisation Firebase Auth, `users/{uid}` et `publicProfiles/{uid}`.

## Compatibilité
- Aucun changement des rôles, permissions, règles ou collections métier.
- Les comptes existants peuvent compléter leur identité depuis `/profile`.
- Si Storage est indisponible, les données textuelles sont enregistrées et un message non bloquant est affiché.
- Les avis déjà enregistrés ne sont pas réécrits ; les nouveaux utilisent le pseudo et l'avatar du profil.

## Vérifications
- `npm run type-check` : réussi.
- `next build` : compilation, lint/type-check et génération statique réussis ; l'environnement de contrôle est resté bloqué à l'étape finale `Collecting build traces`.
