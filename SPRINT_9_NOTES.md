# Sprint 9 — Immersion visiteur

## Objectif
Transformer la découverte publique de KIFFCI en un parcours éditorial et émotionnel centré sur l’envie de vivre une expérience, sans modifier les collections Firestore ni les règles métier.

## Fichiers modifiés
- `app/experiences/page.tsx`
- `app/experiences/[id]/ExperienceDetailClient.tsx`
- `components/ExperienceCard.tsx`
- `app/globals.css`

## Améliorations
- En-tête éditorial de la liste des expériences.
- Première expérience affichée dans un format immersif plus large.
- Cartes allégées, plus respirantes et moins répétitives.
- États de chargement et état vide narratif avec réinitialisation des filtres.
- Fiche expérience enrichie avec « Pourquoi tu vas aimer », « À quoi t’attendre » et « Le bon conseil ».
- Recommandations liées par catégorie ou ville.
- Respect de `prefers-reduced-motion`.

## Impact métier
Aucune migration Firestore. Aucun changement de collection, de rôle, de permission ou de processus de publication.

## Risques
Faibles et principalement visuels. Les recommandations restent volontairement calculées côté client à partir des expériences déjà publiques.

## Validation
```bash
npm ci
npm run type-check
npm run build
```

## Git
```bash
git add .
git commit -m "Sprint 9 - Immersion visiteur"
git push
```
