import { 
  type User, type InsertUser,
  type Product, type InsertProduct,
  type Customer, type InsertCustomer,
  type Order, type InsertOrder,
  type Subscription, type InsertSubscription,
  type LoyaltyTransaction, type InsertLoyaltyTransaction,
  type Account, type InsertAccount,
  type JournalEntry, type InsertJournalEntry,
  type JournalEntryLine, type InsertJournalEntryLine,
  type GeneralLedger, type InsertGeneralLedger,
  type AccountsReceivable, type InsertAccountsReceivable,
  type AccountsPayable, type InsertAccountsPayable,
  type Wallet, type InsertWallet,
  type WalletTransaction, type InsertWalletTransaction,
  type FiscalPeriod, type InsertFiscalPeriod,
  type AccountBalance, type InsertAccountBalance,
  type BankStatement, type InsertBankStatement,
  type BankReconciliation, type InsertBankReconciliation,
  type TaxRate, type InsertTaxRate,
  type TaxTransaction, type InsertTaxTransaction,
  type Invoice, type InsertInvoice,
  type InvoiceLine, type InsertInvoiceLine,
  type Bill, type InsertBill,
  type BillLine, type InsertBillLine,
  type RecurringJournalEntry, type InsertRecurringJournalEntry,
  type RecurringJournalLine, type InsertRecurringJournalLine
} from "@shared/schema";
import { randomUUID } from "crypto";
import { ShopifyService, type ShopifyProduct, type ShopifyCustomer, type ShopifyOrder } from "./shopify";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(shopDomain?: string): Promise<User[]>;
  checkUserPermission(role: string, permission: string): Promise<boolean>;

  // Permissions
  getAllPermissions(): Promise<any[]>;
  getRolePermissions(role: string): Promise<Record<string, boolean>>;
  updateRolePermissions(role: string, permissions: Record<string, boolean>): Promise<void>;

  // Missing methods that are called from routes
  updateUser(id: string, updates: any): Promise<any>;
  deleteUser(id: string): Promise<boolean>;
  getStats(shopDomain?: string): Promise<any>;
  getSalesTrends(): Promise<any>;
  getTopProducts(): Promise<any>;
  getLoyaltyPointsAnalytics(): Promise<any>;
  getStockForecast(): Promise<any>;
  getUserRole(userId: string): Promise<string>;
  getAlertsForUser(role: string): Promise<any[]>;

  // Products - now with Shopify integration
  getProducts(shopDomain?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByShopifyId(shopifyId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  getLowStockProducts(threshold?: number, shopDomain?: string): Promise<Product[]>;
  syncProductsFromShopify(shopDomain: string): Promise<Product[]>;

  // Customers - now with Shopify integration
  getCustomers(shopDomain?: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  syncCustomersFromShopify(shopDomain: string): Promise<Customer[]>;

  // Orders - now with Shopify integration
  getOrders(shopDomain?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  syncOrdersFromShopify(shopDomain: string): Promise<Order[]>;

  // Subscriptions
  getSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: string): Promise<Subscription | undefined>;
  getSubscriptionsByCustomer(customerId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined>;

  // Loyalty Transactions
  getLoyaltyTransactions(): Promise<LoyaltyTransaction[]>;
  getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]>;
  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;

  // Inventory Management
  getWarehouses(): Promise<any[]>;
  getWarehouse(id: string): Promise<any | undefined>;
  createWarehouse(warehouse: any): Promise<any>;
  updateWarehouse(id: string, updates: Partial<any>): Promise<any | undefined>;
  getInventoryBatches(): Promise<any[]>;
  getInventoryBatch(batchId: string): Promise<any>;
  createInventoryBatch(batchData: any): Promise<any>;
  updateInventoryBatch(batchId: string, updates: any): Promise<any>;
  getBatchByProductAndExpiry(productId: string, expiryDate: Date): Promise<any | undefined>;
  getExpiringStock(daysUntilExpiry: number): Promise<any[]>;
  getStockAdjustments(): Promise<any[]>;
  createStockAdjustment(adjustmentData: any): Promise<any>;
  getStockMovements(): Promise<any[]>;
  createStockMovement(movementData: any): Promise<any>;
  getStockAuditHistory(itemId: string): Promise<any[]>;

  // Multi-Vendor Management
  getVendors(): Promise<any[]>;
  getVendor(vendorId: string): Promise<any>;
  createVendor(vendor: any): Promise<any>;
  updateVendor(id: string, updates: Partial<any>): Promise<any | undefined>;

  getPurchaseOrders(): Promise<any[]>;
  getPurchaseOrder(poId: string): Promise<any>;
  getPurchaseOrderItems(poId: string): Promise<any[]>;
  createPurchaseOrder(po: any): Promise<any>;
  updatePurchaseOrder(id: string, updates: Partial<any>): Promise<any | undefined>;
  updatePurchaseOrderItem(itemId: string, updates: any): Promise<any>;
  createPurchaseOrderItem(itemData: any): Promise<any>;
  getPurchaseOrdersByVendor(vendorId: string): Promise<any[]>;

  getVendorPayments(): Promise<any[]>;
  getVendorPayment(id: string): Promise<any | undefined>;
  createVendorPayment(paymentData: any): Promise<any>;

  // Analytics
  getStats(shopDomain?: string): Promise<{
    totalProducts: number;
    lowStockItems: number;
    totalLoyaltyPoints: number;
    activeSubscriptions: number;
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
  }>;
  getSalesTrends(): Promise<any[]>;
  getTopProducts(): Promise<any[]>;
  getLoyaltyPointsAnalytics(): Promise<any>;
  getStockForecast(): Promise<any[]>;
  getVendorAnalytics(): Promise<any>;

  // ACCOUNTING MODULE METHODS

  // Chart of Accounts
  getAccounts(shopDomain?: string): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  getAccountByCode(accountCode: string, shopDomain?: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, updates: Partial<Account>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;
  getAccountsHierarchy(shopDomain?: string): Promise<any[]>;

  // Journal Entries
  getJournalEntries(shopDomain?: string, filters?: any): Promise<JournalEntry[]>;
  getJournalEntry(id: string): Promise<JournalEntry | undefined>;
  createJournalEntry(entry: InsertJournalEntry, lines: InsertJournalEntryLine[]): Promise<JournalEntry>;
  updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: string): Promise<boolean>;
  postJournalEntry(id: string, postedBy: string): Promise<JournalEntry | undefined>;
  reverseJournalEntry(id: string, reversedBy: string): Promise<JournalEntry | undefined>;

  // Journal Entry Lines
  getJournalEntryLines(journalEntryId: string): Promise<JournalEntryLine[]>;
  createJournalEntryLine(line: InsertJournalEntryLine): Promise<JournalEntryLine>;
  updateJournalEntryLine(id: string, updates: Partial<JournalEntryLine>): Promise<JournalEntryLine | undefined>;
  deleteJournalEntryLine(id: string): Promise<boolean>;

  // General Ledger
  getGeneralLedger(shopDomain?: string, filters?: any): Promise<GeneralLedger[]>;
  getAccountLedger(accountId: string, startDate?: Date, endDate?: Date): Promise<GeneralLedger[]>;
  createLedgerEntry(entry: InsertGeneralLedger): Promise<GeneralLedger>;

  // Accounts Receivable
  getAccountsReceivable(shopDomain?: string, filters?: any): Promise<AccountsReceivable[]>;
  getReceivable(id: string): Promise<AccountsReceivable | undefined>;
  createReceivable(receivable: InsertAccountsReceivable): Promise<AccountsReceivable>;
  updateReceivable(id: string, updates: Partial<AccountsReceivable>): Promise<AccountsReceivable | undefined>;
  getReceivablesByCustomer(customerId: string): Promise<AccountsReceivable[]>;
  getOverdueReceivables(shopDomain?: string): Promise<AccountsReceivable[]>;
  getAgingReport(shopDomain?: string): Promise<any>;

  // Accounts Payable
  getAccountsPayable(shopDomain?: string, filters?: any): Promise<AccountsPayable[]>;
  getPayable(id: string): Promise<AccountsPayable | undefined>;
  createPayable(payable: InsertAccountsPayable): Promise<AccountsPayable>;
  updatePayable(id: string, updates: Partial<AccountsPayable>): Promise<AccountsPayable | undefined>;
  getPayablesByVendor(vendorId: string): Promise<AccountsPayable[]>;
  getOverduePayables(shopDomain?: string): Promise<AccountsPayable[]>;
  getVendorAgingReport(shopDomain?: string): Promise<any>;

  // Wallets & Credits
  getWallets(entityType?: string, shopDomain?: string): Promise<Wallet[]>;
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByEntity(entityType: string, entityId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined>;
  deleteWallet(id: string): Promise<boolean>;

  // Wallet Transactions
  getWalletTransactions(walletId?: string): Promise<WalletTransaction[]>;
  getWalletTransaction(id: string): Promise<WalletTransaction | undefined>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  adjustWalletBalance(walletId: string, amount: number, description: string, performedBy: string): Promise<WalletTransaction>;

  // Fiscal Periods
  getFiscalPeriods(shopDomain?: string): Promise<FiscalPeriod[]>;
  getFiscalPeriod(id: string): Promise<FiscalPeriod | undefined>;
  getCurrentFiscalPeriod(shopDomain?: string): Promise<FiscalPeriod | undefined>;
  createFiscalPeriod(period: InsertFiscalPeriod): Promise<FiscalPeriod>;
  updateFiscalPeriod(id: string, updates: Partial<FiscalPeriod>): Promise<FiscalPeriod | undefined>;
  closeFiscalPeriod(id: string): Promise<FiscalPeriod | undefined>;

  // Account Balances
  getAccountBalances(accountId?: string, fiscalPeriodId?: string): Promise<AccountBalance[]>;
  getAccountBalance(accountId: string, fiscalPeriodId: string): Promise<AccountBalance | undefined>;
  calculateAccountBalance(accountId: string, fiscalPeriodId: string): Promise<AccountBalance>;
  updateAccountBalance(id: string, updates: Partial<AccountBalance>): Promise<AccountBalance | undefined>;

  // Financial Reports
  getBalanceSheet(shopDomain?: string, asOfDate?: Date): Promise<any>;
  getProfitAndLoss(shopDomain?: string, startDate?: Date, endDate?: Date): Promise<any>;
  getCashFlowStatement(shopDomain?: string, startDate?: Date, endDate?: Date): Promise<any>;
  getTrialBalance(shopDomain?: string, asOfDate?: Date): Promise<any>;
  getAccountingSummary(shopDomain?: string): Promise<any>;
  getFinancialMetrics(shopDomain?: string, period?: 'month' | 'quarter' | 'year'): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private loyaltyTransactions: Map<string, LoyaltyTransaction> = new Map();

  // Enhanced Inventory & Vendor Storage
  private warehouses: any[] = [
    {
      id: "warehouse-1",
      shopDomain: "demo-store.myshopify.com",
      name: "Main Warehouse",
      address: "123 Industrial Blvd, City, State 12345",
      manager: "John Smith",
      isActive: true,
      createdAt: new Date()
    }
  ];

  private vendors: any[] = [
    {
      id: "vendor-1",
      shopDomain: "demo-store.myshopify.com", 
      name: "TechSupply Inc.",
      email: "orders@techsupply.com",
      phone: "+1-555-0101",
      address: "456 Supplier Ave, Tech City, TC 67890",
      contactPerson: "Sarah Johnson",
      paymentTerms: 30,
      isActive: true,
      totalSpent: "15000.00",
      outstandingDues: "2500.00",
      createdAt: new Date()
    }
  ];

  private inventoryBatches: any[] = [];
  private stockAdjustments: any[] = [];
  private purchaseOrders: any[] = [];
  private purchaseOrderItems: any[] = [];
  private vendorPayments: any[] = [];
  private stockMovements: any[] = [];

  // Accounting related storage
  private accounts: Map<string, Account> = new Map();
  private journalEntries: Map<string, JournalEntry> = new Map();
  private journalEntryLines: Map<string, JournalEntryLine[]> = new Map();
  private generalLedger: Map<string, GeneralLedger> = new Map();
  private accountsReceivable: Map<string, AccountsReceivable> = new Map();
  private accountsPayable: Map<string, AccountsPayable> = new Map();
  private wallets: Map<string, Wallet> = new Map();
  private walletTransactions: Map<string, WalletTransaction> = new Map();
  private fiscalPeriods: Map<string, FiscalPeriod> = new Map();
  private accountBalances: Map<string, AccountBalance> = new Map();

  private permissions: any[] = [];
  private rolePermissions: any[] = [];

  constructor() {
    this.seedData();
    this.seedPermissions();
    this.seedAccountingData();
  }

  private async seedAccountingData() {
    // Seed Chart of Accounts
    const chartOfAccounts = [
      { id: '1000', code: '1000', name: 'Cash and Cash Equivalents', type: 'Asset', category: 'Current' },
      { id: '1100', code: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current' },
      { id: '1200', code: '1200', name: 'Inventory', type: 'Asset', category: 'Current' },
      { id: '1300', code: '1300', name: 'Prepaid Expenses', type: 'Asset', category: 'Current' },
      { id: '1400', code: '1400', name: 'Marketable Securities', type: 'Asset', category: 'Current' },
      { id: '1500', code: '1500', name: 'Equipment', type: 'Asset', category: 'Fixed' },
      { id: '1510', code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'Contra-Asset', category: 'Fixed' },
      { id: '1600', code: '1600', name: 'Building', type: 'Asset', category: 'Fixed' },
      { id: '1610', code: '1610', name: 'Accumulated Depreciation - Building', type: 'Contra-Asset', category: 'Fixed' },
      { id: '1700', code: '1700', name: 'Land', type: 'Asset', category: 'Fixed' },
      { id: '1800', code: '1800', name: 'Intangible Assets', type: 'Asset', category: 'Intangible' },
      { id: '1900', code: '1900', name: 'Goodwill', type: 'Asset', category: 'Intangible' },
      { id: '2000', code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current' },
      { id: '2100', code: '2100', name: 'Accrued Expenses', type: 'Liability', category: 'Current' },
      { id: '2200', code: '2200', name: 'Short-term Debt', type: 'Liability', category: 'Current' },
      { id: '2300', code: '2300', name: 'Payroll Liabilities', type: 'Liability', category: 'Current' },
      { id: '2400', code: '2400', name: 'Sales Tax Payable', type: 'Liability', category: 'Current' },
      { id: '2450', code: '2450', name: 'Income Tax Payable', type: 'Liability', category: 'Current' },
      { id: '2500', code: '2500', name: 'Long-term Debt', type: 'Liability', category: 'Long-Term' },
      { id: '2600', code: '2600', name: 'Mortgage Payable', type: 'Liability', category: 'Long-Term' },
      { id: '2700', code: '2700', name: 'Deferred Revenue', type: 'Liability', category: 'Current' },
      { id: '3000', code: '3000', name: 'Owner\'s Equity', type: 'Equity', category: 'Equity' },
      { id: '3100', code: '3100', name: 'Retained Earnings', type: 'Equity', category: 'Equity' },
      { id: '3200', code: '3200', name: 'Common Stock', type: 'Equity', category: 'Equity' },
      { id: '3300', code: '3300', name: 'Additional Paid-in Capital', type: 'Equity', category: 'Equity' },
      { id: '4000', code: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating' },
      { id: '4100', code: '4100', name: 'Service Revenue', type: 'Revenue', category: 'Operating' },
      { id: '4200', code: '4200', name: 'Interest Income', type: 'Revenue', category: 'Non-Operating' },
      { id: '4300', code: '4300', name: 'Rental Income', type: 'Revenue', category: 'Non-Operating' },
      { id: '5000', code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating' },
      { id: '6000', code: '6000', name: 'Salaries & Wages', type: 'Expense', category: 'Operating' },
      { id: '6100', code: '6100', name: 'Rent Expense', type: 'Expense', category: 'Operating' },
      { id: '6200', code: '6200', name: 'Marketing & Advertising', type: 'Expense', category: 'Operating' },
      { id: '6300', code: '6300', name: 'Utilities', type: 'Expense', category: 'Operating' },
      { id: '6400', code: '6400', name: 'Insurance', type: 'Expense', category: 'Operating' },
      { id: '6500', code: '6500', name: 'Office Supplies', type: 'Expense', category: 'Operating' },
      { id: '6600', code: '6600', name: 'Professional Services', type: 'Expense', category: 'Operating' },
      { id: '6700', code: '6700', name: 'Depreciation Expense', type: 'Expense', category: 'Operating' },
      { id: '6800', code: '6800', name: 'Travel & Entertainment', type: 'Expense', category: 'Operating' },
      { id: '6900', code: '6900', name: 'Bad Debt Expense', type: 'Expense', category: 'Operating' },
      { id: '7000', code: '7000', name: 'Interest Expense', type: 'Expense', category: 'Non-Operating' },
      { id: '7100', code: '7100', name: 'Bank Charges', type: 'Expense', category: 'Non-Operating' }
    ];

    chartOfAccounts.forEach(account => {
      this.accounts.set(account.id, {
        ...account,
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      } as Account);
    });

    // Seed Journal Entries
    const journalEntry1: JournalEntry = {
      id: randomUUID(),
      journalId: 'JRN-2023-001',
      date: new Date('2023-10-01'),
      description: 'Initial Capital Investment',
      status: 'Posted',
      postedBy: 'admin',
      shopDomain: 'demo-store.myshopify.com',
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2023-10-01')
    };

    const journalEntry2: JournalEntry = {
      id: randomUUID(),
      journalId: 'JRN-2023-002',
      date: new Date('2023-10-15'),
      description: 'Purchase of Inventory',
      status: 'Posted',
      postedBy: 'staff',
      shopDomain: 'demo-store.myshopify.com',
      createdAt: new Date('2023-10-15'),
      updatedAt: new Date('2023-10-15')
    };

    this.journalEntries.set(journalEntry1.id, journalEntry1);
    this.journalEntries.set(journalEntry2.id, journalEntry2);

    // Seed Journal Entry Lines
    const lines1: JournalEntryLine[] = [
      {
        id: randomUUID(),
        journalEntryId: journalEntry1.id,
        accountId: '1000', // Cash
        debit: 50000,
        credit: 0,
        description: 'Cash investment',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      },
      {
        id: randomUUID(),
        journalEntryId: journalEntry1.id,
        accountId: '3000', // Owner's Equity
        debit: 0,
        credit: 50000,
        description: 'Owner contribution',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      }
    ];

    const lines2: JournalEntryLine[] = [
      {
        id: randomUUID(),
        journalEntryId: journalEntry2.id,
        accountId: '1200', // Inventory
        debit: 10000,
        credit: 0,
        description: 'Inventory purchase',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        id: randomUUID(),
        journalEntryId: journalEntry2.id,
        accountId: '2000', // Accounts Payable
        debit: 0,
        credit: 10000,
        description: 'Amount owed to vendor',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      }
    ];

    this.journalEntryLines.set(journalEntry1.id, lines1);
    this.journalEntryLines.set(journalEntry2.id, lines2);

    // Seed Accounts Receivable
    const receivables = [
      {
        id: randomUUID(),
        customerId: Array.from(this.customers.keys())[0],
        invoiceNumber: 'INV-2023-001',
        invoiceDate: new Date('2023-10-20'),
        dueDate: new Date('2023-11-19'),
        amount: 1250.00,
        status: 'Open',
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-10-20'),
        updatedAt: new Date('2023-10-20')
      },
      {
        id: randomUUID(),
        customerId: Array.from(this.customers.keys())[1],
        invoiceNumber: 'INV-2023-002',
        invoiceDate: new Date('2023-10-25'),
        dueDate: new Date('2023-11-24'),
        amount: 890.25,
        status: 'Open',
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-10-25'),
        updatedAt: new Date('2023-10-25')
      },
      {
        id: randomUUID(),
        customerId: Array.from(this.customers.keys())[2],
        invoiceNumber: 'INV-2023-003',
        invoiceDate: new Date('2023-09-15'),
        dueDate: new Date('2023-10-14'),
        amount: 567.50,
        status: 'Overdue',
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-09-15'),
        updatedAt: new Date('2023-10-15')
      }
    ];

    receivables.forEach(receivable => {
      this.accountsReceivable.set(receivable.id, receivable as AccountsReceivable);
    });

    // Seed Accounts Payable
    const payables = [
      {
        id: randomUUID(),
        vendorId: this.vendors[0].id,
        invoiceNumber: 'VINV-2023-001',
        invoiceDate: new Date('2023-10-10'),
        dueDate: new Date('2023-11-09'),
        amount: 2500.00,
        status: 'Open',
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        id: randomUUID(),
        vendorId: this.vendors[0].id,
        invoiceNumber: 'VINV-2023-002',
        invoiceDate: new Date('2023-09-20'),
        dueDate: new Date('2023-10-19'),
        amount: 1800.00,
        status: 'Overdue',
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-09-20'),
        updatedAt: new Date('2023-10-20')
      }
    ];

    payables.forEach(payable => {
      this.accountsPayable.set(payable.id, payable as AccountsPayable);
    });

    // Seed Wallets
    const customerIds = Array.from(this.customers.keys());
    const wallets = [
      {
        id: randomUUID(),
        entityType: 'customer',
        entityId: customerIds[0],
        balance: 125.50,
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-09-01'),
        updatedAt: new Date('2023-10-25')
      },
      {
        id: randomUUID(),
        entityType: 'customer',
        entityId: customerIds[1],
        balance: 67.25,
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2023-10-20')
      },
      {
        id: randomUUID(),
        entityType: 'vendor',
        entityId: this.vendors[0].id,
        balance: -450.00,
        shopDomain: 'demo-store.myshopify.com',
        createdAt: new Date('2023-09-10'),
        updatedAt: new Date('2023-10-15')
      }
    ];

    wallets.forEach(wallet => {
      this.wallets.set(wallet.id, wallet as Wallet);
    });

    // Seed Wallet Transactions
    const walletIds = Array.from(this.wallets.keys());
    const walletTransactions = [
      {
        id: randomUUID(),
        walletId: walletIds[0],
        amount: 50.00,
        type: 'credit',
        description: 'Loyalty points conversion',
        performedBy: 'customer',
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      },
      {
        id: randomUUID(),
        walletId: walletIds[0],
        amount: -25.50,
        type: 'debit',
        description: 'Purchase discount applied',
        performedBy: 'system',
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        id: randomUUID(),
        walletId: walletIds[1],
        amount: 100.00,
        type: 'credit',
        description: 'Refund credit',
        performedBy: 'admin',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      }
    ];

    walletTransactions.forEach(transaction => {
      const existingTransactions = this.walletTransactions.get(transaction.walletId) || [];
      existingTransactions.push(transaction as WalletTransaction);
      this.walletTransactions.set(transaction.walletId, existingTransactions);
    });

    // Seed Fiscal Periods
    const fiscalPeriod = {
      id: randomUUID(),
      shopDomain: 'demo-store.myshopify.com',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      name: 'Fiscal Year 2023',
      status: 'Open',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    };

    this.fiscalPeriods.set(fiscalPeriod.id, fiscalPeriod as FiscalPeriod);
  }

  private async seedData() {
    // Initialize sample users if empty
    if (this.users.size === 0) {
      const { AuthService } = await import('./auth');

      // Create Super Admin (highest privilege)
      const superAdminUser: InsertUser = {
        name: 'Super Administrator',
        email: 'superadmin@shopifyapp.com',
        password: await AuthService.hashPassword('superadmin123'),
        role: 'superadmin',
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(superAdminUser);

      const adminUser: InsertUser = {
        name: 'Admin User',
        email: 'admin@shopifyapp.com',
        password: await AuthService.hashPassword('admin123'),
        role: 'admin',
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(adminUser);

      const staffUser: InsertUser = {
        name: 'Staff Member',
        email: 'staff@shopifyapp.com',
        password: await AuthService.hashPassword('staff123'),
        role: 'staff',
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(staffUser);

      const customerUser: InsertUser = {
        name: 'Demo Customer',
        email: 'customer@example.com',
        password: await AuthService.hashPassword('customer123'),
        role: 'customer',
        permissions: null,
        shopDomain: null,
      };
      await this.createUser(customerUser);

      // Add more diverse users
      const managerUser: InsertUser = {
        name: 'Store Manager',
        email: 'manager@shopifyapp.com',
        password: await AuthService.hashPassword('manager123'),
        role: 'admin',
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(managerUser);

      const accountantUser: InsertUser = {
        name: 'Jane Accountant',
        email: 'accountant@shopifyapp.com',
        password: await AuthService.hashPassword('account123'),
        role: 'staff',
        permissions: null,
        shopDomain: 'demo-store.myshopify.com',
      };
      await this.createUser(accountantUser);
    }

    // Seed comprehensive customer data
    const customers = [
      {
        id: randomUUID(),
        shopifyId: "cust_001",
        name: "John Doe",
        email: "john@example.com",
        loyaltyPoints: 1250,
        totalSpent: "1430.50",
        createdAt: new Date('2023-01-15'),
      },
      {
        id: randomUUID(),
        shopifyId: "cust_002",
        name: "Sarah Miller",
        email: "sarah.m@example.com",
        loyaltyPoints: 830,
        totalSpent: "890.25",
        createdAt: new Date('2023-02-20'),
      },
      {
        id: randomUUID(),
        shopifyId: "cust_003",
        name: "Michael Johnson",
        email: "michael@example.com",
        loyaltyPoints: 2150,
        totalSpent: "2890.75",
        createdAt: new Date('2023-01-10'),
      },
      {
        id: randomUUID(),
        shopifyId: "cust_004",
        name: "Emily Davis",
        email: "emily@example.com",
        loyaltyPoints: 450,
        totalSpent: "567.30",
        createdAt: new Date('2023-03-05'),
      },
      {
        id: randomUUID(),
        shopifyId: "cust_005",
        name: "Robert Wilson",
        email: "robert@example.com",
        loyaltyPoints: 3200,
        totalSpent: "4125.80",
        createdAt: new Date('2022-11-22'),
      },
      {
        id: randomUUID(),
        shopifyId: "cust_006",
        name: "Lisa Anderson",
        email: "lisa@example.com",
        loyaltyPoints: 180,
        totalSpent: "295.60",
        createdAt: new Date('2023-04-12'),
      }
    ];

    customers.forEach(customer => {
      this.customers.set(customer.id, customer);
    });

    // Seed comprehensive product data
    const products = [
      {
        id: randomUUID(),
        shopifyId: "prod_001",
        name: "Organic Green Tea",
        sku: "GT-001",
        stock: 8,
        price: "24.99",
        category: "Health & Wellness",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_002",
        name: "Premium Coffee Beans",
        sku: "CB-002",
        stock: 45,
        price: "32.99",
        category: "Beverages",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_003",
        name: "Handmade Soap Set",
        sku: "HS-003",
        stock: 5,
        price: "19.99",
        category: "Beauty & Care",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_004",
        name: "Wireless Bluetooth Headphones",
        sku: "WBH-004",
        stock: 25,
        price: "89.99",
        category: "Electronics",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_005",
        name: "Yoga Mat Premium",
        sku: "YM-005",
        stock: 15,
        price: "45.50",
        category: "Fitness",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_006",
        name: "Smart Water Bottle",
        sku: "SWB-006",
        stock: 3,
        price: "65.00",
        category: "Health & Wellness",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_007",
        name: "Ceramic Kitchen Knife Set",
        sku: "CKS-007",
        stock: 12,
        price: "125.99",
        category: "Kitchen",
        imageUrl: null,
        lastUpdated: new Date(),
      },
      {
        id: randomUUID(),
        shopifyId: "prod_008",
        name: "LED Desk Lamp",
        sku: "LDL-008",
        stock: 22,
        price: "78.50",
        category: "Home & Office",
        imageUrl: null,
        lastUpdated: new Date(),
      }
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });

    // Seed orders with realistic data
    const customerIds = Array.from(this.customers.keys());
    const orders = [
      {
        id: randomUUID(),
        shopifyId: "order_001",
        customerId: customerIds[0],
        total: "156.48",
        pointsEarned: 156,
        status: "paid",
        createdAt: new Date('2023-10-15'),
      },
      {
        id: randomUUID(),
        shopifyId: "order_002",
        customerId: customerIds[1],
        total: "89.99",
        pointsEarned: 89,
        status: "paid",
        createdAt: new Date('2023-10-20'),
      },
      {
        id: randomUUID(),
        shopifyId: "order_003",
        customerId: customerIds[2],
        total: "245.75",
        pointsEarned: 245,
        status: "pending",
        createdAt: new Date('2023-10-25'),
      },
      {
        id: randomUUID(),
        shopifyId: "order_004",
        customerId: customerIds[0],
        total: "67.50",
        pointsEarned: 67,
        status: "paid",
        createdAt: new Date('2023-10-28'),
      },
      {
        id: randomUUID(),
        shopifyId: "order_005",
        customerId: customerIds[3],
        total: "198.25",
        pointsEarned: 198,
        status: "shipped",
        createdAt: new Date('2023-10-30'),
      }
    ];

    orders.forEach(order => {
      this.orders.set(order.id, order);
    });

    // Seed subscriptions
    const productIds = Array.from(this.products.keys());
    const subscriptions = [
      {
        id: randomUUID(),
        customerId: customerIds[0],
        productId: productIds[0],
        status: "active",
        frequency: "monthly",
        nextDelivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2023-09-01'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[1],
        productId: productIds[1],
        status: "paused",
        frequency: "monthly",
        nextDelivery: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2023-08-15'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[2],
        productId: productIds[4],
        status: "active",
        frequency: "weekly",
        nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2023-10-01'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[4],
        productId: productIds[2],
        status: "cancelled",
        frequency: "monthly",
        nextDelivery: null,
        createdAt: new Date('2023-07-20'),
      }
    ];

    subscriptions.forEach(subscription => {
      this.subscriptions.set(subscription.id, subscription);
    });

    // Seed loyalty transactions
    const loyaltyTransactions = [
      {
        id: randomUUID(),
        customerId: customerIds[0],
        orderId: orders[0].id,
        points: 156,
        type: 'earned' as const,
        createdAt: new Date('2023-10-15'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[0],
        orderId: null,
        points: -50,
        type: 'redeemed' as const,
        createdAt: new Date('2023-10-16'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[1],
        orderId: orders[1].id,
        points: 89,
        type: 'earned' as const,
        createdAt: new Date('2023-10-20'),
      },
      {
        id: randomUUID(),
        customerId: customerIds[2],
        orderId: orders[2].id,
        points: 245,
        type: 'earned' as const,
        createdAt: new Date('2023-10-25'),
      }
    ];

    loyaltyTransactions.forEach(transaction => {
      this.loyaltyTransactions.set(transaction.id, transaction);
    });

    // Seed inventory batches
    this.inventoryBatches = [
      {
        id: randomUUID(),
        productId: productIds[0],
        warehouseId: this.warehouses[0].id,
        batchNumber: "GT001-2023-10",
        quantity: 100,
        remainingQuantity: 8,
        expiryDate: new Date('2024-06-15'),
        createdAt: new Date('2023-10-01'),
      },
      {
        id: randomUUID(),
        productId: productIds[1],
        warehouseId: this.warehouses[0].id,
        batchNumber: "CB002-2023-09",
        quantity: 200,
        remainingQuantity: 45,
        expiryDate: new Date('2024-12-31'),
        createdAt: new Date('2023-09-15'),
      },
      {
        id: randomUUID(),
        productId: productIds[2],
        warehouseId: this.warehouses[0].id,
        batchNumber: "HS003-2023-10",
        quantity: 50,
        remainingQuantity: 5,
        expiryDate: new Date('2024-03-20'),
        createdAt: new Date('2023-10-10'),
      }
    ];

    // Seed purchase orders
    this.purchaseOrders = [
      {
        id: randomUUID(),
        vendorId: this.vendors[0].id,
        orderNumber: "PO-2023-001",
        status: "Delivered",
        orderDate: new Date('2023-10-01'),
        expectedDelivery: new Date('2023-10-15'),
        totalCost: "2500.00",
        createdAt: new Date('2023-10-01'),
      },
      {
        id: randomUUID(),
        vendorId: this.vendors[0].id,
        orderNumber: "PO-2023-002",
        status: "Sent",
        orderDate: new Date('2023-10-20'),
        expectedDelivery: new Date('2023-11-05'),
        totalCost: "1800.00",
        createdAt: new Date('2023-10-20'),
      }
    ];

    // Seed vendor payments
    this.vendorPayments = [
      {
        id: randomUUID(),
        vendorId: this.vendors[0].id,
        purchaseOrderId: this.purchaseOrders[0].id,
        amount: "2500.00",
        paymentDate: new Date('2023-10-16'),
        paymentMethod: "Bank Transfer",
        reference: "PAY-2023-001",
        createdAt: new Date('2023-10-16'),
      }
    ];
  }

  private async seedPermissions() {
    // Define all available permissions
    const permissionsList = [
      // Dashboard
      { name: 'dashboard:view', category: 'dashboard', operation: 'view', description: 'View dashboard' },

      // Inventory
      { name: 'inventory:view', category: 'inventory', operation: 'view', description: 'View inventory' },
      { name: 'inventory:create', category: 'inventory', operation: 'create', description: 'Create inventory items' },
      { name: 'inventory:edit', category: 'inventory', operation: 'edit', description: 'Edit inventory items' },
      { name: 'inventory:delete', category: 'inventory', operation: 'delete', description: 'Delete inventory items' },

      // Orders
      { name: 'orders:view', category: 'orders', operation: 'view', description: 'View orders' },
      { name: 'orders:create', category: 'orders', operation: 'create', description: 'Create orders' },
      { name: 'orders:edit', category: 'orders', operation: 'edit', description: 'Edit orders' },
      { name: 'orders:delete', category: 'orders', operation: 'delete', description: 'Delete orders' },

      // Customers
      { name: 'customers:view', category: 'customers', operation: 'view', description: 'View customers' },
      { name: 'customers:create', category: 'customers', operation: 'create', description: 'Create customers' },
      { name: 'customers:edit', category: 'customers', operation: 'edit', description: 'Edit customers' },
      { name: 'customers:delete', category: 'customers', operation: 'delete', description: 'Delete customers' },

      // Reports
      { name: 'reports:view', category: 'reports', operation: 'view', description: 'View reports' },
      { name: 'reports:export', category: 'reports', operation: 'export', description: 'Export reports' },

      // Users
      { name: 'users:view', category: 'users', operation: 'view', description: 'View users' },
      { name: 'users:create', category: 'users', operation: 'create', description: 'Create users' },
      { name: 'users:edit', category: 'users', operation: 'edit', description: 'Edit users' },
      { name: 'users:delete', category: 'users', operation: 'delete', description: 'Delete users' },

      // Vendors
      { name: 'vendors:view', category: 'vendors', operation: 'view', description: 'View vendors' },
      { name: 'vendors:create', category: 'vendors', operation: 'create', description: 'Create vendors' },
      { name: 'vendors:edit', category: 'vendors', operation: 'edit', description: 'Edit vendors' },
      { name: 'vendors:delete', category: 'vendors', operation: 'delete', description: 'Delete vendors' },

      // Subscriptions
      { name: 'subscriptions:view', category: 'subscriptions', operation: 'view', description: 'View subscriptions' },
      { name: 'subscriptions:create', category: 'subscriptions', operation: 'create', description: 'Create subscriptions' },
      { name: 'subscriptions:edit', category: 'subscriptions', operation: 'edit', description: 'Edit subscriptions' },
      { name: 'subscriptions:delete', category: 'subscriptions', operation: 'delete', description: 'Delete subscriptions' },
    ];

    this.permissions = permissionsList.map(p => ({
      id: randomUUID(),
      ...p,
      createdAt: new Date()
    }));

    // Set default permissions for each role
    const defaultPermissions = {
      superadmin: {}, // Super admin gets all permissions automatically
      admin: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:create': true,
        'inventory:edit': true,
        'inventory:delete': true,
        'orders:view': true,
        'orders:create': true,
        'orders:edit': true,
        'orders:delete': true,
        'customers:view': true,
        'customers:create': true,
        'customers:edit': true,
        'customers:delete': true,
        'reports:view': true,
        'reports:export': true,
        'users:view': true,
        'vendors:view': true,
        'vendors:create': true,
        'vendors:edit': true,
        'vendors:delete': true,
        'subscriptions:view': true,
        'subscriptions:create': true,
        'subscriptions:edit': true,
        'subscriptions:delete': true,
      },
      staff: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:edit': true,
        'orders:view': true,
        'orders:edit': true,
        'customers:view': true,
        'customers:edit': true,
        'reports:view': true,
        'vendors:view': true,
        'subscriptions:view': true,
        'subscriptions:edit': true,
      },
      customer: {
        'dashboard:view': true,
      }
    };

    // Initialize role permissions
    Object.entries(defaultPermissions).forEach(([role, permissions]) => {
      Object.entries(permissions).forEach(([permissionName, granted]) => {
        this.rolePermissions.push({
          id: randomUUID(),
          role,
          permissionName,
          granted,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });
  }

  // Missing storage methods implementation
  async updateUser(id: string, updates: any): Promise<any> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getStats(shopDomain?: string): Promise<any> {
    const products = Array.from(this.products.values());
    const customers = Array.from(this.customers.values());
    const orders = Array.from(this.orders.values());

    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0)
    };
  }

  async getSalesTrends(): Promise<any> {
    // Mock data for now
    const trends = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 1000) + 100
      });
    }
    return trends;
  }

  async getTopProducts(): Promise<any> {
    const products = Array.from(this.products.values());
    return products.slice(0, 5).map(p => ({
      ...p,
      sales: Math.floor(Math.random() * 100) + 10
    }));
  }

  async getLoyaltyPointsAnalytics(): Promise<any> {
    const transactions = Array.from(this.loyaltyTransactions.values());
    const earned = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    const redeemed = transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + t.points, 0);

    return {
      earned,
      redeemed,
      available: earned - redeemed
    };
  }

  async getStockForecast(): Promise<any> {
    const products = Array.from(this.products.values());
    return products.map(p => ({
      ...p,
      forecastDays: Math.floor(Math.random() * 30) + 5
    }));
  }

  async getUserRole(userId: string): Promise<string> {
    const user = this.users.get(userId);
    return user?.role || 'customer';
  }

  async getAlertsForUser(role: string): Promise<any[]> {
    // Return role-specific alerts
    const baseAlerts: any[] = [];

    if (role === 'admin' || role === 'superadmin') {
      baseAlerts.push({
        id: '1',
        type: 'warning',
        message: 'Low stock alert for 3 products',
        timestamp: new Date()
      });
    }

    return baseAlerts;
  }

  // User Management Methods
  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      role: userData.role || 'customer',
      permissions: userData.permissions || null,
      shopDomain: userData.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async getUsers(shopDomain?: string): Promise<User[]> {
    const users = Array.from(this.users.values());
    if (shopDomain) {
      return users.filter(user => user.shopDomain === shopDomain);
    }
    return users;
  }

  async checkUserPermission(role: string, permission: string): Promise<boolean> {
    // Super admin has all permissions
    if (role === 'superadmin') {
      return true;
    }

    // Check stored role permissions
    const rolePermission = this.rolePermissions.find(rp => 
      rp.role === role && rp.permissionName === permission && rp.granted
    );

    return !!rolePermission;
  }

  async getAllPermissions(): Promise<any[]> {
    return this.permissions;
  }

  async getRolePermissions(role: string): Promise<Record<string, boolean>> {
    if (role === 'superadmin') {
      // Super admin gets all permissions
      const permissions: Record<string, boolean> = {};
      this.permissions.forEach(p => {
        permissions[p.name] = true;
      });
      return permissions;
    }

    const permissions: Record<string, boolean> = {};
    this.permissions.forEach(p => {
      permissions[p.name] = false;
    });

    this.rolePermissions.forEach(rp => {
      if (rp.role === role) {
        permissions[rp.permissionName] = rp.granted;
      }
    });

    return permissions;
  }

  async updateRolePermissions(role: string, permissions: Record<string, boolean>): Promise<void> {
    if (role === 'superadmin') {
      throw new Error('Cannot modify super admin permissions');
    }

    // Remove existing permissions for this role
    this.rolePermissions = this.rolePermissions.filter(rp => rp.role !== role);

    // Add new permissions
    Object.entries(permissions).forEach(([permissionName, granted]) => {
      if (granted) {
        this.rolePermissions.push({
          id: randomUUID(),
          role,
          permissionName,
          granted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
  }

  async getUsersWithoutPassword(shopDomain?: string): Promise<Omit<User, 'password'>[]> {
    let filteredUsers = Array.from(this.users.values());
    if (shopDomain) {
      filteredUsers = filteredUsers.filter(user => user.shopDomain === shopDomain);
    }
    return filteredUsers.map(({ password, ...user }) => user);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = this.users.get(id);

    // Protect Super Admin from deletion
    if (user && user.role === 'superadmin' && user.email === 'superadmin@shopifyapp.com') {
      throw new Error('Cannot delete the default Super Admin user');
    }

    return this.users.delete(id);
  }

  async getUsersByRole(role: string): Promise<Omit<User, 'password'>[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === role)
      .map(({ password, ...user }) => user);
  }


  // User methods (original implementation, now using Map)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === username);
  }

  // Product methods - now with Shopify integration
  async getProducts(shopDomain?: string): Promise<Product[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyProducts = await shopifyService.getProducts();

        // Convert and sync Shopify products with local storage
        const products: Product[] = [];
        for (const shopifyProduct of shopifyProducts) {
          for (const variant of shopifyProduct.variants) {
            const existingProduct = await this.getProductByShopifyId(variant.id.toString());
            if (existingProduct) {
              // Update existing product
              const updatedProduct = await this.updateProduct(existingProduct.id, {
                name: `${shopifyProduct.title} - ${variant.title}`,
                stock: variant.inventory_quantity,
                price: variant.price,
                lastUpdated: new Date()
              });
              if (updatedProduct) products.push(updatedProduct);
            } else {
              // Create new product
              const newProduct = await this.createProduct({
                shopifyId: variant.id.toString(),
                name: `${shopifyProduct.title} - ${variant.title}`,
                sku: variant.sku || `shopify-${variant.id}`,
                stock: variant.inventory_quantity,
                price: variant.price,
                category: shopifyProduct.product_type || 'General',
                imageUrl: null
              });
              products.push(newProduct);
            }
          }
        }
        return products;
      } catch (error) {
        console.error('Error syncing products from Shopify:', error);
        return Array.from(this.products.values());
      }
    }
    return Array.from(this.products.values());
  }

  async syncProductsFromShopify(shopDomain: string): Promise<Product[]> {
    return await this.getProducts(shopDomain);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByShopifyId(shopifyId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.shopifyId === shopifyId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      id,
      name: insertProduct.name,
      shopifyId: insertProduct.shopifyId || null,
      sku: insertProduct.sku || null,
      stock: insertProduct.stock || 0,
      price: insertProduct.price || null,
      category: insertProduct.category || null,
      imageUrl: insertProduct.imageUrl || null,
      lastUpdated: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { 
      ...product, 
      ...updates, 
      lastUpdated: new Date() 
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getLowStockProducts(threshold = 10, shopDomain?: string): Promise<Product[]> {
    const products = shopDomain ? await this.getProducts(shopDomain) : Array.from(this.products.values());
    return products.filter(p => p.stock < threshold);
  }

  // Customer methods - now with Shopify integration
  async getCustomers(shopDomain?: string): Promise<Customer[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyCustomers = await shopifyService.getCustomers();

        // Convert and sync Shopify customers with local storage
        const customers: Customer[] = [];
        for (const shopifyCustomer of shopifyCustomers) {
          const existingCustomer = await this.getCustomerByShopifyId(shopifyCustomer.id.toString());
          if (existingCustomer) {
            // Update existing customer
            const updatedCustomer = await this.updateCustomer(existingCustomer.id, {
              name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`.trim(),
              email: shopifyCustomer.email,
              totalSpent: shopifyCustomer.total_spent
            });
            if (updatedCustomer) customers.push(updatedCustomer);
          } else {
            // Create new customer
            const newCustomer = await this.createCustomer({
              shopifyId: shopifyCustomer.id.toString(),
              name: `${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`.trim(),
              email: shopifyCustomer.email,
              loyaltyPoints: 0,
              totalSpent: shopifyCustomer.total_spent
            });
            customers.push(newCustomer);
          }
        }
        return customers;
      } catch (error) {
        console.error('Error syncing customers from Shopify:', error);
        return Array.from(this.customers.values());
      }
    }
    return Array.from(this.customers.values());
  }

  async syncCustomersFromShopify(shopDomain: string): Promise<Customer[]> {
    return await this.getCustomers(shopDomain);
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByShopifyId(shopifyId: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.shopifyId === shopifyId);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = { 
      id,
      name: insertCustomer.name,
      email: insertCustomer.email,
      shopifyId: insertCustomer.shopifyId || null,
      loyaltyPoints: insertCustomer.loyaltyPoints || 0,
      totalSpent: insertCustomer.totalSpent || null,
      createdAt: new Date() 
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;

    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Order methods - now with Shopify integration
  async getOrders(shopDomain?: string): Promise<Order[]> {
    if (shopDomain) {
      try {
        const shopifyService = new ShopifyService(shopDomain);
        const shopifyOrders = await shopifyService.getOrders();

        // Convert and sync Shopify orders with local storage
        const orders: Order[] = [];
        for (const shopifyOrder of shopifyOrders) {
          const existingOrder = await this.getOrderByShopifyId(shopifyOrder.id.toString());
          if (!existingOrder) {
            // Find or create customer
            let customer = await this.getCustomerByShopifyId(shopifyOrder.customer?.id?.toString() || '');
            if (!customer && shopifyOrder.email) {
              customer = await this.getCustomerByEmail(shopifyOrder.email);
            }

            // Create new order
            const newOrder = await this.createOrder({
              shopifyId: shopifyOrder.id.toString(),
              customerId: customer?.id || null,
              total: shopifyOrder.total_price,
              pointsEarned: Math.floor(parseFloat(shopifyOrder.total_price)),
              status: shopifyOrder.financial_status
            });
            orders.push(newOrder);
          }
        }
        // Also include any existing local orders
        orders.push(...Array.from(this.orders.values()));
        return orders;
      } catch (error) {
        console.error('Error syncing orders from Shopify:', error);
        return Array.from(this.orders.values());
      }
    }
    return Array.from(this.orders.values());
  }

  async getOrderByShopifyId(shopifyId: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.shopifyId === shopifyId);
  }

  async syncOrdersFromShopify(shopDomain: string): Promise<Order[]> {
    return await this.getOrders(shopDomain);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.customerId === customerId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = { 
      id,
      shopifyId: insertOrder.shopifyId || null,
      customerId: insertOrder.customerId || null,
      total: insertOrder.total,
      pointsEarned: insertOrder.pointsEarned || 0,
      status: insertOrder.status,
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  // Subscription methods
  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values());
  }

  async getSubscription(id: string): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async getSubscriptionsByCustomer(customerId: string): Promise<Subscription[] > {
    return Array.from(this.subscriptions.values()).filter(s => s.customerId === customerId);
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const subscription: Subscription = { 
      id,
      customerId: insertSubscription.customerId || null,
      productId: insertSubscription.productId || null,
      status: insertSubscription.status || 'active',
      frequency: insertSubscription.frequency,
      nextDelivery: insertSubscription.nextDelivery || null,
      createdAt: new Date() 
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return undefined;

    const updatedSubscription = { ...subscription, ...updates };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Loyalty transaction methods
  async getLoyaltyTransactions(): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values());
  }

  async getLoyaltyTransactionsByCustomer(customerId: string): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values()).filter(t => t.customerId === customerId);
  }

  async createLoyaltyTransaction(insertTransaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const id = randomUUID();
    const transaction: LoyaltyTransaction = { 
      id,
      customerId: insertTransaction.customerId || null,
      orderId: insertTransaction.orderId || null,
      points: insertTransaction.points,
      type: insertTransaction.type,
      createdAt: new Date() 
    };
    this.loyaltyTransactions.set(id, transaction);
    return transaction;
  }

  // Inventory Management methods
  async getWarehouses(): Promise<any[]> {
    return this.warehouses;
  }

  async getWarehouse(id: string): Promise<any | undefined> {
    return this.warehouses.find(w => w.id === id);
  }

  async createWarehouse(warehouseData: any): Promise<any> {
    const warehouse = {
      id: Date.now().toString(),
      ...warehouseData,
      createdAt: new Date().toISOString()
    };
    this.warehouses.push(warehouse);
    return warehouse;
  }

  async updateWarehouse(id: string, updates: Partial<any>): Promise<any | undefined> {
    const warehouse = this.warehouses.find(w => w.id === id);
    if (!warehouse) return undefined;
    const updatedWarehouse = { ...warehouse, ...updates };
    this.warehouses = this.warehouses.map(w => w.id === id ? updatedWarehouse : w);
    return updatedWarehouse;
  }

  async getInventoryBatches(): Promise<any[]> {
    return this.inventoryBatches;
  }

  async getInventoryBatch(batchId: string): Promise<any> {
    return this.inventoryBatches.find(batch => batch.id === batchId);
  }

  async createInventoryBatch(batchData: any): Promise<any> {
    const batch = {
      id: Date.now().toString(),
      ...batchData,
      createdAt: new Date().toISOString()
    };
    this.inventoryBatches.push(batch);
    return batch;
  }

  async updateInventoryBatch(batchId: string, updates: any): Promise<any> {
    const index = this.inventoryBatches.findIndex(batch => batch.id === batchId);
    if (index !== -1) {
      this.inventoryBatches[index] = { ...this.inventoryBatches[index], ...updates };
      return this.inventoryBatches[index];
    }
    return null;
  }

  async getBatchByProductAndExpiry(productId: string, expiryDate: Date): Promise<any | undefined> {
    return this.inventoryBatches.find(b => b.productId === productId && new Date(b.expiryDate).toDateString() === expiryDate.toDateString());
  }

  async getExpiringStock(daysUntilExpiry: number): Promise<any[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysUntilExpiry);
    return this.inventoryBatches.filter(b => new Date(b.expiryDate) <= expiryDate);
  }

  async getStockAdjustments(): Promise<any[]> {
    return this.stockAdjustments;
  }

  async createStockAdjustment(adjustmentData: any): Promise<any> {
    const adjustment = {
      id: Date.now().toString(),
      ...adjustmentData,
      createdAt: new Date().toISOString()
    };
    this.stockAdjustments.push(adjustment);
    // Add to stock movements for audit history
    this.stockMovements.push({
      id: randomUUID(),
      itemId: adjustment.productId, // Assuming adjustment is for a product
      type: adjustment.type, // e.g., 'adjustment'
      quantityChange: adjustment.quantity,
      reason: adjustment.reason,
      adjustedBy: adjustment.adjustedBy,
      timestamp: new Date(),
      batchId: adjustment.batchId,
      warehouseId: adjustment.warehouseId
    });
    return adjustment;
  }

  async getStockMovements(): Promise<any[]> {
    return this.stockMovements;
  }

  async createStockMovement(movementData: any): Promise<any> {
    const movement = {
      id: randomUUID(),
      ...movementData,
      createdAt: new Date().toISOString()
    };
    this.stockMovements.push(movement);
    return movement;
  }

  async getStockAuditHistory(itemId: string): Promise<any[]> {
    return this.stockMovements.filter(m => m.itemId === itemId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Multi-Vendor Management methods
  async getVendors(): Promise<any[]> {
    return this.vendors;
  }

  async getVendor(vendorId: string): Promise<any> {
    return this.vendors.find(vendor => vendor.id === vendorId);
  }

  async createVendor(vendor: any): Promise<any> {
    const newVendor = { ...vendor, id: randomUUID(), createdAt: new Date(), totalSpent: "0.00", outstandingDues: "0.00" };
    this.vendors.push(newVendor);
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<any>): Promise<any | undefined> {
    const vendor = this.vendors.find(v => v.id === id);
    if (!vendor) return undefined;
    const updatedVendor = { ...vendor, ...updates };
    this.vendors = this.vendors.map(v => v.id === id ? updatedVendor : v);
    return updatedVendor;
  }

  async getPurchaseOrders(): Promise<any[]> {
    return this.purchaseOrders;
  }

  async getPurchaseOrder(poId: string): Promise<any> {
    return this.purchaseOrders.find(po => po.id === poId);
  }

  async getPurchaseOrderItems(poId: string): Promise<any[]> {
    return this.purchaseOrderItems.filter(item => item.purchaseOrderId === poId);
  }

  async createPurchaseOrder(po: any): Promise<any> {
    const newPO = { ...po, id: randomUUID(), status: 'Draft', createdAt: new Date() };
    this.purchaseOrders.push(newPO);
    // Add items to purchaseOrderItems
    if (po.items && po.items.length > 0) {
      po.items.forEach((item: any) => {
        this.purchaseOrderItems.push({
          id: randomUUID(),
          purchaseOrderId: newPO.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost
        });
      });
    }
    return newPO;
  }

  async updatePurchaseOrder(id: string, updates: Partial<any>): Promise<any | undefined> {
    const po = this.purchaseOrders.find(p => p.id === id);
    if (!po) return undefined;
    const updatedPO = { ...po, ...updates };
    this.purchaseOrders = this.purchaseOrders.map(p => p.id === id ? updatedPO : p);
    // If status changes to 'Delivered', update vendor's totalSpent and outstandingDues
    if (updatedPO.status === 'Delivered' && po.status !== 'Delivered') {
      const vendor = await this.getVendor(updatedPO.vendorId);
      if (vendor) {
        const totalCostOfPO = this.purchaseOrderItems
          .filter(item => item.purchaseOrderId === id)
          .reduce((sum, item) => sum + parseFloat(item.totalCost), 0);

        const newTotalSpent = (parseFloat(vendor.totalSpent) + totalCostOfPO).toFixed(2);
        const newOutstandingDues = (parseFloat(vendor.outstandingDues) + totalCostOfPO).toFixed(2); // Assuming PO cost adds to dues initially

        await this.updateVendor(vendor.id, {
          totalSpent: newTotalSpent,
          outstandingDues: newOutstandingDues
        });
      }
    }
    return updatedPO;
  }

  async updatePurchaseOrderItem(itemId: string, updates: any): Promise<any> {
    const index = this.purchaseOrderItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.purchaseOrderItems[index] = { ...this.purchaseOrderItems[index], ...updates };
      return this.purchaseOrderItems[index];
    }
    return null;
  }

  async createPurchaseOrderItem(itemData: any): Promise<any> {
    const item = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString()
    };
    this.purchaseOrderItems.push(item);
    return item;
  }

  async getPurchaseOrdersByVendor(vendorId: string): Promise<any[]> {
    return this.purchaseOrders.filter(po => po.vendorId === vendorId);
  }

  async getVendorPayments(): Promise<any[]> {
    return this.vendorPayments;
  }

  async getVendorPayment(id: string): Promise<any | undefined> {
    return this.vendorPayments.find(vp => vp.id === id);
  }

  async createVendorPayment(paymentData: any): Promise<any> {
    const payment = {
      id: Date.now().toString(),
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    this.vendorPayments.push(payment);

    // Update vendor's outstanding dues
    const vendor = await this.getVendor(payment.vendorId);
    if (vendor) {
      const newOutstandingDues = (parseFloat(vendor.outstandingDues) - parseFloat(payment.amount)).toFixed(2);
      await this.updateVendor(vendor.id, { outstandingDues: newOutstandingDues });
    }

    // Potentially update PO status if fully paid
    if (payment.purchaseOrderId) {
      const po = await this.getPurchaseOrder(payment.purchaseOrderId);
      if (po && parseFloat(po.totalCost) <= parseFloat(payment.amount)) {
        await this.updatePurchaseOrder(payment.purchaseOrderId, { status: 'Closed' });
      }
    }

    return payment;
  }


  // Analytics methods
  async getStats(shopDomain?: string) {
    const products = await this.getProducts(shopDomain);
    const lowStockProducts = await this.getLowStockProducts(10, shopDomain);
    const subscriptions = await this.getSubscriptions();
    const orders = await this.getOrders(shopDomain);
    const customers = await this.getCustomers(shopDomain);

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalLoyaltyPoints = customers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0);
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    return {
      totalProducts: products.length,
      lowStockItems: lowStockProducts.length,
      totalLoyaltyPoints,
      activeSubscriptions,
      totalSales,
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? totalSales / orders.length : 0,
    };
  }

  // Enhanced analytics for charts and reports
  async getSalesTrends() {
    const orders = await this.getOrders();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(order => 
        order.createdAt.toISOString().split('T')[0] === date
      );
      const sales = dayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

      return {
        date,
        sales: Math.round(sales * 100) / 100,
        orders: dayOrders.length
      };
    });
  }

  async getTopProducts() {
    // This needs actual sales data per product. Currently, 'sold' is not tracked per product.
    // For demonstration, we'll return dummy data or data based on current stock.
    const products = await this.getProducts();
    return products
      .sort((a, b) => (b.sold || 0) - (a.sold || 0)) // Assuming 'sold' might be added later
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        sold: p.sold || 0, // Placeholder for actual sold quantity
        revenue: ((p.sold || 0) * parseFloat(p.price)) // Placeholder for revenue
      }));
  }

  async getLoyaltyPointsAnalytics() {
    const transactions = await this.getLoyaltyTransactions();
    const earned = transactions.filter(t => t.type === 'earned').reduce((sum, t) => sum + t.points, 0);
    const redeemed = transactions.filter(t => t.type === 'redeemed').reduce((sum, t) => sum + Math.abs(t.points), 0);

    return {
      earned,
      redeemed,
      available: earned - redeemed
    };
  }

  // Stock forecasting
  async getStockForecast() {
    const products = await this.getProducts();
    const orders = await this.getOrders(); // This might not be the best source for sales if not all orders are processed through this system

    return products.map(product => {
      // Calculate average daily sales over last 30 days from orders
      const relevantOrders = orders.filter(order => 
        order.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );

      // This logic needs to be more robust - mapping orders to products and their quantities sold.
      // For now, it's a placeholder using a simplified approach.
      const totalQuantitySold = relevantOrders.reduce((sum, order) => {
        // This is a simplification, assuming product.sold could be populated from order items.
        // A real implementation would need to parse order items.
        return sum + (product.sold || 0); // Placeholder for actual quantity sold
      }, 0);

      const averageDailySales = totalQuantitySold > 0 ? totalQuantitySold / 30 : 0;
      const dailySales = Math.max(averageDailySales, 0.1); // Prevent division by zero
      const daysLeft = product.stock / dailySales;

      return {
        id: product.id,
        name: product.name,
        stock: product.stock,
        dailySales: Math.round(dailySales * 100) / 100,
        daysLeft: Math.round(daysLeft),
        status: daysLeft < 7 ? 'critical' : daysLeft < 14 ? 'warning' : 'good'
      };
    });
  }

  async getSystemSettings() {
    // Mock system settings
    return {
      general: {
        companyName: 'Demo Store Inc.',
        companyEmail: 'info@demo-store.com',
        companyAddress: '123 Business St, Commerce City, BC 12345',
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        fiscalYearStart: 'January'
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
        lowStockThreshold: 10,
        orderNotifications: true
      },
      integrations: {
        shopifyConnected: true,
        stripeConnected: false,
        mailchimpConnected: false,
        googleAnalyticsConnected: true
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        loginAttempts: 5
      }
    };
  }

  async getVendorAnalytics() {
    const vendors = await this.getVendors();
    const purchaseOrders = await this.getPurchaseOrders();

    const vendorAnalytics = vendors.map(vendor => {
      const vendorPOs = purchaseOrders.filter(po => po.vendorId === vendor.id);
      const totalPOs = vendorPOs.length;
      const deliveredPOs = vendorPOs.filter(po => po.status === 'Delivered').length;
      const avgCostPerPO = totalPOs > 0 ? parseFloat(vendor.totalSpent) / totalPOs : 0;
      const deliveryPerformance = totalPOs > 0 ? (deliveredPOs / totalPOs) * 100 : 0;

      return {
        id: vendor.id,
        name: vendor.name,
        totalPOs,
        deliveredPOs,
        avgCostPerPO: parseFloat(avgCostPerPO.toFixed(2)),
        deliveryPerformance: parseFloat(deliveryPerformance.toFixed(2)),
        outstandingDues: parseFloat(vendor.outstandingDues)
      };
    });

    // Add overall trends if needed, e.g., cost trend over time (requires PO dates)
    return vendorAnalytics;
  }


  // Permission Management Methods
  async getPermissions(): Promise<any[]> {
    return this.permissions;
  }

  async getRolePermissions(role: string): Promise<any[]> {
    return this.rolePermissions.filter(rp => rp.role === role);
  }

  async updateRolePermissions(role: string, permissions: Record<string, boolean>): Promise<void> {
    // Remove existing permissions for this role
    this.rolePermissions = this.rolePermissions.filter(rp => rp.role !== role);

    // Add new permissions
    Object.entries(permissions).forEach(([permissionName, granted]) => {
      this.rolePermissions.push({
        id: randomUUID(),
        role,
        permissionName,
        granted,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  async checkUserPermission(role: string, permissionName: string): Promise<boolean> {
    if (role === 'superadmin') return true; // Super admin has all permissions

    const rolePermission = this.rolePermissions.find(
      rp => rp.role === role && rp.permissionName === permissionName
    );

    return rolePermission ? rolePermission.granted : false;
  }

  async getUserPermissions(role: string): Promise<Record<string, boolean>> {
    const userRolePermissions = this.rolePermissions.filter(rp => rp.role === role);
    const permissionsObj: Record<string, boolean> = {};

    userRolePermissions.forEach(rp => {
      permissionsObj[rp.permissionName] = rp.granted;
    });

    return permissionsObj;
  }

  // Role-based access helpers
  async getUserRole(userId: string): Promise<'superadmin' | 'admin' | 'staff' | 'customer'> {
    const user = await this.getUserById(userId);
    if (!user) return 'customer'; // Default to customer if user not found

    if (user.role) return user.role as 'superadmin' | 'admin' | 'staff' | 'customer';

    // Fallback for mock roles if not explicitly set
    if (userId === 'superadmin' || userId.includes('superadmin')) return 'superadmin';
    if (userId === 'admin' || userId.includes('admin')) return 'admin';
    if (userId === 'staff' || userId.includes('staff')) return 'staff';
    return 'customer';
  }

  async getAlertsForUser(userId: string) {
    const role = await this.getUserRole(userId);
    const alerts = [];

    // Low Stock Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const lowStockProducts = await this.getLowStockProducts();
      if (lowStockProducts.length > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockProducts.length} products are low in stock`,
          action: 'View Inventory',
          route: '/inventory' // Example route
        });
      }

      // Expiring Stock Alert (for Admin/Staff)
      const expiringBatches = await this.getExpiringStock(7); // Within 7 days
      if (expiringBatches.length > 0) {
        alerts.push({
          type: 'info',
          message: `${expiringBatches.length} inventory batches expire within 7 days`,
          action: 'View Batches',
          route: '/inventory/batches' // Example route
        });
      }
    }

    // Pending Purchase Orders Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const pendingPOs = this.purchaseOrders.filter(po => po.status === 'Sent');
      if (pendingPOs.length > 0) {
        alerts.push({
          type: 'info',
          message: `${pendingPOs.length} purchase orders are awaiting delivery`,
          action: 'View Purchase Orders',
          route: '/vendors/purchase-orders' // Example route
        });
      }
    }

    // Pending Vendor Payments Alert (for Admin/Staff)
    if (role === 'admin' || role === 'staff') {
      const vendorsWithDue = this.vendors.filter(v => parseFloat(v.outstandingDues) > 0);
      if (vendorsWithDue.length > 0) {
        alerts.push({
          type: 'warning',
          message: `Outstanding dues for ${vendorsWithDue.length} vendors`,
          action: 'View Vendor Payments',
          route: '/vendors/payments' // Example route
        });
      }
    }

    return alerts;
  }

  // Accounting Module Methods

  // Chart of Accounts
  async getAccounts(shopDomain?: string): Promise<Account[]> {
    // In a real scenario, this would fetch accounts from a database, possibly filtered by shopDomain
    const mockAccounts: Account[] = [
      { id: '1000', code: '1000', name: 'Cash', type: 'Asset', category: 'Current', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '1100', code: '1100', name: 'Accounts Receivable', type: 'Asset', category: 'Current', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '1200', code: '1200', name: 'Inventory', type: 'Asset', category: 'Current', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '1500', code: '1500', name: 'Equipment', type: 'Asset', category: 'Fixed', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '1510', code: '1510', name: 'Accumulated Depreciation', type: 'Contra-Asset', category: 'Fixed', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '2000', code: '2000', name: 'Accounts Payable', type: 'Liability', category: 'Current', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '2200', code: '2200', name: 'Short-term Debt', type: 'Liability', category: 'Current', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '2500', code: '2500', name: 'Long-term Debt', type: 'Liability', category: 'Long-Term', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '3000', code: '3000', name: 'Owner\'s Equity', type: 'Equity', category: 'Equity', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '3100', code: '3100', name: 'Retained Earnings', type: 'Equity', category: 'Equity', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '4000', code: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '5000', code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '6000', code: '6000', name: 'Salaries Expense', type: 'Expense', category: 'Operating', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
      { id: '6100', code: '6100', name: 'Rent Expense', type: 'Expense', category: 'Operating', shopDomain: shopDomain || 'demo-store.myshopify.com', createdAt: new Date(), updatedAt: new Date() },
    ];
    return mockAccounts.filter(acc => !shopDomain || acc.shopDomain === shopDomain);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async getAccountByCode(accountCode: string, shopDomain?: string): Promise<Account | undefined> {
    const accounts = await this.getAccounts(shopDomain);
    return accounts.find(acc => acc.code === accountCode);
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const newAccount: Account = {
      id,
      code: account.code,
      name: account.name,
      type: account.type,
      category: account.category,
      shopDomain: account.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.accounts.set(id, newAccount);
    return newAccount;
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;
    const updatedAccount = { ...account, ...updates, updatedAt: new Date() };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  async getAccountsHierarchy(shopDomain?: string): Promise<any[]> {
    // This is a complex operation that requires building a tree structure.
    // For mock data, we can return a flat list or a simplified structure.
    const accounts = await this.getAccounts(shopDomain);
    return accounts.map(acc => ({ ...acc, children: [] })); // Simplified structure
  }

  // Journal Entries
  async getJournalEntries(shopDomain?: string, filters?: any): Promise<JournalEntry[]> {
    // Mock journal entries, potentially filtered
    const mockEntries: JournalEntry[] = [
      {
        id: randomUUID(),
        journalId: 'JRN001',
        date: new Date('2023-10-26'),
        description: 'Initial Setup',
        status: 'Posted',
        postedBy: 'admin',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        journalId: 'JRN002',
        date: new Date('2023-10-27'),
        description: 'Purchase of Supplies',
        status: 'Posted',
        postedBy: 'staff',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockEntries.filter(entry => !shopDomain || entry.shopDomain === shopDomain);
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async createJournalEntry(entry: InsertJournalEntry, lines: InsertJournalEntryLine[]): Promise<JournalEntry> {
    const id = randomUUID();
    const newEntry: JournalEntry = {
      id,
      journalId: entry.journalId,
      date: entry.date,
      description: entry.description,
      status: 'Draft', // Default status
      postedBy: null,
      shopDomain: entry.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.journalEntries.set(id, newEntry);

    // Create journal entry lines
    const createdLines = lines.map(line => ({
      id: randomUUID(),
      journalEntryId: id,
      accountId: line.accountId,
      debit: line.debit || 0,
      credit: line.credit || 0,
      description: line.description,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    this.journalEntryLines.set(id, createdLines);

    return newEntry;
  }

  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    this.journalEntryLines.delete(id); // Also delete associated lines
    return this.journalEntries.delete(id);
  }

  async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry || entry.status === 'Posted') return entry;

    // Update status and postedBy
    const updatedEntry = await this.updateJournalEntry(id, { status: 'Posted', postedBy });

    // In a real system, posting would involve updating account balances and general ledger.
    // For mock, we'll just update the status.
    return updatedEntry;
  }

  async reverseJournalEntry(id: string, reversedBy: string): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry || entry.status !== 'Posted') return entry;

    // Create a reversing entry
    const reversingEntry: InsertJournalEntry = {
      journalId: `REV-${entry.journalId}`,
      date: entry.date, // Or current date
      description: `Reversal of ${entry.description}`,
      shopDomain: entry.shopDomain,
    };

    const lines = (this.journalEntryLines.get(id) || []).map(line => ({
      accountId: line.accountId,
      debit: line.credit || 0, // Swap debit and credit
      credit: line.debit || 0,
      description: `Reversal of: ${line.description}`,
    }));

    const reversedEntry = await this.createJournalEntry(reversingEntry, lines);
    await this.postJournalEntry(reversedEntry.id, reversedBy); // Automatically post the reversing entry

    // Mark the original entry as reversed
    await this.updateJournalEntry(id, { status: 'Reversed', reversedBy });

    return reversedEntry;
  }

  // Journal Entry Lines
  async getJournalEntryLines(journalEntryId: string): Promise<JournalEntryLine[]> {
    return this.journalEntryLines.get(journalEntryId) || [];
  }

  async createJournalEntryLine(line: InsertJournalEntryLine): Promise<JournalEntryLine> {
    const id = randomUUID();
    const newLine: JournalEntryLine = {
      id,
      journalEntryId: line.journalEntryId,
      accountId: line.accountId,
      debit: line.debit || 0,
      credit: line.credit || 0,
      description: line.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingLines = this.journalEntryLines.get(line.journalEntryId) || [];
    existingLines.push(newLine);
    this.journalEntryLines.set(line.journalEntryId, existingLines);

    return newLine;
  }

  async updateJournalEntryLine(id: string, updates: Partial<JournalEntryLine>): Promise<JournalEntryLine | undefined> {
    // Find the entry and then the line to update
    for (const [entryId, lines] of this.journalEntryLines.entries()) {
      const lineIndex = lines.findIndex(line => line.id === id);
      if (lineIndex !== -1) {
        const updatedLine = { ...lines[lineIndex], ...updates, updatedAt: new Date() };
        lines[lineIndex] = updatedLine;
        this.journalEntryLines.set(entryId, lines);
        return updatedLine;
      }
    }
    return undefined;
  }

  async deleteJournalEntryLine(id: string): Promise<boolean> {
    for (const [entryId, lines] of this.journalEntryLines.entries()) {
      const initialLength = lines.length;
      const updatedLines = lines.filter(line => line.id !== id);
      if (updatedLines.length < initialLength) {
        this.journalEntryLines.set(entryId, updatedLines);
        return true;
      }
    }
    return false;
  }

  // General Ledger
  async getGeneralLedger(shopDomain?: string, filters?: any): Promise<GeneralLedger[]> {
    // Mock general ledger entries
    const mockLedger: GeneralLedger[] = [
      {
        id: randomUUID(),
        journalEntryId: 'JRN001',
        accountId: '1000', // Cash
        date: new Date('2023-10-26'),
        description: 'Initial Setup - Cash Deposit',
        debit: 50000,
        credit: 0,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        journalEntryId: 'JRN001',
        accountId: '3000', // Owner's Equity
        date: new Date('2023-10-26'),
        description: 'Initial Setup - Owner Contribution',
        debit: 0,
        credit: 50000,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        journalEntryId: 'JRN002',
        accountId: '1200', // Inventory
        date: new Date('2023-10-27'),
        description: 'Purchase of Supplies - Inventory',
        debit: 10000,
        credit: 0,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        journalEntryId: 'JRN002',
        accountId: '2000', // Accounts Payable
        date: new Date('2023-10-27'),
        description: 'Purchase of Supplies - Accounts Payable',
        debit: 0,
        credit: 10000,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockLedger.filter(entry => !shopDomain || entry.shopDomain === shopDomain);
  }

  async getAccountLedger(accountId: string, startDate?: Date, endDate?: Date): Promise<GeneralLedger[]> {
    const ledgerEntries = Array.from(this.generalLedger.values());
    return ledgerEntries.filter(entry => 
      entry.accountId === accountId &&
      (!startDate || entry.date >= startDate) &&
      (!endDate || entry.date <= endDate)
    );
  }

  async createLedgerEntry(entry: InsertGeneralLedger): Promise<GeneralLedger> {
    const id = randomUUID();
    const newEntry: GeneralLedger = {
      id,
      journalEntryId: entry.journalEntryId,
      accountId: entry.accountId,
      date: entry.date,
      description: entry.description,
      debit: entry.debit || 0,
      credit: entry.credit || 0,
      shopDomain: entry.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.generalLedger.set(id, newEntry);
    return newEntry;
  }

  // Accounts Receivable
  async getAccountsReceivable(shopDomain?: string, filters?: any): Promise<AccountsReceivable[]> {
    const mockAR: AccountsReceivable[] = [
      {
        id: randomUUID(),
        customerId: 'cust_001',
        invoiceNumber: 'INV001',
        invoiceDate: new Date('2023-10-15'),
        dueDate: new Date('2023-11-14'),
        amount: 500.00,
        status: 'Open',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        customerId: 'cust_002',
        invoiceNumber: 'INV002',
        invoiceDate: new Date('2023-10-20'),
        dueDate: new Date('2023-11-19'),
        amount: 750.50,
        status: 'Open',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockAR.filter(ar => !shopDomain || ar.shopDomain === shopDomain);
  }

  async getReceivable(id: string): Promise<AccountsReceivable | undefined> {
    return this.accountsReceivable.get(id);
  }

  async createReceivable(receivable: InsertAccountsReceivable): Promise<AccountsReceivable> {
    const id = randomUUID();
    const newAR: AccountsReceivable = {
      id,
      customerId: receivable.customerId,
      invoiceNumber: receivable.invoiceNumber,
      invoiceDate: receivable.invoiceDate,
      dueDate: receivable.dueDate,
      amount: receivable.amount,
      status: receivable.status || 'Open',
      shopDomain: receivable.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.accountsReceivable.set(id, newAR);
    return newAR;
  }

  async updateReceivable(id: string, updates: Partial<AccountsReceivable>): Promise<AccountsReceivable | undefined> {
    const ar = this.accountsReceivable.get(id);
    if (!ar) return undefined;
    const updatedAR = { ...ar, ...updates, updatedAt: new Date() };
    this.accountsReceivable.set(id, updatedAR);
    return updatedAR;
  }

  async getReceivablesByCustomer(customerId: string): Promise<AccountsReceivable[]> {
    return Array.from(this.accountsReceivable.values()).filter(ar => ar.customerId === customerId);
  }

  async getOverdueReceivables(shopDomain?: string): Promise<AccountsReceivable[]> {
    const today = new Date();
    return Array.from(this.accountsReceivable.values())
      .filter(ar => 
        (!shopDomain || ar.shopDomain === shopDomain) &&
        ar.status === 'Open' &&
        ar.dueDate < today
      );
  }

  async getAgingReport(shopDomain?: string): Promise<any> {
    // Mock aging report
    const overdue = await this.getOverdueReceivables(shopDomain);
    const today = new Date();
    return {
      '0-30 Days': overdue.filter(ar => (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 30).reduce((sum, ar) => sum + ar.amount, 0).toFixed(2),
      '31-60 Days': overdue.filter(ar => (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 30 && (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 60).reduce((sum, ar) => sum + ar.amount, 0).toFixed(2),
      '61-90 Days': overdue.filter(ar => (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 60 && (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 90).reduce((sum, ar) => sum + ar.amount, 0).toFixed(2),
      '>90 Days': overdue.filter(ar => (today.getTime() - ar.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 90).reduce((sum, ar) => sum + ar.amount, 0).toFixed(2),
      totalOverdue: overdue.reduce((sum, ar) => sum + ar.amount, 0).toFixed(2)
    };
  }

  // Accounts Payable
  async getAccountsPayable(shopDomain?: string, filters?: any): Promise<AccountsPayable[]> {
    const mockAP: AccountsPayable[] = [
      {
        id: randomUUID(),
        vendorId: 'vendor-1',
        invoiceNumber: 'APINV001',
        invoiceDate: new Date('2023-10-10'),
        dueDate: new Date('2023-11-09'),
        amount: 1200.00,
        status: 'Open',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        vendorId: 'vendor-1',
        invoiceNumber: 'APINV002',
        invoiceDate: new Date('2023-10-22'),
        dueDate: new Date('2023-11-21'),
        amount: 800.00,
        status: 'Open',
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockAP.filter(ap => !shopDomain || ap.shopDomain === shopDomain);
  }

  async getPayable(id: string): Promise<AccountsPayable | undefined> {
    return this.accountsPayable.get(id);
  }

  async createPayable(payable: InsertAccountsPayable): Promise<AccountsPayable> {
    const id = randomUUID();
    const newAP: AccountsPayable = {
      id,
      vendorId: payable.vendorId,
      invoiceNumber: payable.invoiceNumber,
      invoiceDate: payable.invoiceDate,
      dueDate: payable.dueDate,
      amount: payable.amount,
      status: payable.status || 'Open',
      shopDomain: payable.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.accountsPayable.set(id, newAP);
    return newAP;
  }

  async updatePayable(id: string, updates: Partial<AccountsPayable>): Promise<AccountsPayable | undefined> {
    const ap = this.accountsPayable.get(id);
    if (!ap) return undefined;
    const updatedAP = { ...ap, ...updates, updatedAt: new Date() };
    this.accountsPayable.set(id, updatedAP);
    return updatedAP;
  }

  async getPayablesByVendor(vendorId: string): Promise<AccountsPayable[]> {
    return Array.from(this.accountsPayable.values()).filter(ap => ap.vendorId === vendorId);
  }

  async getOverduePayables(shopDomain?: string): Promise<AccountsPayable[]> {
    const today = new Date();
    return Array.from(this.accountsPayable.values())
      .filter(ap => 
        (!shopDomain || ap.shopDomain === shopDomain) &&
        ap.status === 'Open' &&
        ap.dueDate < today
      );
  }

  async getVendorAgingReport(shopDomain?: string): Promise<any> {
    // Mock vendor aging report
    const overdue = await this.getOverduePayables(shopDomain);
    const today = new Date();
    return {
      '0-30 Days': overdue.filter(ap => (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 30).reduce((sum, ap) => sum + ap.amount, 0).toFixed(2),
      '31-60 Days': overdue.filter(ap => (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 30 && (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 60).reduce((sum, ap) => sum + ap.amount, 0).toFixed(2),
      '61-90 Days': overdue.filter(ap => (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 60 && (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) <= 90).reduce((sum, ap) => sum + ap.amount, 0).toFixed(2),
      '>90 Days': overdue.filter(ap => (today.getTime() - ap.dueDate.getTime()) / (1000 * 60 * 60 * 24) > 90).reduce((sum, ap) => sum + ap.amount, 0).toFixed(2),
      totalOverdue: overdue.reduce((sum, ap) => sum + ap.amount, 0).toFixed(2)
    };
  }

  // Wallets & Credits
  async getWallets(entityType?: string, shopDomain?: string): Promise<Wallet[]> {
    const mockWallets: Wallet[] = [
      {
        id: randomUUID(),
        entityType: 'customer',
        entityId: 'cust_001',
        balance: 150.75,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        entityType: 'customer',
        entityId: 'cust_002',
        balance: 50.00,
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockWallets.filter(w => 
      (!entityType || w.entityType === entityType) &&
      (!shopDomain || w.shopDomain === shopDomain)
    );
  }

  async getWallet(id: string): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByEntity(entityType: string, entityId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.entityType === entityType && w.entityId === entityId);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = randomUUID();
    const newWallet: Wallet = {
      id,
      entityType: wallet.entityType,
      entityId: wallet.entityId,
      balance: wallet.balance || 0,
      shopDomain: wallet.shopDomain || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    const updatedWallet = { ...wallet, ...updates, updatedAt: new Date() };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  async deleteWallet(id: string): Promise<boolean> {
    // Potentially also delete associated transactions
    return this.wallets.delete(id);
  }

  // Wallet Transactions
  async getWalletTransactions(walletId?: string): Promise<WalletTransaction[]> {
    const mockTransactions: WalletTransaction[] = [
      {
        id: randomUUID(),
        walletId: Array.from(this.wallets.values())[0]?.id, // Assuming first wallet is for cust_001
        amount: 50.00,
        type: 'credit',
        description: 'Loyalty Points Redemption',
        performedBy: 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        walletId: Array.from(this.wallets.values())[0]?.id,
        amount: -25.50,
        type: 'debit',
        description: 'Order Discount',
        performedBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockTransactions.filter(t => !walletId || t.walletId === walletId);
  }

  async getWalletTransaction(id: string): Promise<WalletTransaction | undefined> {
    // This requires iterating through all transactions if not stored efficiently
    for (const [, transactions] of this.walletTransactions.entries()) {
      const transaction = transactions.find(t => t.id === id);
      if (transaction) return transaction;
    }
    return undefined;
  }

  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = randomUUID();
    const newTransaction: WalletTransaction = {
      id,
      walletId: transaction.walletId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      performedBy: transaction.performedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingTransactions = this.walletTransactions.get(transaction.walletId) || [];
    existingTransactions.push(newTransaction);
    this.walletTransactions.set(transaction.walletId, existingTransactions);

    return newTransaction;
  }

  async adjustWalletBalance(walletId: string, amount: number, description: string, performedBy: string): Promise<WalletTransaction> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error('Wallet not found');

    const transactionType = amount >= 0 ? 'credit' : 'debit';
    const transactionAmount = Math.abs(amount);

    const newBalance = wallet.balance + amount;
    await this.updateWallet(walletId, { balance: newBalance });

    return this.createWalletTransaction({
      walletId,
      amount: amount,
      type: transactionType,
      description,
      performedBy
    });
  }

  // Fiscal Periods
  async getFiscalPeriods(shopDomain?: string): Promise<FiscalPeriod[]> {
    const mockPeriods: FiscalPeriod[] = [
      {
        id: randomUUID(),
        shopDomain: shopDomain || 'demo-store.myshopify.com',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        name: '2023 Fiscal Year',
        status: 'Open',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockPeriods.filter(p => !shopDomain || p.shopDomain === shopDomain);
  }

  async getFiscalPeriod(id: string): Promise<FiscalPeriod | undefined> {
    return this.fiscalPeriods.get(id);
  }

  async getCurrentFiscalPeriod(shopDomain?: string): Promise<FiscalPeriod | undefined> {
    const periods = await this.getFiscalPeriods(shopDomain);
    const today = new Date();
    return periods.find(p => p.startDate <= today && p.endDate >= today && p.status === 'Open');
  }

  async createFiscalPeriod(period: InsertFiscalPeriod): Promise<FiscalPeriod> {
    const id = randomUUID();
    const newPeriod: FiscalPeriod = {
      id,
      shopDomain: period.shopDomain || null,
      startDate: period.startDate,
      endDate: period.endDate,
      name: period.name,
      status: period.status || 'Open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.fiscalPeriods.set(id, newPeriod);
    return newPeriod;
  }

  async updateFiscalPeriod(id: string, updates: Partial<FiscalPeriod>): Promise<FiscalPeriod | undefined> {
    const period = this.fiscalPeriods.get(id);
    if (!period) return undefined;
    const updatedPeriod = { ...period, ...updates, updatedAt: new Date() };
    this.fiscalPeriods.set(id, updatedPeriod);
    return updatedPeriod;
  }

  async closeFiscalPeriod(id: string): Promise<FiscalPeriod | undefined> {
    const period = await this.getFiscalPeriod(id);
    if (!period || period.status === 'Closed') return period;

    // In a real system, closing a period would involve generating closing journal entries.
    // For mock, we just update the status.
    return this.updateFiscalPeriod(id, { status: 'Closed' });
  }

  // Account Balances
  async getAccountBalances(accountId?: string, fiscalPeriodId?: string): Promise<AccountBalance[]> {
    // Mock account balances
    const mockBalances: AccountBalance[] = [
      {
        id: randomUUID(),
        accountId: '1000', // Cash
        fiscalPeriodId: await this.getCurrentFiscalPeriod()?.id,
        openingBalance: 6800,
        debits: 50000,
        credits: 2500,
        closingBalance: 115500, // This should be calculated
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: randomUUID(),
        accountId: '4000', // Sales Revenue
        fiscalPeriodId: await this.getCurrentFiscalPeriod()?.id,
        openingBalance: 0,
        debits: 0,
        credits: 103500,
        closingBalance: 103500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    return mockBalances.filter(b => 
      (!accountId || b.accountId === accountId) &&
      (!fiscalPeriodId || b.fiscalPeriodId === fiscalPeriodId)
    );
  }

  async getAccountBalance(accountId: string, fiscalPeriodId: string): Promise<AccountBalance | undefined> {
    return Array.from(this.accountBalances.values()).find(b => b.accountId === accountId && b.fiscalPeriodId === fiscalPeriodId);
  }

  async calculateAccountBalance(accountId: string, fiscalPeriodId: string): Promise<AccountBalance> {
    const period = await this.getFiscalPeriod(fiscalPeriodId);
    if (!period) throw new Error('Fiscal period not found');

    // Fetch all journal entries within the period for the account
    const ledgerEntries = await this.getGeneralLedger(undefined, {
      accountId,
      startDate: period.startDate,
      endDate: period.endDate
    });

    let openingBalance = 0; // Need a way to get previous period balance
    let debits = 0;
    let credits = 0;

    ledgerEntries.forEach(entry => {
      if (entry.accountId === accountId) {
        debits += entry.debit;
        credits += entry.credit;
      }
    });

    // Determine closing balance based on account type
    let closingBalance = openingBalance + debits - credits; // Default for Asset/Expense accounts

    const account = await this.getAccountByCode(accountId); // Assuming accountId is actually account code here
    if (account) {
      if (account.type === 'Liability' || account.type === 'Equity' || account.type === 'Revenue') {
        closingBalance = openingBalance + credits - debits;
      }
    }

    return {
      id: randomUUID(), // New ID for calculation result
      accountId,
      fiscalPeriodId,
      openingBalance,
      debits,
      credits,
      closingBalance,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateAccountBalance(id: string, updates: Partial<AccountBalance>): Promise<AccountBalance | undefined> {
    const balance = this.accountBalances.get(id);
    if (!balance) return undefined;
    const updatedBalance = { ...balance, ...updates, updatedAt: new Date() };
    this.accountBalances.set(id, updatedBalance);
    return updatedBalance;
  }

  // Financial Reports Methods
  async getBalanceSheet(shopDomain?: string, asOfDate?: Date): Promise<any> {
    const date = asOfDate || new Date();

    return {
      companyName: 'Demo Store Inc.',
      asOfDate: date,
      assets: {
        currentAssets: {
          cash: 53000, // Updated based on journal entries
          accountsReceivable: 8983.80, // Sum of open receivables
          inventory: 12000,
          prepaidExpenses: 2500,
          marketableSecurities: 5000,
          totalCurrentAssets: 81483.80
        },
        fixedAssets: {
          equipment: 37000, // Includes new purchase
          accumulatedDepreciationEquipment: -5500,
          building: 150000,
          accumulatedDepreciationBuilding: -15000,
          land: 75000,
          intangibleAssets: 8000,
          goodwill: 12000,
          totalFixedAssets: 261500
        },
        totalAssets: 342983.80
      },
      liabilities: {
        currentLiabilities: {
          accountsPayable: 10582.50, // Sum of open payables
          accruedExpenses: 3500,
          shortTermDebt: 8000,
          payrollLiabilities: 800,
          salesTaxPayable: 1200,
          incomeTaxPayable: 2500,
          totalCurrentLiabilities: 26582.50
        },
        longTermLiabilities: {
          longTermDebt: 45000,
          mortgagePayable: 120000,
          deferredRevenue: 5000,
          totalLongTermLiabilities: 170000
        },
        totalLiabilities: 196582.50
      },
      equity: {
        ownersEquity: 50000,
        retainedEarnings: 86401.30,
        commonStock: 10000,
        additionalPaidInCapital: 0,
        totalEquity: 146401.30
      },
      totalLiabilitiesAndEquity: 342983.80,
      isBalanced: true
    };
  }

  async getProfitAndLoss(shopDomain?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const start = startDate || new Date('2023-01-01');
    const end = endDate || new Date('2023-12-31');

    return {
      companyName: 'Demo Store Inc.',
      periodStart: start,
      periodEnd: end,
      revenue: [
        { accountName: "Sales Revenue", amount: 155000 },
        { accountName: "Service Revenue", amount: 18500 },
        { accountName: "Interest Income", amount: 750 },
        { accountName: "Rental Income", amount: 3600 },
        { accountName: "Other Income", amount: 1200 }
      ],
      totalRevenue: 179050,
      costOfGoodsSold: {
        beginningInventory: 8000,
        purchases: 92000,
        endingInventory: 12000,
        totalCOGS: 88000
      },
      grossProfit: 91050,
      expenses: [
        { accountName: "Salaries & Wages", amount: 32000 },
        { accountName: "Rent Expense", amount: 15000 },
        { accountName: "Marketing & Advertising", amount: 12000 },
        { accountName: "Utilities", amount: 4800 },
        { accountName: "Insurance", amount: 3600 },
        { accountName: "Office Supplies", amount: 2400 },
        { accountName: "Professional Services", amount: 8500 },
        { accountName: "Depreciation Expense", amount: 6000 },
        { accountName: "Travel & Entertainment", amount: 4200 },
        { accountName: "Bad Debt Expense", amount: 1500 }
      ],
      totalExpenses: 90000,
      operatingIncome: 1050,
      nonOperatingExpenses: {
        interestExpense: 3600,
        bankCharges: 450,
        totalNonOperatingExpenses: 4050
      },
      netIncome: -3000,
      ebitda: 7050
    };
  }

  async getCashFlowStatement(shopDomain?: string, startDate?: Date, endDate?: Date): Promise<any> {
    const start = startDate || new Date('2023-01-01');
    const end = endDate || new Date('2023-12-31');

    return {
      companyName: 'Demo Store Inc.',
      periodStart: start,
      periodEnd: end,
      operatingActivities: {
        netIncome: -3000,
        adjustments: {
          depreciation: 6000,
          badDebtExpense: 1500,
          changesInWorkingCapital: {
            accountsReceivableChange: -2500,
            inventoryChange: 4000,
            prepaidExpensesChange: -500,
            accountsPayableChange: 2582.50,
            accruedExpensesChange: 1500
          }
        },
        netCashFromOperations: 9582.50
      },
      investingActivities: {
        equipmentPurchases: -12000,
        marketableSecuritiesPurchases: -5000,
        netCashFromInvesting: -17000
      },
      financingActivities: {
        debtPayments: -8000,
        ownerContributions: 50000,
        dividendsPaid: 0,
        netCashFromFinancing: 42000
      },
      netCashChange: 34582.50,
      beginningCash: 18417.50,
      endingCash: 53000
    };
  }

  async getTrialBalance(shopDomain?: string, asOfDate?: Date): Promise<any> {
    const date = asOfDate || new Date();

    return {
      companyName: 'Demo Store Inc.',
      asOfDate: date,
      accounts: [
        { accountCode: '1000', accountName: 'Cash and Cash Equivalents', debit: 53000, credit: 0 },
        { accountCode: '1100', accountName: 'Accounts Receivable', debit: 8983.80, credit: 0 },
        { accountCode: '1200', accountName: 'Inventory', debit: 12000, credit: 0 },
        { accountCode: '1300', accountName: 'Prepaid Expenses', debit: 2500, credit: 0 },
        { accountCode: '1400', accountName: 'Marketable Securities', debit: 5000, credit: 0 },
        { accountCode: '1500', accountName: 'Equipment', debit: 37000, credit: 0 },
        { accountCode: '1510', accountName: 'Accumulated Depreciation - Equipment', debit: 0, credit: 5500 },
        { accountCode: '1600', accountName: 'Building', debit: 150000, credit: 0 },
        { accountCode: '1610', accountName: 'Accumulated Depreciation - Building', debit: 0, credit: 15000 },
        { accountCode: '1700', accountName: 'Land', debit: 75000, credit: 0 },
        { accountCode: '1800', accountName: 'Intangible Assets', debit: 8000, credit: 0 },
        { accountCode: '1900', accountName: 'Goodwill', debit: 12000, credit: 0 },
        { accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 10582.50 },
        { accountCode: '2100', accountName: 'Accrued Expenses', debit: 0, credit: 3500 },
        { accountCode: '2200', accountName: 'Short-term Debt', debit: 0, credit: 8000 },
        { accountCode: '2300', accountName: 'Payroll Liabilities', debit: 0, credit: 800 },
        { accountCode: '2400', accountName: 'Sales Tax Payable', debit: 0, credit: 1200 },
        { accountCode: '2450', accountName: 'Income Tax Payable', debit: 0, credit: 2500 },
        { accountCode: '2500', accountName: 'Long-term Debt', debit: 0, credit: 45000 },
        { accountCode: '2600', accountName: 'Mortgage Payable', debit: 0, credit: 120000 },
        { accountCode: '2700', accountName: 'Deferred Revenue', debit: 0, credit: 5000 },
        { accountCode: '3000', accountName: 'Owner\'s Equity', debit: 0, credit: 50000 },
        { accountCode: '3100', accountName: 'Retained Earnings', debit: 0, credit: 86401.30 },
        { accountCode: '3200', accountName: 'Common Stock', debit: 0, credit: 10000 },
        { accountCode: '4000', accountName: 'Sales Revenue', debit: 0, credit: 155000 },
        { accountCode: '4100', accountName: 'Service Revenue', debit: 0, credit: 18500 },
        { accountCode: '4200', accountName: 'Interest Income', debit: 0, credit: 750 },
        { accountCode: '5000', accountName: 'Cost of Goods Sold', debit: 88000, credit: 0 },
        { accountCode: '6000', accountName: 'Salaries & Wages', debit: 32000, credit: 0 },
        { accountCode: '6100', accountName: 'Rent Expense', debit: 15000, credit: 0 },
        { accountCode: '6200', accountName: 'Marketing & Advertising', debit: 12000, credit: 0 },
        { accountCode: '6300', accountName: 'Utilities', debit: 4800, credit: 0 },
        { accountCode: '6400', accountName: 'Insurance', debit: 3600, credit: 0 },
        { accountCode: '6500', accountName: 'Office Supplies', debit: 2400, credit: 0 },
        { accountCode: '6600', accountName: 'Professional Services', debit: 8500, credit: 0 },
        { accountCode: '6700', accountName: 'Depreciation Expense', debit: 6000, credit: 0 },
        { accountCode: '7000', accountName: 'Interest Expense', debit: 3600, credit: 0 }
      ],
      totalDebits: 539383.80,
      totalCredits: 539383.80,
      isBalanced: true
    };
  }

  async getAccountingSummary(shopDomain?: string): Promise<any> {
    return {
      companyName: 'Demo Store Inc.',
      totalAssets: 342983.80,
      totalLiabilities: 196582.50,
      totalEquity: 146401.30,
      totalRevenue: 179050,
      totalExpenses: 182050,
      netIncome: -3000,
      ratios: {
        currentRatio: 3.07, // Current Assets / Current Liabilities
        quickRatio: 2.61, // (Current Assets - Inventory) / Current Liabilities
        debtToEquityRatio: 1.34, // Total Liabilities / Total Equity
        debtToAssetsRatio: 0.57, // Total Liabilities / Total Assets
        grossProfitMargin: 50.85, // (Revenue - COGS) / Revenue * 100
        netProfitMargin: -1.68, // Net Income / Revenue * 100
        returnOnAssets: -0.87, // Net Income / Total Assets * 100
        returnOnEquity: -2.05 // Net Income / Total Equity * 100
      },
      monthlyAverages: {
        revenue: 14921,
        expenses: 15171,
        netIncome: -250
      }
    };
  }

  async getFinancialMetrics(shopDomain?: string, period?: 'month' | 'quarter' | 'year'): Promise<any> {
    const periodMultiplier = period === 'month' ? 1 : period === 'quarter' ? 3 : 12;

    return {
      period,
      liquidity: {
        currentRatio: 3.07,
        quickRatio: 2.61,
        cashRatio: 1.99,
        workingCapital: 54901.30
      },
      profitability: {
        grossProfitMargin: 50.85,
        netProfitMargin: -1.68,
        operatingMargin: 0.59,
        returnOnAssets: -0.87,
        returnOnEquity: -2.05,
        ebitdaMargin: 3.94
      },
      efficiency: {
        inventoryTurnover: 7.33, // COGS / Average Inventory
        receivablesTurnover: 17.26, // Revenue / Average Receivables
        payablesTurnover: 8.32, // COGS / Average Payables
        assetTurnover: 0.52, // Revenue / Total Assets
        equityTurnover: 1.22 // Revenue / Total Equity
      },
      leverage: {
        debtToAssets: 0.57,
        debtToEquity: 1.34,
        equityMultiplier: 2.34,
        interestCoverage: 0.29, // Operating Income / Interest Expense
        debtServiceCoverage: 2.66
      },
      growth: {
        revenueGrowth: 15.2 * periodMultiplier,
        netIncomeGrowth: -125.5 * periodMultiplier,
        assetGrowth: 8.7 * periodMultiplier,
        equityGrowth: 12.3 * periodMultiplier
      }
    };
  }
}

export const storage = new MemStorage();