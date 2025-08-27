
-- V3__Accounting_Module.sql
-- Comprehensive accounting module

-- Chart of Accounts
CREATE TABLE accounts (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code TEXT NOT NULL UNIQUE,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_subtype TEXT,
    parent_account_id VARCHAR,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    normal_balance TEXT NOT NULL,
    shop_domain TEXT NOT NULL,
    created_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_number TEXT NOT NULL UNIQUE,
    transaction_date TIMESTAMP NOT NULL,
    reference TEXT,
    description TEXT NOT NULL,
    total_debit DECIMAL(12, 2) NOT NULL,
    total_credit DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    shop_domain TEXT NOT NULL,
    created_by VARCHAR REFERENCES users(id),
    posted_by VARCHAR REFERENCES users(id),
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Journal Entry Lines
CREATE TABLE journal_entry_lines (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id VARCHAR REFERENCES journal_entries(id),
    account_id VARCHAR REFERENCES accounts(id),
    description TEXT,
    debit_amount DECIMAL(12, 2) DEFAULT '0',
    credit_amount DECIMAL(12, 2) DEFAULT '0',
    reference TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- General Ledger
CREATE TABLE general_ledger (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR REFERENCES accounts(id),
    journal_entry_id VARCHAR REFERENCES journal_entries(id),
    journal_entry_line_id VARCHAR REFERENCES journal_entry_lines(id),
    transaction_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    debit_amount DECIMAL(12, 2) DEFAULT '0',
    credit_amount DECIMAL(12, 2) DEFAULT '0',
    running_balance DECIMAL(12, 2),
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Accounts Receivable
CREATE TABLE accounts_receivable (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR REFERENCES customers(id),
    order_id VARCHAR REFERENCES orders(id),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT '0',
    outstanding_amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_terms INTEGER DEFAULT 30,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Accounts Payable
CREATE TABLE accounts_payable (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id VARCHAR REFERENCES vendors(id),
    purchase_order_id VARCHAR REFERENCES purchase_orders(id),
    bill_number TEXT NOT NULL,
    bill_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT '0',
    outstanding_amount DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_terms INTEGER DEFAULT 30,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallets for Credits & Refunds
CREATE TABLE wallets (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id VARCHAR NOT NULL,
    wallet_type TEXT NOT NULL,
    current_balance DECIMAL(12, 2) DEFAULT '0',
    total_earned DECIMAL(12, 2) DEFAULT '0',
    total_used DECIMAL(12, 2) DEFAULT '0',
    currency TEXT DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id VARCHAR REFERENCES wallets(id),
    transaction_type TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    reference_type TEXT,
    previous_balance DECIMAL(12, 2),
    new_balance DECIMAL(12, 2),
    performed_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fiscal Periods
CREATE TABLE fiscal_periods (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    period_name TEXT NOT NULL,
    period_type TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_closed BOOLEAN DEFAULT FALSE,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Account Balances
CREATE TABLE account_balances (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR REFERENCES accounts(id),
    fiscal_period_id VARCHAR REFERENCES fiscal_periods(id),
    beginning_balance DECIMAL(12, 2) DEFAULT '0',
    total_debits DECIMAL(12, 2) DEFAULT '0',
    total_credits DECIMAL(12, 2) DEFAULT '0',
    ending_balance DECIMAL(12, 2) DEFAULT '0',
    last_calculated TIMESTAMP DEFAULT NOW(),
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
