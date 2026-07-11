# Sprint 11.2 — Homepage Experience First

## Objectifs

- Supprimer la répétition de promesse dans le hero.
- Afficher le titre principal sur deux lignes et mettre « vivre » en orange.
- Rendre la promesse principale modifiable depuis l’administration.
- Centrer les catégories sous la barre de recherche.
- Faire commencer la homepage directement par les expériences.
- Transformer les sélections de contenus en rails horizontaux compacts.
- Afficher environ 6 à 7 éléments sur les grands écrans.
- Conserver la famille de cartes carrées, légères et sans surcharge.
- Appliquer ce même style aux créateurs, établissements et événements de la homepage.
- Déplacer les publicités après les sélections éditoriales.
- Alléger la navigation desktop avec quatre liens principaux et un menu secondaire.

## Fichiers modifiés

- `app/page.tsx`
- `app/admin/settings/page.tsx`
- `components/Nav.tsx`
- `components/CategoryChips.tsx`
- `components/ExperienceCard.tsx`
- `components/EstablishmentCard.tsx`
- `components/EventCard.tsx`
- `components/HighlightSections.tsx`
- `components/DynamicSections.tsx`
- `lib/cms-firestore.ts`
- `types/index.ts`

## Données et Firebase

Un champ rétrocompatible `heroPromise` est ajouté au document existant :

- collection : `appSettings`
- document : `homepage`

Aucune nouvelle collection, règle Firestore ou migration n’est nécessaire. Les anciens documents utilisent automatiquement la promesse par défaut jusqu’au prochain enregistrement depuis l’administration.

## Validation

```bash
npm ci
npm run type-check
npm run build
```

La vérification TypeScript réussit sans erreur. La compilation Next.js réussit, génère les quatre pages statiques et atteint l’étape finale de collecte des traces. Les avertissements historiques relatifs aux balises `<img>` et à quelques dépendances de hooks restent non bloquants.

## Git

```bash
git add .
git commit -m "Sprint 11.2 - Homepage Experience First"
git push
```
