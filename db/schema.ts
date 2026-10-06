import { sqliteTable,text,integer } from 'drizzle-orm/sqlite-core';
export const snapshots=sqliteTable('snapshots',{owner:text('owner').primaryKey(),version:integer('version').notNull(),objectKey:text('object_key').notNull(),updated:integer('updated').notNull()});
