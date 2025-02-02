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
./src/db/schema.ts contains the schema for the database. After making changes, it requires:

```bash
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

Run before installing next-ws package
```bash
npx next-ws-cli@latest patch
```
then 
```bash
npm install next-ws ws
```

Run to update prisma after schema changes, where CUSTOM_NAME is a name for the migration
```bash
npx prisma migrate dev --name CUSTOM_NAME
```


