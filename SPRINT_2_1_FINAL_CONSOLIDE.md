# KIFFCI — Sprint 2.1 final consolidé

## Corrections livrées
- CTA Créateur visible dans la navigation desktop.
- CTA Créateur également présent en tête du menu « Plus » desktop afin qu'il reste accessible sur les largeurs intermédiaires.
- CTA Créateur visible dans le menu mobile.
- Comportement dynamique : visiteur, utilisateur simple, créateur/admin.
- Bloc « Espace Partenaires » supprimé de la Home.
- Nouveau bloc unique « Devenir Créateur KIFFCI » avec un seul parcours cohérent.
- Suppression du CTA prématuré « Publier une expérience » sur la Home.
- Footer corrigé : il ne renvoie plus directement vers la création de compte.
- Reprise du parcours Créateur après connexion ou inscription via `redirect=/creator/onboarding`.
- Protection du paramètre de redirection contre les URL externes.

## Fichiers modifiés
- `components/Nav.tsx`
- `components/Footer.tsx`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`

## Validations
- `npm run type-check` : réussi.
- `npm run build` : compilation, types et génération statique réussis.
- Aucun changement de collection Firestore, rôle, permission ou route technique.

## Commandes de déploiement
```bash
npm install
npm run type-check
npm run build
git add .
git commit -m "Sprint 2.1 final - parcours createur consolide"
git push origin main
```

Aucun `firebase deploy` n'est nécessaire pour ces corrections d'interface et de navigation.
