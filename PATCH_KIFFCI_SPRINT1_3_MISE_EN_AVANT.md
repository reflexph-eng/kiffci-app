# Patch KIFFCI Sprint 1.3 — Mise en avant éditoriale & sponsoring futur

## Objectif
Ajouter un pilotage admin des badges et rubriques de mise en avant sans casser la sécurité existante.

## Ce que le patch ajoute
- Champs optionnels de mise en avant sur expériences, établissements et événements.
- Admin expériences : bloc “Mise en avant homepage”.
- Admin partenaires : gestion avancée des mises en avant établissements/événements.
- Badges pilotables : Aucun, Nouveau, Tendance, Coup de cœur KIFFCI, Top 10, Sponsorisé.
- Rubriques homepage : Tendances, Coups de cœur, En famille, Week-end, Près de vous.
- Dates début/fin et ordre d’affichage.
- Champs préparatoires Mobile Money futur : référence paiement, montant, devise XOF.

## Sécurité
- Aucune règle Firestore n’est affaiblie.
- Aucun accès public d’écriture n’est ajouté.
- Les champs sont optionnels : les anciennes données restent compatibles.
- Les partenaires ne peuvent pas modifier eux-mêmes les champs protégés via les règles existantes.
- La mise en avant reste contrôlée par l’admin.

## Fichiers modifiés
- app/page.tsx
- app/admin/page.tsx
- app/admin/partners/page.tsx
- components/ExperienceCard.tsx
- components/EstablishmentCard.tsx
- components/EventCard.tsx
- lib/firestore.ts
- lib/partner-firestore.ts
- lib/subscriptions-firestore.ts
- lib/highlights.ts
- types/index.ts

## Validation effectuée
- npm install : OK
- npm run type-check : OK
- npm run build : compilation OK, lint OK, timeout ensuite pendant “Collecting page data” dans le sandbox.

## Commandes locales recommandées
```bash
npm install
npm run type-check
npm run build
npm run dev
```

## Utilisation admin
### Expériences
Aller dans :
/admin
Puis ouvrir ou créer une expérience.
Utiliser le bloc “Mise en avant homepage”.

### Établissements / Événements
Aller dans :
/admin/partners
Utiliser le panneau “Mise en avant” sur chaque ligne.

## Règle de fonctionnement
Un contenu apparaît prioritairement sur la home si :
- highlightStatus = active
- la date de début est vide ou passée
- la date de fin est vide ou future

L’ordre est piloté par highlightRank.
