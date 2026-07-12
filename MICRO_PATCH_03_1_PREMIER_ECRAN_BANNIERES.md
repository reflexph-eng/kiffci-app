# KIFFCI — Micro Patch 03.1

## Premier écran et personnalisation des bannières

### Périmètre

- Réduction de la hauteur de la bannière sur desktop afin que le header, la bannière, la recherche, Explorer et Inspire-moi soient visibles dès le premier écran sur un affichage desktop standard.
- Angles de la bannière rendus plus carrés (`rounded-md`) pour rester cohérents avec l'orientation visuelle de KIFFCI.
- Espacements resserrés entre bannière, recherche et actions.
- Ajout dans l'administration des couleurs suivantes pour chaque bannière :
  - couleur du titre et du sous-titre ;
  - couleur de fond du bouton ;
  - couleur du texte du bouton.
- Compatibilité maintenue avec les anciennes bannières : blanc pour le texte, orange KIFFCI pour le bouton, blanc pour le texte du bouton.

### Format d'image conseillé

- 1600 × 600 px minimum.
- Format horizontal JPG, PNG ou WebP.
- Sujet principal centré ou placé à droite afin de laisser de l'espace au texte à gauche.
- Poids idéal inférieur à 800 Ko.

### Collections

Aucune nouvelle collection n'est créée. Trois champs facultatifs sont ajoutés aux documents existants de la collection `banners` :

- `textColor`
- `buttonBgColor`
- `buttonTextColor`

Les documents existants restent compatibles.
