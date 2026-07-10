# KIFFCI — Sprint 8 Experience First

## Objectif
Rétablir la cohérence métier : l'expérience devient le produit principal, l'établissement son support, et l'événement une expérience datée.

## Réalisé
- Nouveau parcours annonceur `/partner/create-experience`.
- Nouvelle liste `/partner/experiences`.
- Liaison facultative d'une expérience à un établissement.
- Statuts annonceur : pending / approved / rejected.
- Expérience non publiée tant qu'elle n'est pas validée.
- Catégorie `Autre` avec proposition enregistrée dans `categoryProposals`.
- Catégories officielles enrichies : tourisme culturel, écologique, communautaire, artisanat et festivals.
- Dashboard annonceur corrigé : les CTA et « Mes expériences » ne renvoient plus vers l'administration ou les événements.
- Les événements sont désormais présentés comme « expériences datées ».
- Règles Firestore et index adaptés à la propriété annonceur et aux requêtes du Sprint 8.

## Fichiers principaux modifiés
- `types/index.ts`
- `data/experience-categories.ts`
- `lib/firestore.ts`
- `lib/partner-firestore.ts`
- `lib/cms-firestore.ts`
- `app/partner/dashboard/page.tsx`
- `app/partner/create-experience/page.tsx`
- `app/partner/experiences/page.tsx`
- `app/partner/create-event/page.tsx`
- `app/partner/events/page.tsx`
- `firestore.rules`
- `firestore.indexes.json`

## Validation
- `npm ci` : OK
- `npm run type-check` : OK
- `npm run build` : compilation Next.js et validation TypeScript réussies. Le processus reste long à l'étape `Collecting page data`, problème déjà présent dans la base officielle et lié aux lectures Firebase pendant le build.

## Commandes
```bash
npm ci
npm run type-check
npm run build
firebase deploy --only firestore:rules,firestore:indexes
```

## Git
```bash
git add .
git commit -m "Sprint 8 - Experience First annonceur"
git push
```
