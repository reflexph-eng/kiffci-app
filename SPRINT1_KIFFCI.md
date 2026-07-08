# KIFFCI — Sprint 1 UX/UI Premium Homepage

## Objectif
Améliorer visiblement la page d'accueil KIFFCI sans refonte risquée, sans modification Firebase, sans Firebase Storage et sans changement de logique métier.

## Fichiers modifiés
- `app/page.tsx`
- `components/SearchBar.tsx`

## Fichiers réutilisés sans casser la logique
- `components/ExperienceCard.tsx`
- `components/EstablishmentCard.tsx`
- `components/EventCard.tsx`
- `components/CategoryChips.tsx`
- `components/EditorialBadge.tsx`

## Améliorations livrées
- Hero plus premium et immersif.
- Recherche plus centrale, plus visible et responsive mobile/desktop.
- Sections éditorialisées :
  - Tendances cette semaine
  - Coups de cœur KIFFCI
  - En famille
  - Près de vous
  - Sorties du week-end
- Utilisation des composants cartes existants au lieu de cartes manuelles.
- Cartes plus cohérentes : image 4:3, badge éditorial, note, ville/quartier, fallback image propre.
- Micro-interactions Tailwind : hover, scale léger, transition, shadow.
- Orange utilisé comme accent, pas comme couleur dominante.

## Contraintes respectées
- Pas de modification Firestore.
- Pas de Firebase Storage ajouté.
- Pas de nouvelle dépendance.
- Pas de suppression de fonctionnalités existantes.
- Compatible Vercel.

## Validation effectuée
Commande exécutée avec succès :

```bash
npm run type-check
```

La commande `npm run build` a été lancée, mais l'environnement sandbox a dépassé le temps disponible pendant `Creating an optimized production build ...`. À relancer localement ou sur Vercel.

## Commandes Windows recommandées

```bash
npm install
npm run type-check
npm run build
git add .
git commit -m "Sprint 1 UX UI premium homepage"
git push
```

## Critères de validation visuelle
- Le hero donne envie dès l'arrivée sur la page.
- La recherche est visible sans effort sur mobile.
- Les catégories restent simples et rapides à utiliser.
- Les cartes affichent image, badge, note et localisation.
- Les sections donnent une impression éditoriale premium.
- L'espace blanc améliore la lisibilité.
- Les pages admin, partenaire, Firebase et données existantes ne sont pas impactées.
