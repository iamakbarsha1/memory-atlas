import { pgTable, text, timestamp, uuid, jsonb, pgEnum, decimal } from 'drizzle-orm/pg-core';

export const memoryTypeEnum = pgEnum('memory_type', [
  'BURIAL',
  'BIRTH',
  'HOME',
  'EDUCATION',
  'HISTORY',
  'MILESTONE',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  birthDate: timestamp('birth_date'),
  deathDate: timestamp('death_date'),
  bio: text('bio'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: memoryTypeEnum('type').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  personId: uuid('person_id').references(() => people.id),
  userId: uuid('user_id').references(() => users.id),
  metadata: jsonb('metadata'),
  mediaUrls: text('media_urls').array(),
  dateOccurred: timestamp('date_occurred'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const relationships = pgTable('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').references(() => people.id).notNull(),
  relatedPersonId: uuid('related_person_id').references(() => people.id).notNull(),
  type: text('type').notNull(), // e.g., 'PARENT', 'CHILD', 'SPOUSE'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
