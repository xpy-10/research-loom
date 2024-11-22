This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To replicate the database:

Make sure you have Xata account from https://xata.io/

Populate the values for XATA_API_KEY, XATA_BRANCH, and DATABASE_URL after creating a database to run this application.

```bash
npm run replicate_db
# or
pnpm replicate_db
```

./src/db/schema.ts contains the schema for the database. After making changes, it requires:

```bash
npx drizzle-kit push
# or
npx drizzle-kit generate
npx drizzle-kit migrate
```

After this, changes made in the schema are reflected in the Xata database remotely, but requires also pulling the updated version into local code to get the updated Xata client and types for typechecking:

```bash
xata codegen
# or
npm run xata_pull
# or
pnpm xata_pull
```

To start dev database, make sure installation is up and running by running:

```bash
./start-database.sh
```

This will create a Docker container with Postgres available in port localhost:5432.


