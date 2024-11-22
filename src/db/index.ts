import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/xata-http';
import { getXataClient } from '../xata';
import { usersTable } from './schema';

async function main() {
  const xata = getXataClient();
  const db = drizzle(xata);
  const user: typeof usersTable.$inferInsert = {
    name: 'Jim',
    age: 30,
    email: 'Jim@example.com',
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!')

  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users)
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log('User info updated!')

  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log('User deleted!')

  const user2: typeof usersTable.$inferInsert = {
    name: 'Claus12',
    age: 30,
    email: 'Claus12@example.com',
  };
  await db.insert(usersTable).values(user2);
}

main();
