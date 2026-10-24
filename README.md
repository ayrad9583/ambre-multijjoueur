# Ambre 3724 — serveur admin

Base Node.js/Express pour vérifier le code administrateur **côté serveur**. Le code par défaut demandé est `1917`.

## Lancer en local

1. Installer Node.js 20 ou plus récent.
2. Copier `.env.example` vers `.env` et définir une longue valeur secrète pour `JWT_SECRET`.
3. Dans un terminal :

```bash
npm install
npm start
```

Le serveur écoute sur `http://localhost:3000`. Vérifie `http://localhost:3000/health`.

## Connexion admin

```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"code":"1917"}'
```

La réponse contient un jeton de session de deux heures. Pour vérifier la session, appelle `GET /api/admin/status` avec `Authorization: Bearer <token>`.

## Déploiement Render

1. Crée un dépôt GitHub et envoie tous les fichiers de ce dossier à la racine.
2. Sur Render, crée un **Web Service** à partir du dépôt. Render peut lire `render.yaml`.
3. Dans les variables d'environnement Render, vérifie `ADMIN_CODE=1917` et que `JWT_SECRET` est une longue valeur aléatoire.
4. Déploie puis ouvre `/health` sur l'URL Render.

## Important

Ce dépôt fournit l'API d'authentification de base. Il ne rend pas automatiquement le jeu HTML multijoueur : les commandes sensibles du jeu doivent appeler cette API et être autorisées côté serveur. Ne mets jamais le code admin dans le JavaScript envoyé aux joueurs. Le code `1917` est facile à deviner ; garde le serveur privé pendant les tests ou remplace-le par un code plus fort avant un déploiement public.
