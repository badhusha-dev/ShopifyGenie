
-- V4__Enhanced_Features.sql
-- System enhancements and additional features

-- Audit Logs
CREATE TABLE audit_logs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE system_settings (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    category TEXT DEFAULT 'general',
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Integrations
CREATE TABLE integrations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    config TEXT,
    credentials TEXT,
    webhook_url TEXT,
    last_sync_at TIMESTAMP,
    sync_status TEXT DEFAULT 'idle',
    error_log TEXT,
    created_by VARCHAR REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax Rates
CREATE TABLE tax_rates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rate DECIMAL(5, 4) NOT NULL,
    region TEXT,
    account_id VARCHAR REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT TRUE,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tax Transactions
CREATE TABLE tax_transactions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_rate_id VARCHAR REFERENCES tax_rates(id),
    source_id VARCHAR NOT NULL,
    source_type TEXT NOT NULL,
    taxable_amount DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    journal_entry_id VARCHAR REFERENCES journal_entries(id),
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bank Statements
CREATE TABLE bank_statements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id VARCHAR REFERENCES accounts(id),
    statement_date TIMESTAMP NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    balance DECIMAL(12, 2),
    reference TEXT,
    transaction_id TEXT,
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_with VARCHAR,
    upload_batch VARCHAR,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bank Reconciliations
CREATE TABLE bank_reconciliations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_account_id VARCHAR REFERENCES accounts(id),
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    bank_balance DECIMAL(12, 2) NOT NULL,
    book_balance DECIMAL(12, 2) NOT NULL,
    adjustments DECIMAL(12, 2) DEFAULT '0',
    reconciled_balance DECIMAL(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    notes TEXT,
    reconciled_by VARCHAR REFERENCES users(id),
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(transaction_date);
CREATE INDEX idx_general_ledger_account_date ON general_ledger(account_id, transaction_date);
CREATE INDEX idx_accounts_receivable_status ON accounts_receivable(status);
CREATE INDEX idx_accounts_payable_status ON accounts_payable(status);
