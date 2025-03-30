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

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
Dockerfile contains a build of the application though there are discrepancies when testing functionality of some backend functions due to differences in the build environment vs the development environment.

To build when in the application directory:

```bash
docker build -f Dockerfile.prod -t finalproject/research-loom:prod .
```

Then make sure environment variables are available in `.env` inside the root of the application directory, then:

```bash
docker run -p 3000:3000 --env-file .env finalproject/research-loom:prod
```

The application should be available in `localhost:3000`.

To run as a local dev (non-minified version):
```bash
pnpm install
pnpm npx next-ws-cli@latest patch
npx prisma generate
pnpm run dev
```
The `.env` file consists of the following variables:

```bash
XATA_API_KEY
XATA_BRANCH
DATABASE_URL
SHADOW_DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
```
These depend on existing projects initiated from [Xata with a Postgres connection](https://xata.io/docs/postgres), and [Clerk](clerk.com) for Auth services.

## Testing

This project uses [Cypress](https://docs.cypress.io/app/end-to-end-testing/writing-your-first-end-to-end-test) for end to end testing. To start make sure the application is running on localhost:3000:

```bash
docker build -f Dockerfile.prod -t finalproject/research-loom:test .
docker run -p 3000:3000 --env-file .env finalproject/research-loom:test
npx cypress open
```

The tests run better after having 'warmed up' the nextJS project as it seems the first time pages are requested the server does not respond as it should. See `./cypress/README.md` for more details.


