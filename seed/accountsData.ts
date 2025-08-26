/**
 * COMPREHENSIVE ACCOUNTING SEED DATA
 * 
 * This file contains realistic sample data for all accounting modules:
 * - Chart of Accounts (Assets, Liabilities, Equity, Revenue, Expenses)
 * - Journal Entries (Balanced double-entry transactions)
 * - General Ledger (Transaction postings)
 * - Accounts Receivable (Customer invoices and aging)
 * - Accounts Payable (Vendor bills and payments)
 * - Wallets & Credits (Customer/vendor credit systems)
 * - Financial Reports data foundations
 * 
 * Data follows standard accounting practices and double-entry bookkeeping rules.
 */

import { 
  InsertAccount, InsertJournalEntry, InsertJournalEntryLine, InsertGeneralLedger,
  InsertAccountsReceivable, InsertAccountsPayable, InsertWallet, InsertWalletTransaction,
  InsertFiscalPeriod, InsertAccountBalance
} from '../shared/schema';

// Sample Shop Domain
const SHOP_DOMAIN = 'sample-store.myshopify.com';

// Sample User IDs (these would typically reference actual users in the system)
const SAMPLE_USER_ID = '11111111-1111-1111-1111-111111111111';
const SAMPLE_CUSTOMER_ID = '22222222-2222-2222-2222-222222222222';
const SAMPLE_VENDOR_ID = '33333333-3333-3333-3333-333333333333';

// SAMPLE ACCOUNT IDS (Generated consistently)
const ACCOUNT_IDS = {
  // ASSETS
  CASH: '1001-cash-account',
  ACCOUNTS_RECEIVABLE: '1200-accounts-receivable',
  INVENTORY: '1300-inventory',
  PREPAID_EXPENSES: '1400-prepaid-expenses',
  EQUIPMENT: '1500-equipment',
  ACCUMULATED_DEPRECIATION: '1600-accumulated-depreciation',
  
  // LIABILITIES
  ACCOUNTS_PAYABLE: '2001-accounts-payable',
  ACCRUED_EXPENSES: '2100-accrued-expenses',
  SALES_TAX_PAYABLE: '2200-sales-tax-payable',
  LOANS_PAYABLE: '2500-loans-payable',
  
  // EQUITY
  OWNER_EQUITY: '3000-owner-equity',
  RETAINED_EARNINGS: '3100-retained-earnings',
  
  // REVENUE
  SALES_REVENUE: '4000-sales-revenue',
  SHIPPING_REVENUE: '4100-shipping-revenue',
  REFUNDS: '4900-sales-refunds',
  
  // EXPENSES
  COST_OF_GOODS_SOLD: '5000-cost-of-goods-sold',
  MARKETING_EXPENSE: '6100-marketing-expense',
  OFFICE_EXPENSE: '6200-office-expense',
  SHIPPING_EXPENSE: '6300-shipping-expense',
  BANK_FEES: '6400-bank-fees',
  DEPRECIATION_EXPENSE: '6500-depreciation-expense',
};

// JOURNAL ENTRY IDS
const JOURNAL_ENTRY_IDS = {
  SALE_001: 'JE-2024-001',
  SALE_002: 'JE-2024-002',
  INVENTORY_PURCHASE: 'JE-2024-003',
  PAYMENT_TO_VENDOR: 'JE-2024-004',
  CUSTOMER_PAYMENT: 'JE-2024-005',
  MARKETING_EXPENSE: 'JE-2024-006',
  DEPRECIATION: 'JE-2024-007',
  REFUND: 'JE-2024-008',
};

// ==================== CHART OF ACCOUNTS ====================
export const sampleAccounts: InsertAccount[] = [
  // === ASSETS ===
  {
    accountCode: '1001',
    accountName: 'Cash - Operating Account',
    accountType: 'asset',
    accountSubtype: 'current_asset',
    description: 'Primary business checking account for daily operations',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '1200',
    accountName: 'Accounts Receivable',
    accountType: 'asset',
    accountSubtype: 'current_asset',
    description: 'Money owed by customers for goods sold on credit',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '1300',
    accountName: 'Inventory',
    accountType: 'asset',
    accountSubtype: 'current_asset',
    description: 'Products held for sale to customers',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '1400',
    accountName: 'Prepaid Expenses',
    accountType: 'asset',
    accountSubtype: 'current_asset',
    description: 'Expenses paid in advance (insurance, rent, etc.)',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '1500',
    accountName: 'Equipment',
    accountType: 'asset',
    accountSubtype: 'fixed_asset',
    description: 'Computer equipment, furniture, and machinery',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '1600',
    accountName: 'Accumulated Depreciation - Equipment',
    accountType: 'asset',
    accountSubtype: 'fixed_asset',
    description: 'Contra-asset account for equipment depreciation',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },

  // === LIABILITIES ===
  {
    accountCode: '2001',
    accountName: 'Accounts Payable',
    accountType: 'liability',
    accountSubtype: 'current_liability',
    description: 'Money owed to suppliers and vendors',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '2100',
    accountName: 'Accrued Expenses',
    accountType: 'liability',
    accountSubtype: 'current_liability',
    description: 'Expenses incurred but not yet paid',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '2200',
    accountName: 'Sales Tax Payable',
    accountType: 'liability',
    accountSubtype: 'current_liability',
    description: 'Sales tax collected from customers, due to government',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '2500',
    accountName: 'Loans Payable',
    accountType: 'liability',
    accountSubtype: 'long_term_liability',
    description: 'Bank loans and long-term debt',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },

  // === EQUITY ===
  {
    accountCode: '3000',
    accountName: 'Owner Equity',
    accountType: 'equity',
    accountSubtype: 'capital',
    description: 'Owner\'s investment in the business',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '3100',
    accountName: 'Retained Earnings',
    accountType: 'equity',
    accountSubtype: 'retained_earnings',
    description: 'Accumulated profits retained in the business',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },

  // === REVENUE ===
  {
    accountCode: '4000',
    accountName: 'Sales Revenue',
    accountType: 'revenue',
    accountSubtype: 'product_sales',
    description: 'Revenue from product sales to customers',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '4100',
    accountName: 'Shipping Revenue',
    accountType: 'revenue',
    accountSubtype: 'shipping_income',
    description: 'Revenue from shipping charges to customers',
    normalBalance: 'credit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '4900',
    accountName: 'Sales Returns and Refunds',
    accountType: 'revenue',
    accountSubtype: 'contra_revenue',
    description: 'Contra-revenue account for customer returns and refunds',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },

  // === EXPENSES ===
  {
    accountCode: '5000',
    accountName: 'Cost of Goods Sold',
    accountType: 'expense',
    accountSubtype: 'cost_of_sales',
    description: 'Direct cost of products sold to customers',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '6100',
    accountName: 'Marketing and Advertising',
    accountType: 'expense',
    accountSubtype: 'operating_expense',
    description: 'Marketing campaigns, ads, and promotional expenses',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '6200',
    accountName: 'Office Expenses',
    accountType: 'expense',
    accountSubtype: 'operating_expense',
    description: 'Office supplies, utilities, and general admin costs',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '6300',
    accountName: 'Shipping and Delivery',
    accountType: 'expense',
    accountSubtype: 'operating_expense',
    description: 'Shipping costs and delivery expenses',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '6400',
    accountName: 'Bank Fees and Charges',
    accountType: 'expense',
    accountSubtype: 'operating_expense',
    description: 'Bank transaction fees, payment processing fees',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
  {
    accountCode: '6500',
    accountName: 'Depreciation Expense',
    accountType: 'expense',
    accountSubtype: 'operating_expense',
    description: 'Depreciation of equipment and fixed assets',
    normalBalance: 'debit',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
  },
];

// ==================== JOURNAL ENTRIES ====================
export const sampleJournalEntries: InsertJournalEntry[] = [
  {
    journalNumber: 'JE-2024-001',
    transactionDate: new Date('2024-01-15'),
    reference: 'Order #1001',
    description: 'Sale of merchandise to customer - Order #1001',
    totalDebit: '159.00',
    totalCredit: '159.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-15'),
  },
  {
    journalNumber: 'JE-2024-002',
    transactionDate: new Date('2024-01-16'),
    reference: 'Order #1002',
    description: 'Sale of merchandise to customer - Order #1002',
    totalDebit: '275.50',
    totalCredit: '275.50',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-16'),
  },
  {
    journalNumber: 'JE-2024-003',
    transactionDate: new Date('2024-01-10'),
    reference: 'PO-001',
    description: 'Purchase of inventory from vendor',
    totalDebit: '2500.00',
    totalCredit: '2500.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-10'),
  },
  {
    journalNumber: 'JE-2024-004',
    transactionDate: new Date('2024-01-20'),
    reference: 'Payment to ABC Supplier',
    description: 'Payment to vendor for outstanding invoice',
    totalDebit: '1500.00',
    totalCredit: '1500.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-20'),
  },
  {
    journalNumber: 'JE-2024-005',
    transactionDate: new Date('2024-01-25'),
    reference: 'Customer Payment',
    description: 'Customer payment received for invoice',
    totalDebit: '159.00',
    totalCredit: '159.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-25'),
  },
  {
    journalNumber: 'JE-2024-006',
    transactionDate: new Date('2024-01-18'),
    reference: 'Facebook Ads',
    description: 'Marketing expense - Facebook advertising campaign',
    totalDebit: '250.00',
    totalCredit: '250.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-18'),
  },
  {
    journalNumber: 'JE-2024-007',
    transactionDate: new Date('2024-01-31'),
    reference: 'Monthly Depreciation',
    description: 'Monthly depreciation of equipment',
    totalDebit: '83.33',
    totalCredit: '83.33',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-31'),
  },
  {
    journalNumber: 'JE-2024-008',
    transactionDate: new Date('2024-01-22'),
    reference: 'Refund #1001',
    description: 'Customer refund for returned merchandise',
    totalDebit: '75.00',
    totalCredit: '75.00',
    status: 'posted',
    shopDomain: SHOP_DOMAIN,
    createdBy: SAMPLE_USER_ID,
    postedBy: SAMPLE_USER_ID,
    postedAt: new Date('2024-01-22'),
  },
];

// ==================== JOURNAL ENTRY LINES ====================
export const sampleJournalEntryLines: InsertJournalEntryLine[] = [
  // JE-2024-001: Sale of merchandise ($159.00)
  // Dr. Cash $159.00, Cr. Sales Revenue $140.00, Cr. Sales Tax $19.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_001,
    accountId: ACCOUNT_IDS.CASH,
    description: 'Cash received from sale',
    debitAmount: '159.00',
    creditAmount: '0.00',
    reference: 'Order #1001',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_001,
    accountId: ACCOUNT_IDS.SALES_REVENUE,
    description: 'Sales revenue',
    debitAmount: '0.00',
    creditAmount: '140.00',
    reference: 'Order #1001',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_001,
    accountId: ACCOUNT_IDS.SALES_TAX_PAYABLE,
    description: 'Sales tax collected',
    debitAmount: '0.00',
    creditAmount: '19.00',
    reference: 'Order #1001',
  },
  
  // JE-2024-002: Sale of merchandise ($275.50)
  // Dr. Accounts Receivable $275.50, Cr. Sales Revenue $243.81, Cr. Sales Tax $31.69
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_002,
    accountId: ACCOUNT_IDS.ACCOUNTS_RECEIVABLE,
    description: 'Sale on credit',
    debitAmount: '275.50',
    creditAmount: '0.00',
    reference: 'Order #1002',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_002,
    accountId: ACCOUNT_IDS.SALES_REVENUE,
    description: 'Sales revenue',
    debitAmount: '0.00',
    creditAmount: '243.81',
    reference: 'Order #1002',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_002,
    accountId: ACCOUNT_IDS.SALES_TAX_PAYABLE,
    description: 'Sales tax collected',
    debitAmount: '0.00',
    creditAmount: '31.69',
    reference: 'Order #1002',
  },

  // JE-2024-003: Purchase of inventory ($2,500.00)
  // Dr. Inventory $2,500.00, Cr. Accounts Payable $2,500.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.INVENTORY_PURCHASE,
    accountId: ACCOUNT_IDS.INVENTORY,
    description: 'Inventory purchased on credit',
    debitAmount: '2500.00',
    creditAmount: '0.00',
    reference: 'PO-001',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.INVENTORY_PURCHASE,
    accountId: ACCOUNT_IDS.ACCOUNTS_PAYABLE,
    description: 'Amount owed to vendor',
    debitAmount: '0.00',
    creditAmount: '2500.00',
    reference: 'PO-001',
  },

  // JE-2024-004: Payment to vendor ($1,500.00)
  // Dr. Accounts Payable $1,500.00, Cr. Cash $1,500.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.PAYMENT_TO_VENDOR,
    accountId: ACCOUNT_IDS.ACCOUNTS_PAYABLE,
    description: 'Payment to ABC Supplier',
    debitAmount: '1500.00',
    creditAmount: '0.00',
    reference: 'Payment to ABC Supplier',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.PAYMENT_TO_VENDOR,
    accountId: ACCOUNT_IDS.CASH,
    description: 'Cash paid to vendor',
    debitAmount: '0.00',
    creditAmount: '1500.00',
    reference: 'Payment to ABC Supplier',
  },

  // JE-2024-005: Customer payment received ($159.00)
  // Dr. Cash $159.00, Cr. Accounts Receivable $159.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.CUSTOMER_PAYMENT,
    accountId: ACCOUNT_IDS.CASH,
    description: 'Payment received from customer',
    debitAmount: '159.00',
    creditAmount: '0.00',
    reference: 'Customer Payment',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.CUSTOMER_PAYMENT,
    accountId: ACCOUNT_IDS.ACCOUNTS_RECEIVABLE,
    description: 'Reduction in receivables',
    debitAmount: '0.00',
    creditAmount: '159.00',
    reference: 'Customer Payment',
  },

  // JE-2024-006: Marketing expense ($250.00)
  // Dr. Marketing Expense $250.00, Cr. Cash $250.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.MARKETING_EXPENSE,
    accountId: ACCOUNT_IDS.MARKETING_EXPENSE,
    description: 'Facebook advertising campaign',
    debitAmount: '250.00',
    creditAmount: '0.00',
    reference: 'Facebook Ads',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.MARKETING_EXPENSE,
    accountId: ACCOUNT_IDS.CASH,
    description: 'Cash paid for advertising',
    debitAmount: '0.00',
    creditAmount: '250.00',
    reference: 'Facebook Ads',
  },

  // JE-2024-007: Monthly depreciation ($83.33)
  // Dr. Depreciation Expense $83.33, Cr. Accumulated Depreciation $83.33
  {
    journalEntryId: JOURNAL_ENTRY_IDS.DEPRECIATION,
    accountId: ACCOUNT_IDS.DEPRECIATION_EXPENSE,
    description: 'Monthly depreciation expense',
    debitAmount: '83.33',
    creditAmount: '0.00',
    reference: 'Monthly Depreciation',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.DEPRECIATION,
    accountId: ACCOUNT_IDS.ACCUMULATED_DEPRECIATION,
    description: 'Accumulated depreciation increase',
    debitAmount: '0.00',
    creditAmount: '83.33',
    reference: 'Monthly Depreciation',
  },

  // JE-2024-008: Customer refund ($75.00)
  // Dr. Sales Returns $75.00, Cr. Cash $75.00
  {
    journalEntryId: JOURNAL_ENTRY_IDS.REFUND,
    accountId: ACCOUNT_IDS.REFUNDS,
    description: 'Customer refund processed',
    debitAmount: '75.00',
    creditAmount: '0.00',
    reference: 'Refund #1001',
  },
  {
    journalEntryId: JOURNAL_ENTRY_IDS.REFUND,
    accountId: ACCOUNT_IDS.CASH,
    description: 'Cash refunded to customer',
    debitAmount: '0.00',
    creditAmount: '75.00',
    reference: 'Refund #1001',
  },
];

// ==================== GENERAL LEDGER ====================
export const sampleGeneralLedger: InsertGeneralLedger[] = [
  // Generate general ledger entries from journal entry lines
  // Cash account transactions
  {
    accountId: ACCOUNT_IDS.CASH,
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_001,
    journalEntryLineId: '1', // Would reference actual line IDs
    transactionDate: new Date('2024-01-15'),
    description: 'Cash received from sale - Order #1001',
    reference: 'Order #1001',
    debitAmount: '159.00',
    creditAmount: '0.00',
    runningBalance: '159.00',
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.CASH,
    journalEntryId: JOURNAL_ENTRY_IDS.PAYMENT_TO_VENDOR,
    journalEntryLineId: '2',
    transactionDate: new Date('2024-01-20'),
    description: 'Cash paid to vendor - ABC Supplier',
    reference: 'Payment to ABC Supplier',
    debitAmount: '0.00',
    creditAmount: '1500.00',
    runningBalance: '-1341.00',
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.CASH,
    journalEntryId: JOURNAL_ENTRY_IDS.CUSTOMER_PAYMENT,
    journalEntryLineId: '3',
    transactionDate: new Date('2024-01-25'),
    description: 'Payment received from customer',
    reference: 'Customer Payment',
    debitAmount: '159.00',
    creditAmount: '0.00',
    runningBalance: '-1182.00',
    shopDomain: SHOP_DOMAIN,
  },
  
  // Sales Revenue account
  {
    accountId: ACCOUNT_IDS.SALES_REVENUE,
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_001,
    journalEntryLineId: '4',
    transactionDate: new Date('2024-01-15'),
    description: 'Sales revenue - Order #1001',
    reference: 'Order #1001',
    debitAmount: '0.00',
    creditAmount: '140.00',
    runningBalance: '140.00',
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.SALES_REVENUE,
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_002,
    journalEntryLineId: '5',
    transactionDate: new Date('2024-01-16'),
    description: 'Sales revenue - Order #1002',
    reference: 'Order #1002',
    debitAmount: '0.00',
    creditAmount: '243.81',
    runningBalance: '383.81',
    shopDomain: SHOP_DOMAIN,
  },
  
  // Accounts Receivable
  {
    accountId: ACCOUNT_IDS.ACCOUNTS_RECEIVABLE,
    journalEntryId: JOURNAL_ENTRY_IDS.SALE_002,
    journalEntryLineId: '6',
    transactionDate: new Date('2024-01-16'),
    description: 'Sale on credit - Order #1002',
    reference: 'Order #1002',
    debitAmount: '275.50',
    creditAmount: '0.00',
    runningBalance: '275.50',
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.ACCOUNTS_RECEIVABLE,
    journalEntryId: JOURNAL_ENTRY_IDS.CUSTOMER_PAYMENT,
    journalEntryLineId: '7',
    transactionDate: new Date('2024-01-25'),
    description: 'Customer payment received',
    reference: 'Customer Payment',
    debitAmount: '0.00',
    creditAmount: '159.00',
    runningBalance: '116.50',
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== ACCOUNTS RECEIVABLE ====================
export const sampleAccountsReceivable: InsertAccountsReceivable[] = [
  {
    customerId: SAMPLE_CUSTOMER_ID,
    orderId: 'order-1001',
    invoiceNumber: 'INV-2024-001',
    invoiceDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-14'), // 30 days
    totalAmount: '159.00',
    paidAmount: '159.00',
    outstandingAmount: '0.00',
    status: 'paid',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    customerId: SAMPLE_CUSTOMER_ID,
    orderId: 'order-1002',
    invoiceNumber: 'INV-2024-002',
    invoiceDate: new Date('2024-01-16'),
    dueDate: new Date('2024-02-15'),
    totalAmount: '275.50',
    paidAmount: '0.00',
    outstandingAmount: '275.50',
    status: 'pending',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    customerId: SAMPLE_CUSTOMER_ID,
    orderId: 'order-1003',
    invoiceNumber: 'INV-2024-003',
    invoiceDate: new Date('2024-01-20'),
    dueDate: new Date('2024-02-19'),
    totalAmount: '425.75',
    paidAmount: '200.00',
    outstandingAmount: '225.75',
    status: 'partial',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    customerId: SAMPLE_CUSTOMER_ID,
    orderId: 'order-1004',
    invoiceNumber: 'INV-2023-045',
    invoiceDate: new Date('2023-11-15'),
    dueDate: new Date('2023-12-15'),
    totalAmount: '890.25',
    paidAmount: '0.00',
    outstandingAmount: '890.25',
    status: 'overdue',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    customerId: SAMPLE_CUSTOMER_ID,
    orderId: 'order-1005',
    invoiceNumber: 'INV-2023-050',
    invoiceDate: new Date('2023-10-20'),
    dueDate: new Date('2023-11-19'),
    totalAmount: '1245.00',
    paidAmount: '0.00',
    outstandingAmount: '1245.00',
    status: 'overdue',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== ACCOUNTS PAYABLE ====================
export const sampleAccountsPayable: InsertAccountsPayable[] = [
  {
    vendorId: SAMPLE_VENDOR_ID,
    purchaseOrderId: 'po-001',
    billNumber: 'BILL-ABC-001',
    billDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-09'),
    totalAmount: '2500.00',
    paidAmount: '1500.00',
    outstandingAmount: '1000.00',
    status: 'partial',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    vendorId: SAMPLE_VENDOR_ID,
    purchaseOrderId: 'po-002',
    billNumber: 'BILL-XYZ-002',
    billDate: new Date('2024-01-12'),
    dueDate: new Date('2024-02-11'),
    totalAmount: '1750.00',
    paidAmount: '0.00',
    outstandingAmount: '1750.00',
    status: 'pending',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    vendorId: SAMPLE_VENDOR_ID,
    purchaseOrderId: 'po-003',
    billNumber: 'BILL-DEF-003',
    billDate: new Date('2024-01-05'),
    dueDate: new Date('2024-02-04'),
    totalAmount: '3200.50',
    paidAmount: '3200.50',
    outstandingAmount: '0.00',
    status: 'paid',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
  {
    vendorId: SAMPLE_VENDOR_ID,
    purchaseOrderId: 'po-004',
    billNumber: 'BILL-OLD-004',
    billDate: new Date('2023-11-20'),
    dueDate: new Date('2023-12-20'),
    totalAmount: '5600.00',
    paidAmount: '0.00',
    outstandingAmount: '5600.00',
    status: 'overdue',
    paymentTerms: 30,
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== WALLETS ====================
export const sampleWallets: InsertWallet[] = [
  // Customer wallets
  {
    entityType: 'customer',
    entityId: SAMPLE_CUSTOMER_ID,
    walletType: 'store_credit',
    currentBalance: '125.50',
    totalEarned: '200.00',
    totalUsed: '74.50',
    currency: 'USD',
    isActive: true,
    expiresAt: new Date('2024-12-31'),
    shopDomain: SHOP_DOMAIN,
  },
  {
    entityType: 'customer',
    entityId: SAMPLE_CUSTOMER_ID,
    walletType: 'refund',
    currentBalance: '75.00',
    totalEarned: '150.00',
    totalUsed: '75.00',
    currency: 'USD',
    isActive: true,
    shopDomain: SHOP_DOMAIN,
  },
  
  // Vendor wallets
  {
    entityType: 'vendor',
    entityId: SAMPLE_VENDOR_ID,
    walletType: 'vendor_credit',
    currentBalance: '2500.00',
    totalEarned: '5000.00',
    totalUsed: '2500.00',
    currency: 'USD',
    isActive: true,
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== WALLET TRANSACTIONS ====================
export const sampleWalletTransactions: InsertWalletTransaction[] = [
  // Store credit transactions
  {
    walletId: 'wallet-customer-credit',
    transactionType: 'credit',
    amount: '100.00',
    description: 'Loyalty reward credit',
    reference: 'loyalty-reward-001',
    referenceType: 'loyalty',
    previousBalance: '25.50',
    newBalance: '125.50',
    performedBy: SAMPLE_USER_ID,
  },
  {
    walletId: 'wallet-customer-credit',
    transactionType: 'debit',
    amount: '50.00',
    description: 'Store credit used for purchase',
    reference: 'order-1003',
    referenceType: 'order',
    previousBalance: '125.50',
    newBalance: '75.50',
    performedBy: SAMPLE_USER_ID,
  },
  
  // Refund transactions
  {
    walletId: 'wallet-customer-refund',
    transactionType: 'credit',
    amount: '75.00',
    description: 'Refund for returned item',
    reference: 'return-001',
    referenceType: 'refund',
    previousBalance: '0.00',
    newBalance: '75.00',
    performedBy: SAMPLE_USER_ID,
  },
  
  // Vendor credit transactions
  {
    walletId: 'wallet-vendor-credit',
    transactionType: 'credit',
    amount: '2500.00',
    description: 'Credit for returned inventory',
    reference: 'credit-memo-001',
    referenceType: 'credit_memo',
    previousBalance: '0.00',
    newBalance: '2500.00',
    performedBy: SAMPLE_USER_ID,
  },
];

// ==================== FISCAL PERIODS ====================
export const sampleFiscalPeriods: InsertFiscalPeriod[] = [
  {
    periodName: 'January 2024',
    periodType: 'monthly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    isActive: true,
    isClosed: false,
    shopDomain: SHOP_DOMAIN,
  },
  {
    periodName: 'Q1 2024',
    periodType: 'quarterly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    isActive: true,
    isClosed: false,
    shopDomain: SHOP_DOMAIN,
  },
  {
    periodName: 'FY 2024',
    periodType: 'yearly',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    isClosed: false,
    shopDomain: SHOP_DOMAIN,
  },
  {
    periodName: 'December 2023',
    periodType: 'monthly',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-31'),
    isActive: false,
    isClosed: true,
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== ACCOUNT BALANCES ====================
export const sampleAccountBalances: InsertAccountBalance[] = [
  // January 2024 balances
  {
    accountId: ACCOUNT_IDS.CASH,
    fiscalPeriodId: 'period-jan-2024',
    beginningBalance: '0.00',
    totalDebits: '318.00',
    totalCredits: '1825.00',
    endingBalance: '-1507.00',
    lastCalculated: new Date('2024-01-31'),
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.ACCOUNTS_RECEIVABLE,
    fiscalPeriodId: 'period-jan-2024',
    beginningBalance: '0.00',
    totalDebits: '275.50',
    totalCredits: '159.00',
    endingBalance: '116.50',
    lastCalculated: new Date('2024-01-31'),
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.SALES_REVENUE,
    fiscalPeriodId: 'period-jan-2024',
    beginningBalance: '0.00',
    totalDebits: '0.00',
    totalCredits: '383.81',
    endingBalance: '383.81',
    lastCalculated: new Date('2024-01-31'),
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.INVENTORY,
    fiscalPeriodId: 'period-jan-2024',
    beginningBalance: '0.00',
    totalDebits: '2500.00',
    totalCredits: '0.00',
    endingBalance: '2500.00',
    lastCalculated: new Date('2024-01-31'),
    shopDomain: SHOP_DOMAIN,
  },
  {
    accountId: ACCOUNT_IDS.ACCOUNTS_PAYABLE,
    fiscalPeriodId: 'period-jan-2024',
    beginningBalance: '0.00',
    totalDebits: '1500.00',
    totalCredits: '2500.00',
    endingBalance: '1000.00',
    lastCalculated: new Date('2024-01-31'),
    shopDomain: SHOP_DOMAIN,
  },
];

// ==================== EXPORT ALL SAMPLE DATA ====================
export const allAccountingData = {
  accounts: sampleAccounts,
  journalEntries: sampleJournalEntries,
  journalEntryLines: sampleJournalEntryLines,
  generalLedger: sampleGeneralLedger,
  accountsReceivable: sampleAccountsReceivable,
  accountsPayable: sampleAccountsPayable,
  wallets: sampleWallets,
  walletTransactions: sampleWalletTransactions,
  fiscalPeriods: sampleFiscalPeriods,
  accountBalances: sampleAccountBalances,
};

// ==================== FINANCIAL REPORTS DATA EXAMPLE ====================
export const sampleFinancialReportsData = {
  profitAndLoss: {
    period: 'January 2024',
    revenue: [
      { account: 'Sales Revenue', amount: 383.81 },
      { account: 'Shipping Revenue', amount: 25.00 },
    ],
    totalRevenue: 408.81,
    expenses: [
      { account: 'Cost of Goods Sold', amount: 180.00 },
      { account: 'Marketing and Advertising', amount: 250.00 },
      { account: 'Office Expenses', amount: 120.00 },
      { account: 'Shipping and Delivery', amount: 45.00 },
      { account: 'Bank Fees and Charges', amount: 15.00 },
      { account: 'Depreciation Expense', amount: 83.33 },
    ],
    totalExpenses: 693.33,
    netIncome: -284.52,
  },
  
  balanceSheet: {
    asOfDate: '2024-01-31',
    assets: {
      currentAssets: [
        { account: 'Cash', amount: -1507.00 },
        { account: 'Accounts Receivable', amount: 116.50 },
        { account: 'Inventory', amount: 2500.00 },
        { account: 'Prepaid Expenses', amount: 500.00 },
      ],
      totalCurrentAssets: 1609.50,
      fixedAssets: [
        { account: 'Equipment', amount: 5000.00 },
        { account: 'Accumulated Depreciation', amount: -83.33 },
      ],
      totalFixedAssets: 4916.67,
      totalAssets: 6526.17,
    },
    liabilities: {
      currentLiabilities: [
        { account: 'Accounts Payable', amount: 1000.00 },
        { account: 'Accrued Expenses', amount: 250.00 },
        { account: 'Sales Tax Payable', amount: 50.69 },
      ],
      totalCurrentLiabilities: 1300.69,
      longTermLiabilities: [
        { account: 'Loans Payable', amount: 15000.00 },
      ],
      totalLongTermLiabilities: 15000.00,
      totalLiabilities: 16300.69,
    },
    equity: {
      accounts: [
        { account: 'Owner Equity', amount: 20000.00 },
        { account: 'Retained Earnings', amount: -29774.52 },
      ],
      totalEquity: -9774.52,
    },
    totalLiabilitiesAndEquity: 6526.17,
  },
  
  cashFlow: {
    period: 'January 2024',
    operatingActivities: [
      { activity: 'Net Income', amount: -284.52 },
      { activity: 'Depreciation', amount: 83.33 },
      { activity: 'Increase in Accounts Receivable', amount: -116.50 },
      { activity: 'Increase in Inventory', amount: -2500.00 },
      { activity: 'Increase in Accounts Payable', amount: 1000.00 },
    ],
    netOperatingCashFlow: -1817.69,
    investingActivities: [
      { activity: 'Purchase of Equipment', amount: 0.00 },
    ],
    netInvestingCashFlow: 0.00,
    financingActivities: [
      { activity: 'Owner Investment', amount: 0.00 },
      { activity: 'Loan Proceeds', amount: 0.00 },
    ],
    netFinancingCashFlow: 0.00,
    netChangeInCash: -1817.69,
    beginningCash: 310.69,
    endingCash: -1507.00,
  },
};

// Function to insert all sample data (would be used by seeder script)
export async function insertAllAccountingData(db: any) {
  try {
    console.log('🌱 Starting accounting data seeding...');
    
    // Insert in proper order to maintain referential integrity
    await db.insert('accounts').values(sampleAccounts);
    console.log('✅ Accounts seeded');
    
    await db.insert('journalEntries').values(sampleJournalEntries);
    console.log('✅ Journal Entries seeded');
    
    await db.insert('journalEntryLines').values(sampleJournalEntryLines);
    console.log('✅ Journal Entry Lines seeded');
    
    await db.insert('generalLedger').values(sampleGeneralLedger);
    console.log('✅ General Ledger seeded');
    
    await db.insert('accountsReceivable').values(sampleAccountsReceivable);
    console.log('✅ Accounts Receivable seeded');
    
    await db.insert('accountsPayable').values(sampleAccountsPayable);
    console.log('✅ Accounts Payable seeded');
    
    await db.insert('wallets').values(sampleWallets);
    console.log('✅ Wallets seeded');
    
    await db.insert('walletTransactions').values(sampleWalletTransactions);
    console.log('✅ Wallet Transactions seeded');
    
    await db.insert('fiscalPeriods').values(sampleFiscalPeriods);
    console.log('✅ Fiscal Periods seeded');
    
    await db.insert('accountBalances').values(sampleAccountBalances);
    console.log('✅ Account Balances seeded');
    
    console.log('🎉 All accounting data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding accounting data:', error);
    throw error;
  }
}