# KIFFCI — Sprint 10 : Confiance annonceur & administration

## Objectifs
- Donner à chaque annonceur une vitrine publique centrée sur ses expériences.
- Réunir expériences, établissements et expériences datées dans une file de modération unique.
- Permettre à l’administration de traiter les catégories suggérées via « Autre ».
- Renforcer la lisibilité du cockpit sans modifier les collections métier existantes.

## Réalisations
- Nouvelle page publique `/annonceurs/[id]` : identité, statut vérifié, villes, expériences, établissements et événements approuvés.
- Lien vers la vitrine annonceur depuis chaque fiche expérience publiée par un partenaire.
- Refonte de `/admin/moderation` avec trois files : Expériences, Établissements, Expériences datées.
- Ajout de la modération des documents `experiences` avec motif et historique existants.
- Nouvelle page `/admin/category-proposals` pour approuver ou rejeter les propositions.
- Une proposition approuvée crée une catégorie d’expérience visible et marque la proposition comme traitée.
- Ajout des propositions de catégories dans le cockpit admin et dans la page Catégories.

## Firestore
- Aucune collection métier supprimée ou renommée.
- Réutilisation de `categoryProposals`, `categories`, `moderationLogs`, `experiences`, `establishments`, `events`.
- Aucune migration de données requise.
- Les règles Sprint 8 couvrent déjà les propositions et la modération selon les permissions existantes.

## Validation
- `npm ci` : OK
- `npm run type-check` : OK
- `npm run build` : compilation réussie ; ralentissement historique ensuite à `Collecting page data`.

## Risques surveillés
- Les vitrines publiques chargent les contenus publics puis filtrent par annonceur afin de rester compatibles avec les règles Firestore sans index composite supplémentaire.
- Les avertissements `<img>` et hooks déjà présents restent à traiter au Sprint 11.
