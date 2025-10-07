-- Dashboard Service Initial Schema
-- Creates tables for dashboard metrics and realtime events

-- Dashboard Metrics Table
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_sales DECIMAL(10, 2) DEFAULT 0.00,
    total_revenue DECIMAL(10, 2) DEFAULT 0.00,
    total_profit DECIMAL(10, 2) DEFAULT 0.00,
    low_stock_count INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    active_customers INTEGER DEFAULT 0,
    churn_rate DECIMAL(5, 2) DEFAULT 0.00,
    cash_flow DECIMAL(10, 2) DEFAULT 0.00,
    accounts_receivable DECIMAL(10, 2) DEFAULT 0.00,
    accounts_payable DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Realtime Events Table
CREATE TABLE IF NOT EXISTS realtime_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    event_source VARCHAR(50) NOT NULL,
    event_data JSONB NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_date ON dashboard_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_realtime_events_type ON realtime_events(event_type);
CREATE INDEX IF NOT EXISTS idx_realtime_events_source ON realtime_events(event_source);
CREATE INDEX IF NOT EXISTS idx_realtime_events_processed ON realtime_events(processed_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_dashboard_metrics_updated_at BEFORE UPDATE ON dashboard_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realtime_events_updated_at BEFORE UPDATE ON realtime_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
