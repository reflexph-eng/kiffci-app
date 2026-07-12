# KIFFCI — Sprint 2 Écosystème Créateur

## Fichiers modifiés ou ajoutés
- app/admin/ads/page.tsx
- app/admin/categories/page.tsx
- app/admin/category-proposals/page.tsx
- app/admin/menu/page.tsx
- app/admin/moderation/page.tsx
- app/admin/partners/page.tsx
- app/annonceurs/[id]/page.tsx
- app/creator/onboarding/page.tsx
- app/establishments/[id]/EstablishmentDetailClient.tsx
- app/experiences/[id]/ExperienceDetailClient.tsx
- app/page.tsx
- app/partner/dashboard/page.tsx
- app/partner/documents/page.tsx
- app/partner/sponsorship/page.tsx
- app/partner/subscription/page.tsx
- app/partner/support/page.tsx
- app/profile/page.tsx
- components/CreatorSharePanel.tsx
- components/Footer.tsx
- components/admin/AdminCockpit.tsx
- firestore.rules
- lib/cms-firestore.ts
- lib/firestore.ts
- lib/nav-firestore.ts
- lib/permissions.ts
- types/index.ts

## Contrôles réalisés
- `npm run type-check` : valide.
- `npm run build` : compilation, typage, génération statique et BUILD_ID valides. Les avertissements ESLint préexistants restent non bloquants.

## Commandes Git
```bash
git checkout -b sprint-2-ecosysteme-createur
git add .
git commit -m "feat: finaliser l ecosysteme createur KIFFCI"
git push -u origin sprint-2-ecosysteme-createur
```

## Déploiement
```bash
npm install
npm run type-check
npm run build
firebase deploy --only firestore:rules
vercel --prod
```

## Tests avant déploiement
1. Créer un compte utilisateur classique et ouvrir `/profile`.
2. Cliquer sur « Devenir créateur d’expériences ».
3. Compléter le formulaire et vérifier la redirection automatique vers `/partner/dashboard`.
4. Vérifier que le rôle technique devient `partner` et que `creatorStatus` vaut `creator`.
5. Vérifier la création d’une vitrine dans `establishments` sans nouvelle collection.
6. Vérifier l’accès aux pages expériences, événements et activités de l’Espace Créateur.
7. Ouvrir une fiche créateur publique et tester « Partager ce créateur ».
8. Tester QR Code, téléchargement, partage natif, WhatsApp et copie du lien.
9. Vérifier les libellés Créateur dans la Home, le menu, le footer et l’administration.
10. Tester les comptes utilisateur, créateur, modérateur, admin et super-admin existants.
11. Vérifier qu’aucune collection, route technique ou donnée existante n’a été renommée.
12. Tester mobile, tablette et desktop.
