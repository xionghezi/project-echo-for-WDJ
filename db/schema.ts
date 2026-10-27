import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const responses=sqliteTable('survey_responses',{
 id:text('id').primaryKey(), createdAt:text('created_at').notNull(), version:text('version').notNull(), route:text('route').notNull(), answers:text('answers').notNull(), duration:integer('duration_seconds').notNull()
});
