# KIFFCI — Sprint 1 UI/UX Premium

## Modifications livrées
- Hero immersif pleine largeur, alimenté par les paramètres CMS existants.
- Recherche centrale conservant la redirection et les filtres existants.
- CTA simplifiés : Explorer et Inspire-moi.
- Suppression des statistiques et éléments flottants du premier écran.
- Catégories transformées en navigation éditoriale légère.
- Navigation desktop et mobile allégée sans modifier les droits ni les routes.
- Conteneur responsive étendu jusqu’aux grands écrans.
- Design system global : gouttières fluides, réduction des cartes, mouvements accessibles.
- Cartes Expérience, Établissement et Événement rendues plus éditoriales.

## Non-régression
Aucune modification des collections Firebase, règles Firestore, modèles métier, authentification, rôles, routes ou fonctions de lecture/écriture.

## Contrôles
- TypeScript : validé (`npx tsc --noEmit`).
- ESLint : validé avec avertissements préexistants non bloquants.
- Build Next.js : lancé ; compilation non terminée dans la limite d’exécution de l’environnement, sans erreur de code remontée avant interruption.
