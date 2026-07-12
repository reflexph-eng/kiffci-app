# KIFFCI — Sprint 2.1 Correctif Écosystème Créateur

## Corrections livrées

- Ajout du bouton dynamique « Devenir créateur » dans la navigation desktop.
- Ajout du bouton dynamique dans le menu mobile.
- Remplacement automatique par « Espace Créateur » pour les comptes déjà créateurs.
- Correction du lien Créateur dans le Footer selon l’état de connexion et le rôle.
- Maintien du bouton principal dans le profil utilisateur.
- Affichage du badge « Créateur » dans le profil après activation.
- Suppression de la création automatique d’un établissement fictif pendant l’activation.
- Enrichissement du profil public Créateur à partir de `publicProfiles`.
- Ajout de la photo, description, ville, contacts et réseaux sociaux sur la vitrine publique.
- Préparation et affichage des statuts : Créateur, Créateur vérifié, Partenaire KIFFCI.
- Déplacement logique du partage permanent vers la fiche publique Créateur.
- QR Code et lien permanent vers `/annonceurs/{uid}`.
- Correction du texte « ce créateur ».
- Réorganisation du tableau de bord autour des expériences.
- Ajout du bouton « Voir ma vitrine » dans l’Espace Créateur.
- Harmonisation « lieux supports » pour les établissements associés.

## Fichiers modifiés

- `app/annonceurs/[id]/page.tsx`
- `app/creator/onboarding/page.tsx`
- `app/partner/dashboard/page.tsx`
- `app/profile/page.tsx`
- `components/CreatorSharePanel.tsx`
- `components/Footer.tsx`
- `components/Nav.tsx`
- `lib/firestore.ts`
- `types/index.ts`

## Contrôles réalisés

- `npm ci` : réussi
- `npm run type-check` : réussi
- `npm run build` : compilation, validation des types et génération statique réussies
- `.next/BUILD_ID` généré

Les avertissements ESLint existants sur les balises `<img>` et certaines dépendances de hooks restent non bloquants et sont destinés au Sprint Performance.

## Tests manuels avant déploiement

1. Se connecter avec un compte utilisateur simple.
2. Vérifier le bouton « Devenir créateur » dans la navigation desktop.
3. Vérifier le même bouton dans le menu mobile.
4. Vérifier le bloc Créateur dans `/profile`.
5. Cliquer sur le bouton et compléter l’onboarding.
6. Vérifier la redirection vers `/partner/dashboard`.
7. Vérifier que le bouton de navigation devient « Espace Créateur ».
8. Vérifier qu’aucun établissement fictif n’est créé automatiquement.
9. Cliquer sur « Voir ma vitrine ».
10. Vérifier la photo, la description, la ville, les contacts et les réseaux sociaux.
11. Ouvrir « Partager ce créateur ».
12. Vérifier le QR Code, le téléchargement, WhatsApp, la copie et le partage natif.
13. Vérifier que le lien partagé pointe vers `/annonceurs/{uid}`.
14. Tester avec un compte déjà créateur.
15. Tester avec un compte administrateur.
16. Tester desktop, tablette et mobile.

## Commandes Git

```bash
git status
git add .
git commit -m "fix: finaliser le parcours createur sprint 2.1"
git push origin main
```

## Commandes locales

```bash
npm ci
npm run type-check
npm run build
npm run dev
```
