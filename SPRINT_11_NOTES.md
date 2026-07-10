# Sprint 11 — Stabilisation finale

## Objectifs
- Garantir un build de production reproductible sans requête Firestore pendant la génération statique.
- Renforcer le responsive mobile, tablette et desktop.
- Améliorer l'accessibilité clavier, tactile et les préférences de mouvement réduit.
- Réduire le coût de rendu des pages longues sans modifier le métier.

## Changements
- Rendu dynamique explicite au niveau racine, adapté à l'application Firebase authentifiée.
- Sitemap dynamique mis en cache une heure, généré à la demande et non pendant le build.
- Métadonnées viewport et couleur de thème explicites.
- Zones tactiles mobiles de 44 px, prévention du zoom automatique des formulaires iOS.
- Prise en charge des safe areas, tableaux administratifs scrollables et textes longs robustes.
- Optimisation CSS via `content-visibility` quand le navigateur le supporte.
- Conservation du support `prefers-reduced-motion`, du skip-link et des focus visibles.

## Firestore
Aucune collection, règle ou index modifié.
