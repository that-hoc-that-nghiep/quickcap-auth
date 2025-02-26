import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    verified_email: integer('verified_email'),
    name: text('name').notNull(),
    given_name: text('given_name').notNull(),
    family_name: text('family_name').notNull(),
    picture: text('picture').notNull(),
    locale: text('locale'),
    subscription: text('subscription'), // FREE, PREMIUM
    timestamp: text('timestamp')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const organizations = sqliteTable('organizations', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    image: text('image').notNull(),
    type: text('type').notNull(), // Organization, Personal
    timestamp: text('timestamp')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const userOrganization = sqliteTable('user_organization', {
    id: text('id').primaryKey(),  
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),  
    org_id: text('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),  // ALL, READ, CREATE
    is_permission: text('is_permission').notNull(), // ALL, READ, UPLOAD
    is_owner: integer('is_owner', { mode: 'boolean' }).default(sql`0`).notNull(),
    timestamp: text('timestamp')
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});
