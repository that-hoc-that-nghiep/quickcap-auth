import { drizzle } from 'drizzle-orm/d1';

export type ContextWithDB = {
    DB: D1Database;
};

export const getDB = (dbInstance: D1Database) => {
    return drizzle(dbInstance);
};