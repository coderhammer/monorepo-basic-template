# Contributing

## Stack

| Couche | Technologie |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Hono (Node.js), hono-openapi |
| Base de données | PostgreSQL 17, Drizzle ORM |
| Infra locale | Docker Compose, Traefik |
| Monorepo | npm workspaces |

## Prérequis

- Node.js ≥ 20
- Docker et Docker Compose

## Démarrage

```bash
# 1. Installer les dépendances
./init.sh        # équivalent à : npm install

# 2. Lancer les services
./start.sh       # équivalent à : docker compose up -d
```

L'application est accessible sur `http://localhost:3000`. Traefik route automatiquement :

- `http://localhost:3000/` → frontend Next.js
- `http://localhost:3000/api/` → API Hono
- `http://localhost:3000/api/reference` → documentation interactive (Scalar)

## Structure du projet

```
monorepo-basic-template/
├── docker-compose.yml       # Traefik, app, api, postgres
├── packages/
│   ├── app/                 # Frontend Next.js
│   │   └── lib/
│   │       ├── api.ts               # Client HTTP typé
│   │       └── generated-api.ts     # Types générés depuis l'OpenAPI
│   └── api/                 # API Hono
│       ├── drizzle.config.ts        # Config Drizzle Kit
│       ├── drizzle/                 # Migrations générées
│       └── src/
│           ├── server.ts            # Point d'entrée
│           ├── app.ts               # Routes Hono
│           └── db/
│               ├── index.ts         # Client Drizzle (db)
│               └── schema.ts        # Schéma de la base de données
```

## Développement

### API (`packages/api`)

```bash
docker compose up api -d
```

L'API tourne sur le port `3000` à l'intérieur du conteneur. Elle redémarre automatiquement grâce à `tsx watch`.

Ajouter une route :

```ts
// src/app.ts
app.get("/hello", describeRoute({ ... }), (c) => c.json({ message: "hi" }));
```

### Frontend (`packages/app`)

```bash
docker compose up app -d
```

Le client HTTP est typé à partir de la spec OpenAPI de l'API. Après avoir modifié des routes, regénérer le client :

```bash
docker compose run --rm app npm run generate:client
```

Cette commande appelle l'API **depuis le conteneur** (`http://api:3000/openapi`), elle doit donc être exécutée avec Docker en cours d'exécution.

## Base de données

### Variables d'environnement

`packages/api/.env.local` :

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app
```

### Modifier le schéma

1. Éditer `packages/api/src/db/schema.ts`
2. Générer la migration :

```bash
docker compose run --rm api npm run db:generate
```

3. Appliquer la migration :

```bash
docker compose run --rm api npm run db:migrate
```

### Explorer la base

Se connecter en session interactive :

```bash
docker compose run --rm -e PGPASSWORD=postgres postgres psql -h postgres -U postgres -d app
```

Lister les tables :

```bash
docker compose run --rm -e PGPASSWORD=postgres postgres psql -h postgres -U postgres -d app -c "\dt"
```

Inspecter une table :

```bash
docker compose run --rm -e PGPASSWORD=postgres postgres psql -h postgres -U postgres -d app -c "\d users"
```

Exécuter une requête :

```bash
docker compose run --rm -e PGPASSWORD=postgres postgres psql -h postgres -U postgres -d app -c "SELECT * FROM users LIMIT 10;"
```

### Utiliser `db` dans une route

```ts
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

app.get("/users", async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers);
});
```

## Variables d'environnement

Chaque package possède son propre fichier `.env.local` (non versionné). Se baser sur les exemples ci-dessous pour les créer.

**`packages/api/.env.local`**

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app
```

**`packages/app/.env.local`**

```env
# à compléter selon les besoins
```

## Conventions

- Les commits suivent la convention [Conventional Commits](https://www.conventionalcommits.org/) : `feat:`, `fix:`, `chore:`, etc.
- Le code TypeScript est partagé via les workspaces npm — pas de copier-coller entre packages.
- Les types du client API sont toujours générés, jamais écrits à la main.
