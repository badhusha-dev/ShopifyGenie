-- Dashboard Service Seed Data
-- Inserts reasonable dummy data for testing and demonstration

-- Insert historical metrics for the past 30 days
INSERT INTO dashboard_metrics (
    date,
    total_sales,
    total_revenue,
    total_profit,
    low_stock_count,
    total_items,
    new_customers,
    active_customers,
    churn_rate,
    cash_flow,
    accounts_receivable,
    accounts_payable
) VALUES
    -- Day 1 (30 days ago)
    (CURRENT_DATE - INTERVAL '30 days', 98000.00, 115000.00, 38000.00, 18, 320, 22, 1420, 2.5, 72000.00, 58000.00, 31000.00),
    -- Day 2
    (CURRENT_DATE - INTERVAL '29 days', 102000.00, 118000.00, 40000.00, 17, 325, 25, 1435, 2.4, 75000.00, 60000.00, 32000.00),
    -- Day 3
    (CURRENT_DATE - INTERVAL '28 days', 105000.00, 122000.00, 42000.00, 16, 328, 20, 1445, 2.3, 78000.00, 62000.00, 33000.00),
    -- Day 4
    (CURRENT_DATE - INTERVAL '27 days', 110000.00, 128000.00, 45000.00, 15, 330, 28, 1460, 2.2, 82000.00, 64000.00, 34000.00),
    -- Day 5
    (CURRENT_DATE - INTERVAL '26 days', 108000.00, 125000.00, 43000.00, 14, 332, 24, 1472, 2.1, 80000.00, 63000.00, 33500.00),
    -- Day 6
    (CURRENT_DATE - INTERVAL '25 days', 112000.00, 130000.00, 46000.00, 13, 335, 30, 1490, 2.0, 85000.00, 66000.00, 35000.00),
    -- Day 7
    (CURRENT_DATE - INTERVAL '24 days', 115000.00, 133000.00, 47000.00, 12, 338, 26, 1505, 1.9, 87000.00, 68000.00, 35500.00),
    -- Day 8
    (CURRENT_DATE - INTERVAL '23 days', 118000.00, 136000.00, 48000.00, 11, 340, 32, 1525, 1.8, 90000.00, 70000.00, 36000.00),
    -- Day 9
    (CURRENT_DATE - INTERVAL '22 days', 120000.00, 138000.00, 49000.00, 10, 342, 28, 1540, 1.7, 92000.00, 71000.00, 36500.00),
    -- Day 10
    (CURRENT_DATE - INTERVAL '21 days', 122000.00, 140000.00, 50000.00, 9, 345, 35, 1560, 1.6, 95000.00, 73000.00, 37000.00),
    -- Day 11
    (CURRENT_DATE - INTERVAL '20 days', 119000.00, 137000.00, 48500.00, 10, 343, 27, 1575, 1.7, 93000.00, 72000.00, 36800.00),
    -- Day 12
    (CURRENT_DATE - INTERVAL '19 days', 125000.00, 142000.00, 51000.00, 8, 348, 33, 1595, 1.5, 97000.00, 75000.00, 38000.00),
    -- Day 13
    (CURRENT_DATE - INTERVAL '18 days', 128000.00, 145000.00, 52000.00, 7, 350, 29, 1610, 1.4, 99000.00, 76000.00, 38500.00),
    -- Day 14
    (CURRENT_DATE - INTERVAL '17 days', 130000.00, 148000.00, 53000.00, 6, 352, 38, 1635, 1.3, 102000.00, 78000.00, 39000.00),
    -- Day 15
    (CURRENT_DATE - INTERVAL '16 days', 132000.00, 150000.00, 54000.00, 5, 355, 31, 1650, 1.2, 104000.00, 80000.00, 39500.00),
    -- Day 16
    (CURRENT_DATE - INTERVAL '15 days', 135000.00, 153000.00, 55000.00, 4, 358, 36, 1672, 1.1, 107000.00, 82000.00, 40000.00),
    -- Day 17
    (CURRENT_DATE - INTERVAL '14 days', 133000.00, 151000.00, 54500.00, 5, 356, 32, 1690, 1.2, 105000.00, 81000.00, 39800.00),
    -- Day 18
    (CURRENT_DATE - INTERVAL '13 days', 138000.00, 156000.00, 56000.00, 3, 360, 40, 1715, 1.0, 110000.00, 84000.00, 41000.00),
    -- Day 19
    (CURRENT_DATE - INTERVAL '12 days', 140000.00, 158000.00, 57000.00, 2, 362, 34, 1735, 0.9, 112000.00, 86000.00, 41500.00),
    -- Day 20
    (CURRENT_DATE - INTERVAL '11 days', 142000.00, 160000.00, 58000.00, 2, 365, 42, 1760, 0.8, 115000.00, 88000.00, 42000.00),
    -- Day 21
    (CURRENT_DATE - INTERVAL '10 days', 145000.00, 163000.00, 59000.00, 1, 368, 37, 1782, 0.7, 118000.00, 90000.00, 42500.00),
    -- Day 22
    (CURRENT_DATE - INTERVAL '9 days', 143000.00, 161000.00, 58500.00, 2, 366, 35, 1800, 0.8, 116000.00, 89000.00, 42200.00),
    -- Day 23
    (CURRENT_DATE - INTERVAL '8 days', 148000.00, 166000.00, 60000.00, 1, 370, 45, 1830, 0.6, 121000.00, 92000.00, 43000.00),
    -- Day 24
    (CURRENT_DATE - INTERVAL '7 days', 150000.00, 168000.00, 61000.00, 0, 372, 38, 1852, 0.5, 123000.00, 94000.00, 43500.00),
    -- Day 25
    (CURRENT_DATE - INTERVAL '6 days', 152000.00, 170000.00, 62000.00, 1, 375, 48, 1885, 0.4, 126000.00, 96000.00, 44000.00),
    -- Day 26
    (CURRENT_DATE - INTERVAL '5 days', 155000.00, 173000.00, 63000.00, 0, 378, 41, 1910, 0.3, 129000.00, 98000.00, 44500.00),
    -- Day 27
    (CURRENT_DATE - INTERVAL '4 days', 153000.00, 171000.00, 62500.00, 1, 376, 39, 1932, 0.4, 127000.00, 97000.00, 44200.00),
    -- Day 28
    (CURRENT_DATE - INTERVAL '3 days', 158000.00, 176000.00, 64000.00, 0, 380, 52, 1970, 0.2, 132000.00, 100000.00, 45000.00),
    -- Day 29
    (CURRENT_DATE - INTERVAL '2 days', 160000.00, 178000.00, 65000.00, 0, 382, 44, 1998, 0.1, 135000.00, 102000.00, 45500.00),
    -- Day 30 (Yesterday)
    (CURRENT_DATE - INTERVAL '1 day', 162000.00, 180000.00, 66000.00, 0, 385, 50, 2032, 0.1, 138000.00, 104000.00, 46000.00)
ON CONFLICT (date) DO NOTHING;

-- Insert sample realtime events to demonstrate event processing
INSERT INTO realtime_events (event_type, event_source, event_data, processed_at) VALUES
    ('sales.completed', 'sales-service', '{"orderId": "ORD-2001", "amount": 1250.00, "revenue": 1450.00, "customerId": "CUST-5001"}', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
    ('sales.completed', 'sales-service', '{"orderId": "ORD-2002", "amount": 850.00, "revenue": 980.00, "customerId": "CUST-5002"}', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    ('inventory.updated', 'inventory-service', '{"productId": "PROD-301", "lowStock": 5, "totalItems": 342}', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    ('customer.registered', 'customer-service', '{"customerId": "CUST-5003", "email": "john.doe@example.com", "name": "John Doe"}', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('transaction.recorded', 'accounting-service', '{"transactionId": "TXN-8001", "type": "payment", "amount": 2500.00, "cashFlow": 89000.00}', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('sales.completed', 'sales-service', '{"orderId": "ORD-2003", "amount": 2100.00, "revenue": 2400.00, "customerId": "CUST-5004"}', CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('inventory.updated', 'inventory-service', '{"productId": "PROD-302", "lowStock": 3, "totalItems": 340}', CURRENT_TIMESTAMP - INTERVAL '15 minutes'),
    ('customer.registered', 'customer-service', '{"customerId": "CUST-5005", "email": "jane.smith@example.com", "name": "Jane Smith"}', CURRENT_TIMESTAMP - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;
