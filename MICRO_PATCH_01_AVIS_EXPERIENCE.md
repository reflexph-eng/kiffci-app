# KIFFCI — Micro Patch 01 : Avis Expérience

## Corrections

- Le bloc « Avis » est désormais affiché avant les recommandations d'autres expériences.
- Les données facultatives ayant la valeur `undefined` sont retirées avant l'écriture Firestore.
- L'erreur technique réelle d'une publication d'avis est journalisée dans la console pour faciliter le diagnostic.

## Fichiers modifiés

- `app/experiences/[id]/ExperienceDetailClient.tsx`
- `components/Reviews.tsx`
- `lib/reviews-firestore.ts`

## Vérifications

- `npm run type-check` : réussi.
- Compilation Next.js 15.5.20 : code compilé, contrôle TypeScript et génération statique réussis.
- Aucun changement des règles, collections, rôles ou permissions Firebase/Firestore.
