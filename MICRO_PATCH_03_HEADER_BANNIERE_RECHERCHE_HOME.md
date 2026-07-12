# KIFFCI — Micro Patch 03

## Header, bannière et recherche Home

### Périmètre
- Header simplifié : logo, Expériences, Établissements, Défis, menu hamburger, connexion/déconnexion.
- Grande bannière administrable placée en tête de la Home.
- Défilement automatique toutes les 6 secondes et navigation manuelle accessible.
- Repli automatique sur les réglages Hero existants lorsqu'aucune bannière active n'est disponible.
- Recherche placée immédiatement sous la bannière.
- Liens Explorer et Inspire-moi conservés dans leur style léger et repositionnés sous la recherche.
- Démarrage immédiat de la section Expériences après cette zone.
- Suppression de l'ancien doublon des bannières plus bas dans la Home.

### Non modifié
- Cartes Expériences, Établissements et Événements.
- Sections existantes sous la zone haute.
- Footer.
- Collections, rôles, permissions et règles Firebase/Firestore.

### Fichiers modifiés
- `app/page.tsx`
- `components/BannerSlider.tsx`
- `components/Nav.tsx`
- `lib/firestore.ts` (correction de typage sans changement fonctionnel)
