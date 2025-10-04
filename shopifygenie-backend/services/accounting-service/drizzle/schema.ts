// Accounting Service Database Schema
import { pgTable, text, integer, real, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Chart of accounts table
export const chartOfAccounts = pgTable('chart_of_accounts', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  type: text('type', { enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] }).notNull(),
  parentId: text('parent_id').references(() => chartOfAccounts.id),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entries table
export const journalEntries = pgTable('journal_entries', {
  id: text('id').primaryKey(),
  entryNumber: text('entry_number').notNull().unique(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  reference: text('reference'), // Order ID, Invoice ID, etc.
  totalDebit: real('total_debit').notNull(),
  totalCredit: real('total_credit').notNull(),
  status: text('status', { enum: ['draft', 'posted', 'cancelled'] }).notNull().default('draft'),
  createdBy: text('created_by').notNull(),
  postedAt: timestamp('posted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Journal entry lines table
export const journalEntryLines = pgTable('journal_entry_lines', {
  id: text('id').primaryKey(),
  journalEntryId: text('journal_entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull().references(() => chartOfAccounts.id),
  description: text('description').notNull(),
  debit: real('debit').notNull().default(0),
  credit: real('credit').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: text('customer_id').notNull(),
  orderId: text('order_id'),
  issueDate: timestamp('issue_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  subtotal: real('subtotal').notNull(),
  taxAmount: real('tax_amount').notNull().default(0),
  totalAmount: real('total_amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }).notNull().default('draft'),
  paymentTerms: text('payment_terms'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Invoice items table
export const invoiceItems = pgTable('invoice_items', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  totalPrice: real('total_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  paymentNumber: text('payment_number').notNull().unique(),
  invoiceId: text('invoice_id').references(() => invoices.id),
  customerId: text('customer_id').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMethod: text('payment_method').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  reference: text('reference'), // Transaction ID, Check Number, etc.
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Financial reports table
export const financialReports = pgTable('financial_reports', {
  id: text('id').primaryKey(),
  reportType: text('report_type', { enum: ['income_statement', 'balance_sheet', 'cash_flow', 'trial_balance'] }).notNull(),
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  data: text('data').notNull(), // JSON string containing report data
  generatedBy: text('generated_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertChartOfAccountsSchema = createInsertSchema(chartOfAccounts);
export const selectChartOfAccountsSchema = createSelectSchema(chartOfAccounts);

export const insertJournalEntrySchema = createInsertSchema(journalEntries);
export const selectJournalEntrySchema = createSelectSchema(journalEntries);

export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines);
export const selectJournalEntryLineSchema = createSelectSchema(journalEntryLines);

export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems);
export const selectInvoiceItemSchema = createSelectSchema(invoiceItems);

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);

// Custom validation schemas
export const createChartOfAccountsSchema = insertChartOfAccountsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateChartOfAccountsSchema = insertChartOfAccountsSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createJournalEntrySchema = insertJournalEntrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createJournalEntryLineSchema = insertJournalEntryLineSchema.omit({
  id: true,
  createdAt: true,
});

export const createInvoiceSchema = insertInvoiceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createInvoiceItemSchema = insertInvoiceItemSchema.omit({
  id: true,
  createdAt: true,
});

export const createPaymentSchema = insertPaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
});

// Type exports
export type ChartOfAccounts = typeof chartOfAccounts.$inferSelect;
export type NewChartOfAccounts = typeof chartOfAccounts.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type NewJournalEntryLine = typeof journalEntryLines.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type CreateChartOfAccountsRequest = z.infer<typeof createChartOfAccountsSchema>;
export type UpdateChartOfAccountsRequest = z.infer<typeof updateChartOfAccountsSchema>;
export type CreateJournalEntryRequest = z.infer<typeof createJournalEntrySchema>;
export type CreateJournalEntryLineRequest = z.infer<typeof createJournalEntryLineSchema>;
export type CreateInvoiceRequest = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceItemRequest = z.infer<typeof createInvoiceItemSchema>;
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type UpdateInvoiceStatusRequest = z.infer<typeof updateInvoiceStatusSchema>;
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentStatusSchema>;
