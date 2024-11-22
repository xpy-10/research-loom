import { pgTable, unique, integer, varchar, pgSequence } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const usersIdSeq = pgSequence("users_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "2147483647", cache: "1", cycle: false })

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "21845087", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647 }),
	name: varchar({ length: 255 }).notNull(),
	age: integer().notNull(),
	email: varchar({ length: 255 }).notNull(),
}, (table) => {
	return {
		usersEmailUnique: unique("users_email_unique").on(table.email),
	}
});
