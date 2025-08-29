
# 📊 ShopifyApp Accounting Module Documentation

*Updated for Replit Environment - January 2025*

## Overview

The ShopifyApp Accounting Module provides comprehensive financial management capabilities following standard double-entry bookkeeping principles. This system enables businesses to track their financial transactions, generate reports, and maintain accurate accounting records with professional-grade features.

## 🚀 **Replit Ready Features**
- ✅ **Real-time Database**: PostgreSQL integration with Drizzle ORM
- ✅ **API Documentation**: Complete Swagger interface at `/api-docs`
- ✅ **Live Data Sync**: WebSocket support for real-time updates  
- ✅ **Seed Data**: Pre-populated sample accounting data for testing
- ✅ **Role-based Access**: Complete permission system implementation
- ✅ **Modern UI**: shadcn/ui components with responsive design

### Key Features

- **Chart of Accounts**: Standard accounting structure (Assets, Liabilities, Equity, Revenue, Expenses)
- **Double-Entry Bookkeeping**: All transactions maintain debit = credit balance
- **General Ledger**: Complete transaction history with running balances
- **Accounts Receivable**: Customer invoice tracking and aging reports
- **Accounts Payable**: Vendor bill management and payment tracking
- **Wallets & Credits**: Customer and vendor credit management system
- **Financial Reports**: Profit & Loss, Balance Sheet, and Cash Flow statements
- **Bank Reconciliation**: Automated matching and reconciliation features
- **Tax Management**: Tax rate configuration and compliance tracking
- **Role-Based Access Control**: SuperAdmin/Admin can modify; Staff view-only

---

## 🚀 Quick Access in Replit

### Accessing Accounting Features
1. **Login**: Use `admin@shopifyapp.com` / `admin123` for full access
2. **Navigation**: Use the sidebar to access accounting modules:
   - **Chart of Accounts**: `/accounting/chart-of-accounts` 
   - **General Ledger**: `/accounting/general-ledger`
   - **Journal Entries**: `/accounting/journal-entries`
   - **Accounts Receivable**: `/accounting/accounts-receivable`
   - **Accounts Payable**: `/accounting/accounts-payable`
   - **Wallets**: `/accounting/wallets`
   - **Financial Reports**: `/accounting/financial-reports`
   - **Bank Reconciliation**: `/accounting/bank-reconciliation`
   - **Tax Management**: `/accounting/tax-management`

### API Endpoints
All accounting data is accessible via REST APIs documented at `/api-docs`:
- **GET** `/api/accounts` - Chart of accounts
- **GET** `/api/journal-entries` - All journal entries  
- **GET** `/api/accounts-receivable` - Customer invoices
- **GET** `/api/accounts-payable` - Vendor bills
- **GET** `/api/wallets` - Customer/vendor credit balances
- **GET** `/api/general-ledger` - General ledger transactions
- **GET** `/api/financial-reports` - Financial statements

## 🏦 Chart of Accounts Structure

Our sample data includes a complete Chart of Accounts following standard accounting practices:

| Account Code | Account Name | Type | Subtype | Normal Balance | Description |
|-------------|--------------|------|---------|---------------|-------------|
| **ASSETS** |
| 1001 | Cash - Operating Account | Asset | Current Asset | Debit | Primary business checking account |
| 1200 | Accounts Receivable | Asset | Current Asset | Debit | Money owed by customers |
| 1300 | Inventory | Asset | Current Asset | Debit | Products held for sale |
| 1400 | Prepaid Expenses | Asset | Current Asset | Debit | Expenses paid in advance |
| 1500 | Equipment | Asset | Fixed Asset | Debit | Computer equipment, furniture |
| 1600 | Accumulated Depreciation | Asset | Fixed Asset | Credit | Contra-asset for depreciation |
| **LIABILITIES** |
| 2001 | Accounts Payable | Liability | Current Liability | Credit | Money owed to suppliers |
| 2100 | Accrued Expenses | Liability | Current Liability | Credit | Expenses incurred but not paid |
| 2200 | Sales Tax Payable | Liability | Current Liability | Credit | Sales tax due to government |
| 2500 | Loans Payable | Liability | Long-term Liability | Credit | Bank loans and debt |
| **EQUITY** |
| 3000 | Owner Equity | Equity | Capital | Credit | Owner's investment |
| 3100 | Retained Earnings | Equity | Retained Earnings | Credit | Accumulated profits |
| **REVENUE** |
| 4000 | Sales Revenue | Revenue | Product Sales | Credit | Revenue from product sales |
| 4100 | Shipping Revenue | Revenue | Shipping Income | Credit | Shipping charges to customers |
| 4900 | Sales Returns and Refunds | Revenue | Contra Revenue | Debit | Customer returns and refunds |
| **EXPENSES** |
| 5000 | Cost of Goods Sold | Expense | Cost of Sales | Debit | Direct cost of products sold |
| 6100 | Marketing and Advertising | Expense | Operating Expense | Debit | Marketing campaigns and ads |
| 6200 | Office Expenses | Expense | Operating Expense | Debit | Office supplies and utilities |
| 6300 | Shipping and Delivery | Expense | Operating Expense | Debit | Shipping costs and delivery |
| 6400 | Bank Fees and Charges | Expense | Operating Expense | Debit | Bank and payment processing fees |
| 6500 | Depreciation Expense | Expense | Operating Expense | Debit | Equipment depreciation |

---

## 📝 Journal Entry Examples

All transactions in our system follow double-entry bookkeeping where **Total Debits = Total Credits**.

### Example 1: Customer Sale ($159.00)

**Journal Entry #JE-2024-001** - Date: January 15, 2024
- Reference: Order #1001
- Description: Sale of merchandise to customer

| Account | Description | Debit | Credit |
|---------|-------------|-------|--------|
| Cash | Cash received from sale | $159.00 | |
| Sales Revenue | Sales revenue | | $140.00 |
| Sales Tax Payable | Sales tax collected | | $19.00 |
| **TOTALS** | | **$159.00** | **$159.00** |

### Example 2: Inventory Purchase ($2,500.00)

**Journal Entry #JE-2024-003** - Date: January 10, 2024
- Reference: PO-001
- Description: Purchase of inventory from vendor

| Account | Description | Debit | Credit |
|---------|-------------|-------|--------|
| Inventory | Inventory purchased on credit | $2,500.00 | |
| Accounts Payable | Amount owed to vendor | | $2,500.00 |
| **TOTALS** | | **$2,500.00** | **$2,500.00** |

### Example 3: Monthly Depreciation ($83.33)

**Journal Entry #JE-2024-007** - Date: January 31, 2024
- Reference: Monthly Depreciation
- Description: Monthly depreciation of equipment

| Account | Description | Debit | Credit |
|---------|-------------|-------|--------|
| Depreciation Expense | Monthly depreciation expense | $83.33 | |
| Accumulated Depreciation | Accumulated depreciation increase | | $83.33 |
| **TOTALS** | | **$83.33** | **$83.33** |

---

## 🧾 Accounts Receivable Management

Our comprehensive AR system includes customer invoice tracking and aging analysis:

### Customer Invoice Aging Report

| Invoice # | Customer | Invoice Date | Due Date | Total Amount | Paid Amount | Outstanding | Status | Days Overdue |
|-----------|----------|--------------|----------|--------------|-------------|-------------|--------|--------------|
| INV-2024-001 | Sample Customer | 2024-01-15 | 2024-02-14 | $159.00 | $159.00 | $0.00 | Paid | 0 |
| INV-2024-002 | Sample Customer | 2024-01-16 | 2024-02-15 | $275.50 | $0.00 | $275.50 | Pending | 0 |
| INV-2024-003 | Sample Customer | 2024-01-20 | 2024-02-19 | $425.75 | $200.00 | $225.75 | Partial | 0 |
| INV-2023-045 | Sample Customer | 2023-11-15 | 2023-12-15 | $890.25 | $0.00 | $890.25 | Overdue | 72 |
| INV-2023-050 | Sample Customer | 2023-10-20 | 2023-11-19 | $1,245.00 | $0.00 | $1,245.00 | Overdue | 98 |

### Aging Summary

| Age Range | Count | Total Outstanding |
|-----------|-------|------------------|
| 0-30 days | 2 | $501.25 |
| 31-60 days | 0 | $0.00 |
| 61-90 days | 1 | $890.25 |
| 90+ days | 1 | $1,245.00 |
| **TOTAL** | **4** | **$2,636.50** |

---

## 💳 Accounts Payable Management

Comprehensive vendor bill management with payment tracking:

### Vendor Bills Summary

| Bill # | Vendor | Bill Date | Due Date | Total Amount | Paid Amount | Outstanding | Status | Days Until Due |
|--------|--------|-----------|----------|--------------|-------------|-------------|--------|----------------|
| BILL-ABC-001 | ABC Supplier | 2024-01-10 | 2024-02-09 | $2,500.00 | $1,500.00 | $1,000.00 | Partial | 14 |
| BILL-XYZ-002 | XYZ Vendor | 2024-01-12 | 2024-02-11 | $1,750.00 | $0.00 | $1,750.00 | Pending | 16 |
| BILL-DEF-003 | DEF Corp | 2024-01-05 | 2024-02-04 | $3,200.50 | $3,200.50 | $0.00 | Paid | N/A |
| BILL-OLD-004 | Old Vendor | 2023-11-20 | 2023-12-20 | $5,600.00 | $0.00 | $5,600.00 | Overdue | -72 |

### Payment Terms Analysis

| Vendor | Payment Terms | Total Outstanding | Overdue Amount |
|--------|---------------|-------------------|----------------|
| ABC Supplier | Net 30 | $1,000.00 | $0.00 |
| XYZ Vendor | Net 30 | $1,750.00 | $0.00 |
| Old Vendor | Net 30 | $5,600.00 | $5,600.00 |
| **TOTAL** | | **$8,350.00** | **$5,600.00** |

---

## 💰 Wallets & Credits System

Multi-wallet support for customers and vendors with transaction tracking:

### Customer Wallets

| Customer | Wallet Type | Current Balance | Total Earned | Total Used | Currency | Expires |
|----------|-------------|-----------------|--------------|------------|----------|---------|
| Sample Customer | Store Credit | $125.50 | $200.00 | $74.50 | USD | 2024-12-31 |
| Sample Customer | Refund | $75.00 | $150.00 | $75.00 | USD | Never |

### Vendor Wallets

| Vendor | Wallet Type | Current Balance | Total Earned | Total Used | Currency |
|--------|-------------|-----------------|--------------|------------|----------|
| Sample Vendor | Vendor Credit | $2,500.00 | $5,000.00 | $2,500.00 | USD |

### Recent Wallet Transactions

| Date | Wallet Type | Transaction Type | Amount | Description | Reference |
|------|-------------|------------------|--------|-------------|-----------|
| 2024-01-25 | Store Credit | Credit | +$100.00 | Loyalty reward credit | loyalty-reward-001 |
| 2024-01-20 | Store Credit | Debit | -$50.00 | Store credit used for purchase | order-1003 |
| 2024-01-22 | Refund | Credit | +$75.00 | Refund for returned item | return-001 |
| 2024-01-15 | Vendor Credit | Credit | +$2,500.00 | Credit for returned inventory | credit-memo-001 |

---

## 📈 Financial Reports

### Profit & Loss Statement
**Period: January 2024**

| Account | Amount |
|---------|--------|
| **REVENUE** |
| Sales Revenue | $383.81 |
| Shipping Revenue | $25.00 |
| **Total Revenue** | **$408.81** |
| |
| **EXPENSES** |
| Cost of Goods Sold | $180.00 |
| Marketing and Advertising | $250.00 |
| Office Expenses | $120.00 |
| Shipping and Delivery | $45.00 |
| Bank Fees and Charges | $15.00 |
| Depreciation Expense | $83.33 |
| **Total Expenses** | **$693.33** |
| |
| **Net Income (Loss)** | **($284.52)** |

### Balance Sheet
**As of January 31, 2024**

| | Amount |
|---|--------|
| **ASSETS** |
| **Current Assets** |
| Cash | $(1,507.00) |
| Accounts Receivable | $116.50 |
| Inventory | $2,500.00 |
| Prepaid Expenses | $500.00 |
| Total Current Assets | $1,609.50 |
| |
| **Fixed Assets** |
| Equipment | $5,000.00 |
| Accumulated Depreciation | $(83.33) |
| Total Fixed Assets | $4,916.67 |
| |
| **TOTAL ASSETS** | **$6,526.17** |
| |
| **LIABILITIES** |
| **Current Liabilities** |
| Accounts Payable | $1,000.00 |
| Accrued Expenses | $250.00 |
| Sales Tax Payable | $50.69 |
| Total Current Liabilities | $1,300.69 |
| |
| **Long-term Liabilities** |
| Loans Payable | $15,000.00 |
| Total Long-term Liabilities | $15,000.00 |
| |
| **TOTAL LIABILITIES** | **$16,300.69** |
| |
| **EQUITY** |
| Owner Equity | $20,000.00 |
| Retained Earnings | $(29,774.52) |
| **TOTAL EQUITY** | **$(9,774.52)** |
| |
| **TOTAL LIABILITIES & EQUITY** | **$6,526.17** |

### Cash Flow Statement
**Period: January 2024**

| | Amount |
|---|--------|
| **Operating Activities** |
| Net Income | $(284.52) |
| Depreciation | $83.33 |
| Increase in Accounts Receivable | $(116.50) |
| Increase in Inventory | $(2,500.00) |
| Increase in Accounts Payable | $1,000.00 |
| **Net Cash from Operating Activities** | **$(1,817.69)** |
| |
| **Investing Activities** |
| Purchase of Equipment | $0.00 |
| **Net Cash from Investing Activities** | **$0.00** |
| |
| **Financing Activities** |
| Owner Investment | $0.00 |
| Loan Proceeds | $0.00 |
| **Net Cash from Financing Activities** | **$0.00** |
| |
| **Net Change in Cash** | **$(1,817.69)** |
| Beginning Cash Balance | $310.69 |
| **Ending Cash Balance** | **$(1,507.00)** |

---

## 🏪 Bank Reconciliation

### Automated Reconciliation Features
- **Statement Import**: Upload bank statements in CSV/Excel format
- **Transaction Matching**: Automated matching based on amount, date, and description
- **Manual Adjustments**: Easy interface for manual reconciliation entries
- **Discrepancy Reporting**: Detailed reports of unmatched transactions
- **Approval Workflow**: Multi-step approval process for reconciled statements

### Reconciliation Process
1. **Import Statement**: Upload bank statement file
2. **Auto-Match**: System matches transactions automatically
3. **Review Matches**: Verify and adjust matches as needed
4. **Manual Entry**: Add missing transactions or adjustments
5. **Finalize**: Complete reconciliation and generate report

---

## 🧾 Tax Management

### Tax Configuration
- **Multiple Tax Rates**: Support for different tax types and rates
- **Geographic Zones**: Tax rates by location/jurisdiction
- **Product Categories**: Different tax rates for different product types
- **Date Ranges**: Historical tax rate tracking with effective dates

### Tax Compliance Features
- **Automatic Calculation**: Real-time tax calculation on transactions
- **Tax Reports**: Detailed tax liability and payment reports
- **Audit Trail**: Complete history of tax calculations and adjustments
- **Export Capabilities**: Export data for tax filing purposes

---

## 🔐 Role-Based Access Control (RBAC)

### Permission Structure

| Role | Accounts | Journal Entries | Reports | Wallets | AP/AR | Bank Rec | Tax Mgmt |
|------|----------|----------------|---------|---------|-------|----------|----------|
| **SuperAdmin** | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access |
| **Admin** | Create/Edit/View | Create/Edit/View | View/Export | Manage All | Create/Edit/View | View/Edit | View/Edit |
| **Staff** | View Only | View Only | View Only | View Own | View Only | View Only | View Only |
| **Customer** | No Access | No Access | No Access | View Own | View Own Invoices | No Access | No Access |

### API Endpoints Security

All accounting endpoints are protected with role-based authentication:

```typescript
// Example: Journal Entry creation requires admin role
POST /api/accounting/journal-entries
Authorization: Bearer <token>
Required Roles: ['admin', 'superadmin']

// Example: View own customer invoices
GET /api/accounting/invoices/customer/:customerId
Authorization: Bearer <token>
Required: Customer owns the invoices OR admin/staff role
```

---

## 📊 Database Schema

### Key Relationships

```
accounts (Chart of Accounts)
├── journal_entry_lines (Account transactions)
├── general_ledger (Posted transactions)
├── account_balances (Period balances)
└── tax_rates (Tax configuration)

journal_entries (Transaction headers)
├── journal_entry_lines (Transaction details)
└── general_ledger (Posted entries)

customers
├── accounts_receivable (Customer invoices)
├── wallets (Customer credits)
└── bank_reconciliation_items (Reconciliation entries)

vendors
├── accounts_payable (Vendor bills)
└── wallets (Vendor credits)

fiscal_periods (Accounting periods)
├── account_balances (Period-end balances)
└── financial_reports (Generated reports)
```

### Data Integrity Rules

1. **Journal Entries**: Total debits must equal total credits
2. **General Ledger**: All entries must reference valid accounts and journal entries
3. **Account Balances**: Must be recalculated when transactions are posted
4. **Wallets**: Balance must equal (Total Earned - Total Used)
5. **AR/AP**: Outstanding amount must equal (Total Amount - Paid Amount)
6. **Bank Reconciliation**: All bank transactions must be matched or explained

---

## 🛠️ Using the Seed Data

### Development & Testing Setup

The accounting seed data (`/seed/accountsData.ts`) provides a complete dataset for development and testing:

#### 1. **Database Seeding**

```typescript
import { allAccountingData, insertAllAccountingData } from './seed/accountsData';
import { db } from './server/db';

// Seed all accounting data
await insertAllAccountingData(db);
```

#### 2. **What's Included**

- **22 Chart of Accounts entries** (Assets, Liabilities, Equity, Revenue, Expenses)
- **8 Journal Entries** with balanced debits/credits
- **17 Journal Entry Lines** maintaining double-entry rules
- **7 General Ledger postings** with running balances
- **5 Accounts Receivable records** (Paid, Pending, Partial, Overdue)
- **4 Accounts Payable records** (Paid, Pending, Partial, Overdue)
- **3 Wallets** (Customer store credit, Customer refund, Vendor credit)
- **4 Wallet Transactions** (Credits, debits, transfers)
- **4 Fiscal Periods** (Monthly, Quarterly, Yearly)
- **5 Account Balance snapshots** for reporting
- **Tax Rates** for different jurisdictions
- **Bank Reconciliation entries** for testing

#### 3. **Testing Scenarios**

The seed data enables testing of:

- **Standard Sales Process**: Order → Invoice → Payment → GL Posting
- **Purchase Process**: PO → Receipt → Invoice → Payment
- **Customer Credits**: Returns → Refunds → Store Credits
- **Vendor Credits**: Returns → Credit Memos → AP Credits
- **Financial Reporting**: P&L, Balance Sheet, Cash Flow generation
- **Aging Reports**: AR/AP aging analysis
- **Wallet Management**: Credit earning, usage, and transfers
- **Bank Reconciliation**: Statement import and matching
- **Tax Calculations**: Multi-rate tax scenarios

#### 4. **Role-Based Access Testing**

Test different user roles:

- **SuperAdmin**: Full access to all accounting functions
- **Admin**: Can create/modify accounting entries
- **Staff**: View-only access to reports and data
- **Customer**: Access only to their own invoices and wallet

#### 5. **Data Consistency**

All seed data maintains:
- **Double-entry integrity**: Every journal entry balances (debits = credits)
- **Referential integrity**: All foreign keys reference valid records
- **Business logic**: Realistic transaction flows and amounts
- **Date consistency**: Logical transaction sequencing
- **Tax compliance**: Proper tax calculations and tracking

---

## 🚀 Getting Started

1. **Install Dependencies**: Ensure all database and ORM packages are installed
2. **Run Migrations**: Apply the accounting schema to your database
3. **Seed Data**: Run the accounting seeder to populate sample data
4. **Test Access**: Verify role-based permissions are working
5. **Generate Reports**: Test financial report generation with sample data

```bash
# Apply schema changes
npm run db:push

# Seed accounting data
npm run seed:accounts

# Start development server
npm run dev
```

---

## 📚 Additional Resources

- **Accounting Standards**: Based on Generally Accepted Accounting Principles (GAAP)
- **Double-Entry Bookkeeping**: All transactions maintain debit/credit balance
- **Financial Reporting**: Standard business reports (P&L, Balance Sheet, Cash Flow)
- **Audit Trail**: Complete transaction history with user attribution
- **Data Export**: Support for CSV/Excel export of all reports
- **Integration Ready**: API endpoints for ERP and accounting software integration

---

*This documentation covers the complete accounting module implementation with realistic sample data for development and testing purposes. The system provides enterprise-grade accounting functionality suitable for small to medium-sized businesses.*
