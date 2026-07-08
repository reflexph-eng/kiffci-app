# KIFFCI — Patch Sprint 1.2 Hero Premium

Patch ciblé pour améliorer uniquement la homepage et les composants visuels associés.

## Modifications incluses

- Titre hero réduit et responsive pour éviter le débordement desktop.
- Bloc hero recentré : titre, sous-titre, barre de recherche, CTA.
- Barre de recherche plus premium et mieux centrée.
- CTA `Explorer` et `Surprends-moi` transformés en liens transparents avec hover.
- Catégories placées dans une bande blanche premium.
- Emojis supprimés des catégories et remplacés par des icônes Lucide professionnelles.
- Image de fond rendue plus visible.
- Image de fond remplaçable ici : `public/homepage/hero-bg.jpg`.
- Slogan sous le logo toujours supprimé dans `Nav.tsx`.

## Installation

Copier le contenu du ZIP à la racine du projet KIFFCI et accepter l'écrasement des fichiers.

## Commandes de vérification

```bash
npm install
npm run type-check
npm run build
npm run dev
```

## Fichiers modifiés

```txt
app/page.tsx
components/Nav.tsx
components/SearchBar.tsx
components/CategoryChips.tsx
public/homepage/hero-bg.jpg
```

Aucun changement Firebase, Firestore, modèle de données ou dépendance.
