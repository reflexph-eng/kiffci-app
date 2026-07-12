# KIFFCI — Sprint 3 Trust & Safety

## Livré
- Parcours complet de demande de vérification depuis l'Espace Créateur.
- Brouillon, soumission, complément demandé, refus, validation et statut Partenaire KIFFCI.
- Dossier administratif avec identité, RCCM, compte contribuable, coordonnées professionnelles, déclaration sur l'honneur et CGU.
- Références sécurisées vers les pièces justificatives sans Firebase Storage.
- Centre d'administration des demandes avec recherche, filtres, consultation et décisions.
- Mise à jour du badge Créateur sur `users` et `publicProfiles` après validation.
- Accès rapides dans le tableau de bord Créateur et dans le cockpit administrateur.
- Règles Firestore dédiées à la collection `creatorVerificationRequests`.

## Fichiers ajoutés
- `app/partner/verification/page.tsx`
- `app/admin/verifications/page.tsx`
- `lib/trust-safety-firestore.ts`
- `SPRINT_3_TRUST_SAFETY.md`

## Fichiers modifiés
- `types/index.ts`
- `app/partner/dashboard/page.tsx`
- `components/admin/AdminCockpit.tsx`
- `lib/permissions.ts`
- `firestore.rules`

## Déploiement
```bash
npm install
npm run type-check
npm run build
git add .
git commit -m "Sprint 3 - Trust and Safety createurs"
git push origin main
firebase deploy --only firestore:rules
```
