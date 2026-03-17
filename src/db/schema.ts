import { boolean, decimal, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const memoryTypeEnum = pgEnum('memory_type', [
  'BURIAL',
  'BIRTH',
  'HOME',
  'EDUCATION',
  'HISTORY',
  'MILESTONE',
]);

export const memoryLayerEnum = pgEnum('memory_layer', [
  'BURIAL',
  'HOME',
  'EDUCATION',
  'HISTORY',
]);

export const memoryVisibilityEnum = pgEnum('memory_visibility', [
  'PRIVATE',
  'FAMILY',
  'PUBLIC',
]);

export const memoryStatusEnum = pgEnum('memory_status', [
  'DRAFT',
  'REVIEW',
  'PUBLISHED',
  'ARCHIVED',
]);

export const memorySourceTypeEnum = pgEnum('memory_source_type', [
  'FAMILY',
  'INSTITUTION',
  'HISTORICAL',
  'PERSONAL',
  'OTHER',
]);

export const memorySensitivityEnum = pgEnum('memory_sensitivity', [
  'STANDARD',
  'SENSITIVE',
  'MEMORIAL',
]);

export const memoryTrustLabelEnum = pgEnum('memory_trust_label', [
  'UNVERIFIED',
  'FAMILY_CONFIRMED',
  'INSTITUTION_CONFIRMED',
  'HISTORICALLY_VERIFIED',
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
  layer: memoryLayerEnum('layer').notNull(),
  type: memoryTypeEnum('type').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  personId: uuid('person_id').references(() => people.id),
  userId: uuid('user_id').references(() => users.id),
  metadata: jsonb('metadata'),
  mediaUrls: text('media_urls').array(),
  dateOccurred: timestamp('date_occurred'),
  sourceType: memorySourceTypeEnum('source_type').notNull(),
  sourceName: text('source_name').notNull(),
  sourceUrl: text('source_url'),
  sourceNotes: text('source_notes'),
  trustLabel: memoryTrustLabelEnum('trust_label').notNull().default('UNVERIFIED'),
  sensitivity: memorySensitivityEnum('sensitivity').notNull().default('STANDARD'),
  reviewNotes: text('review_notes'),
  respectfulHandlingNotes: text('respectful_handling_notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  hidePreciseLocation: boolean('hide_precise_location').notNull().default(false),
  institutionName: text('institution_name'),
  reviewerAssignedTo: text('reviewer_assigned_to'),
  reviewerAssignedAt: timestamp('reviewer_assigned_at'),
  moderationDecisionNote: text('moderation_decision_note'),
  importBatchId: text('import_batch_id'),
  visibility: memoryVisibilityEnum('visibility').notNull().default('PRIVATE'),
  status: memoryStatusEnum('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const moderationAuditLogs = pgTable('moderation_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  memoryId: uuid('memory_id').references(() => memories.id).notNull(),
  action: text('action').notNull(),
  actorName: text('actor_name'),
  reviewerAssignedTo: text('reviewer_assigned_to'),
  institutionName: text('institution_name'),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const relationships = pgTable('relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  personId: uuid('person_id').references(() => people.id).notNull(),
  relatedPersonId: uuid('related_person_id').references(() => people.id).notNull(),
  type: text('type').notNull(), // e.g., 'PARENT', 'CHILD', 'SPOUSE'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
