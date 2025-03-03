This folder contains the tests written for Cypress
To run, must have cypress installed as part of the requirements and:

```bash
npx cypress open
```

Click E2E testing when new window appears and select the browser to do tests in. Development testing was done in Chrome. Click on any of the spec files to test.

NOTE: this assumes the server is up and running at localhost:3000. Unfortunately there is flakyness with the tests if the build is from `pnpm run dev`. If so, loggin in as another user to make sure the server has 'warmed up' helps in getting the tests to run smoothly.

NOTE 2: this also assumes Clerk has been set up with 2 additional test users. The credentials are stored as constants in testConstants.ts