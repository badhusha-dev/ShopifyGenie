// Auth Service Database Schema
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['superadmin', 'admin', 'staff', 'customer'] }).notNull(),
  permissions: text('permissions'),
  shopDomain: text('shop_domain'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens);
export const selectRefreshTokenSchema = createSelectSchema(refreshTokens);

// Custom validation schemas
export const createUserSchema = insertUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = insertUserSchema.partial().omit({
  id: true,
  password: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['superadmin', 'admin', 'staff', 'customer']).optional().default('customer'),
  shopDomain: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type VerifyTokenRequest = z.infer<typeof verifyTokenSchema>;
