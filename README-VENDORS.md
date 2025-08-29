
# 🏭 ShopifyApp Vendor Management Documentation

*Updated for Replit Environment - January 2025*

## Overview

The ShopifyApp Vendor Management system provides comprehensive tools for managing supplier relationships, purchase orders, vendor performance analytics, and procurement workflows. Built to optimize supplier relationships, reduce costs, and ensure reliable supply chain operations.

## 🚀 **Replit Ready Features**
- ✅ **Real-time Vendor Data**: Live vendor information with WebSocket updates
- ✅ **Interactive Dashboard**: Modern vendor management interface with shadcn/ui
- ✅ **API Integration**: Complete REST API with Swagger documentation
- ✅ **Sample Data**: Pre-populated vendor profiles and purchase orders
- ✅ **Workflow Automation**: Automated purchase order and approval processes

## 🎯 Key Features

### Vendor Profile Management
- **Complete Vendor Database**: Contact information, payment terms, and performance history
- **Vendor Categorization**: Organize vendors by type, importance, and spend level
- **Compliance Tracking**: Monitor certifications, licenses, and compliance status
- **Risk Assessment**: Evaluate vendor financial stability and reliability
- **Communication History**: Track all vendor interactions and negotiations

### Purchase Order Management
- **PO Creation & Approval**: Multi-level approval workflows
- **Order Tracking**: Real-time status updates from creation to delivery
- **Receiving & Inspection**: Track deliveries and quality control
- **Three-way Matching**: PO, receipt, and invoice reconciliation
- **Partial Receipts**: Handle split shipments and partial deliveries

### Vendor Performance Analytics
- **Performance Scorecards**: Track delivery, quality, and service metrics
- **Cost Analysis**: Monitor pricing trends and cost savings opportunities
- **Delivery Performance**: Track on-time delivery and lead times
- **Quality Metrics**: Defect rates and return statistics
- **Payment Analytics**: Track payment history and terms compliance

## 🚀 Quick Access in Replit

### Accessing Vendor Features
1. **Login**: Use `admin@shopifyapp.com` / `admin123` for full access
2. **Navigation**: Access vendor modules via sidebar:
   - **Vendor Management**: `/vendor-management` - Main vendor database
   - **Purchase Orders**: Create and manage purchase orders
   - **Vendor Analytics**: Performance tracking and insights

### API Endpoints
Complete vendor API documentation at `/api-docs`:
- **GET** `/api/vendors` - List all vendors with filtering
- **POST** `/api/vendors` - Create new vendor profile
- **PUT** `/api/vendors/{id}` - Update vendor information
- **GET** `/api/purchase-orders` - Purchase order management
- **GET** `/api/vendor-analytics` - Vendor performance metrics

## 🏢 Vendor Data Structure

### Core Vendor Fields

| Field | Type | Description | Required | Example |
|-------|------|-------------|----------|---------|
| `id` | UUID | Unique vendor identifier | Auto | `550e8400-e29b-...` |
| `name` | String | Vendor company name | Yes | `ABC Supplier Co.` |
| `email` | String | Primary contact email | Yes | `contact@abcsupplier.com` |
| `phone` | String | Primary phone number | No | `+1-555-0123` |
| `contactPerson` | String | Primary contact name | No | `John Smith` |
| `address` | Text | Complete business address | No | `123 Industrial Blvd...` |
| `paymentTerms` | String | Default payment terms | No | `Net 30` |
| `status` | Enum | Vendor status | Yes | `active`, `inactive` |
| `shopDomain` | String | Associated shop | Yes | `demo-store.myshopify.com` |

### Extended Vendor Profile

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `vendorType` | String | Type of vendor | `Manufacturer`, `Distributor` |
| `taxId` | String | Tax identification number | `12-3456789` |
| `creditRating` | String | Financial credit rating | `A+`, `B`, `C` |
| `leadTime` | Integer | Standard lead time (days) | `14` |
| `minimumOrder` | Decimal | Minimum order value | `500.00` |
| `currency` | String | Preferred currency | `USD` |
| `website` | String | Vendor website | `https://abcsupplier.com` |
| `socialMedia` | JSON | Social media links | `{linkedin: "...", twitter: "..."}` |

## 🛠️ Core Operations

### Creating Vendor Profiles

#### Via UI
1. Navigate to **Vendor Management** page
2. Click **"Add New Vendor"** button
3. Fill in vendor details:
   - Company name (required)
   - Contact email (required)
   - Contact person
   - Phone number
   - Business address
   - Payment terms
   - Vendor category
4. Click **"Save Vendor"**

#### Via API
```bash
curl -X POST http://0.0.0.0:5000/api/vendors \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ABC Supplier Co.",
    "email": "contact@abcsupplier.com",
    "phone": "+1-555-0123",
    "contactPerson": "John Smith",
    "address": "123 Industrial Blvd, City, State 12345",
    "paymentTerms": "Net 30",
    "vendorType": "Manufacturer",
    "shopDomain": "demo-store.myshopify.com"
  }'
```

### Purchase Order Management

#### Creating Purchase Orders
```typescript
// Create new purchase order
await fetch('/api/purchase-orders', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    vendorId: '123',
    orderDate: '2024-01-25',
    expectedDelivery: '2024-02-08',
    items: [
      {
        productId: 'product-456',
        quantity: 100,
        unitCost: 25.00,
        totalCost: 2500.00
      }
    ],
    totalAmount: 2500.00,
    paymentTerms: 'Net 30',
    deliveryAddress: 'Warehouse A, 456 Storage Lane',
    notes: 'Rush order for restock'
  })
});
```

#### Purchase Order Workflow
```typescript
// PO Status Progression
const poStatuses = {
  'draft': 'Being prepared',
  'pending_approval': 'Awaiting approval',
  'approved': 'Approved, ready to send',
  'sent': 'Sent to vendor',
  'confirmed': 'Confirmed by vendor',
  'partially_received': 'Partial delivery received',
  'received': 'Fully received',
  'invoiced': 'Invoice received',
  'paid': 'Payment completed',
  'cancelled': 'Order cancelled'
};
```

#### Receiving Shipments
```typescript
// Record receipt of goods
await fetch('/api/purchase-orders/123/receive', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    receivedDate: '2024-02-08',
    receivedBy: 'warehouse-staff-001',
    items: [
      {
        productId: 'product-456',
        quantityOrdered: 100,
        quantityReceived: 95,
        qualityStatus: 'good',
        notes: '5 units damaged in transit'
      }
    ],
    deliveryNotes: 'Driver arrived on time, good packaging'
  })
});
```

## 📊 Vendor Performance Analytics

### Performance Scorecard

#### Overall Vendor Ratings
| Vendor | Overall Score | Delivery | Quality | Price | Service |
|--------|---------------|----------|---------|-------|---------|
| ABC Supplier | 92% | 95% | 88% | 90% | 95% |
| XYZ Manufacturing | 85% | 82% | 90% | 88% | 85% |
| DEF Distributors | 78% | 75% | 85% | 80% | 75% |
| GHI Components | 88% | 90% | 85% | 85% | 92% |

#### Performance Metrics Details
```json
{
  "vendorId": "123",
  "vendorName": "ABC Supplier",
  "performanceMetrics": {
    "delivery": {
      "onTimeDeliveryRate": 95.2,
      "averageLeadTime": 12.5,
      "deliveryVariance": 1.2,
      "totalDeliveries": 48
    },
    "quality": {
      "defectRate": 2.1,
      "returnRate": 1.5,
      "qualityScore": 88.5,
      "totalOrders": 52
    },
    "pricing": {
      "priceCompetitiveness": 90.0,
      "costSavings": 12500.00,
      "priceStability": 85.5
    },
    "service": {
      "responseTime": 4.2,
      "issueResolutionRate": 98.5,
      "customerSatisfaction": 95.0
    }
  }
}
```

### Spend Analysis

#### Vendor Spend Distribution
```json
{
  "totalSpend": 125000.00,
  "vendorSpendBreakdown": [
    {
      "vendorId": "123",
      "vendorName": "ABC Supplier",
      "spend": 45000.00,
      "percentage": 36.0,
      "orderCount": 25,
      "avgOrderValue": 1800.00
    },
    {
      "vendorId": "456",
      "vendorName": "XYZ Manufacturing",
      "spend": 35000.00,
      "percentage": 28.0,
      "orderCount": 18,
      "avgOrderValue": 1944.44
    }
  ]
}
```

#### Cost Savings Tracking
```json
{
  "costSavingsAnalysis": {
    "totalSavings": 15750.00,
    "savingsSources": {
      "negotiatedDiscounts": 8500.00,
      "volumeDiscounts": 4250.00,
      "earlyPaymentDiscounts": 2000.00,
      "contractOptimization": 1000.00
    },
    "savingsPercentage": 11.2
  }
}
```

## 🔄 Purchase Order Workflow

### Approval Process

#### Multi-level Approval Rules
```typescript
// Configure approval thresholds
const approvalRules = {
  'under_1000': ['manager'],
  '1000_to_5000': ['manager', 'director'],
  '5000_to_25000': ['manager', 'director', 'vp'],
  'over_25000': ['manager', 'director', 'vp', 'ceo']
};

// Process approval request
await fetch('/api/purchase-orders/123/request-approval', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    amount: 15000.00,
    requestedBy: 'purchasing-manager',
    urgency: 'normal',
    justification: 'Quarterly inventory restock'
  })
});
```

#### Approval Tracking
| PO Number | Amount | Requested By | Current Approver | Status | Days Pending |
|-----------|--------|--------------|------------------|--------|--------------|
| PO-2024-001 | $15,000 | J. Smith | Director | Pending | 2 |
| PO-2024-002 | $3,500 | M. Johnson | - | Approved | 0 |
| PO-2024-003 | $45,000 | P. Wilson | VP Finance | Pending | 5 |

### Vendor Communication

#### Automated Communications
```typescript
// Send PO to vendor
await fetch('/api/purchase-orders/123/send', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    sendMethod: 'email',
    additionalNotes: 'Please confirm receipt and expected delivery date',
    attachments: ['po_terms.pdf', 'shipping_instructions.pdf']
  })
});

// Request delivery update
await fetch('/api/vendors/123/request-update', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    poNumber: 'PO-2024-001',
    requestType: 'delivery_update',
    message: 'Please provide updated delivery estimate'
  })
});
```

## 🏪 Vendor Categories & Classification

### Vendor Types

#### Primary Categories
- **Manufacturers**: Direct product manufacturers
- **Distributors**: Product distribution partners
- **Service Providers**: Professional services vendors
- **Raw Materials**: Material suppliers
- **Packaging**: Packaging and shipping suppliers
- **Technology**: Software and hardware vendors
- **Marketing**: Advertising and marketing services

#### Strategic Classification
```json
{
  "vendorClassification": {
    "strategic": {
      "description": "Critical vendors with high spend and complexity",
      "managementLevel": "executive",
      "reviewFrequency": "quarterly",
      "contractTerms": "long-term"
    },
    "important": {
      "description": "Significant vendors with moderate complexity",
      "managementLevel": "senior_manager",
      "reviewFrequency": "semi-annual",
      "contractTerms": "annual"
    },
    "standard": {
      "description": "Regular vendors with standard requirements",
      "managementLevel": "manager",
      "reviewFrequency": "annual",
      "contractTerms": "standard"
    },
    "transactional": {
      "description": "Low-complexity, occasional vendors",
      "managementLevel": "staff",
      "reviewFrequency": "as_needed",
      "contractTerms": "spot_purchase"
    }
  }
}
```

## 💰 Financial Management

### Payment Terms Management

#### Common Payment Terms
| Terms | Description | Discount | Net Days |
|-------|-------------|----------|----------|
| Net 15 | Payment due in 15 days | 0% | 15 |
| Net 30 | Payment due in 30 days | 0% | 30 |
| 2/10 Net 30 | 2% discount if paid in 10 days | 2% | 10/30 |
| 1/15 Net 45 | 1% discount if paid in 15 days | 1% | 15/45 |
| COD | Cash on delivery | 0% | 0 |

#### Payment Processing
```typescript
// Process vendor payment
await fetch('/api/vendor-payments', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({
    vendorId: '123',
    invoiceId: 'INV-2024-001',
    paymentAmount: 2450.00,
    discountTaken: 50.00,
    paymentDate: '2024-01-25',
    paymentMethod: 'ACH',
    reference: 'Payment for PO-2024-001'
  })
});
```

### Cost Management

#### Price History Tracking
```json
{
  "productId": "product-123",
  "priceHistory": [
    {
      "date": "2024-01-01",
      "vendorId": "vendor-abc",
      "price": 25.00,
      "currency": "USD",
      "leadTime": 14,
      "minimumQty": 50
    },
    {
      "date": "2023-10-01",
      "vendorId": "vendor-abc",
      "price": 24.00,
      "currency": "USD",
      "priceChange": "+4.2%",
      "reason": "Material cost increase"
    }
  ]
}
```

## 🔔 Vendor Alerts & Notifications

### Automated Alerts

#### Performance Alerts
- **Late Delivery Warning**: When shipments are overdue
- **Quality Issues**: When defect rates exceed thresholds
- **Price Changes**: When vendor pricing changes significantly
- **Contract Renewal**: When contracts are approaching expiration
- **Payment Due**: When vendor invoices are due for payment

#### System Notifications
```typescript
// Configure vendor alerts
const alertRules = {
  lateDelivery: {
    threshold: '2_days_overdue',
    recipients: ['purchasing_manager', 'warehouse_manager'],
    escalation: '5_days_to_director'
  },
  qualityIssues: {
    threshold: '5_percent_defect_rate',
    recipients: ['quality_manager', 'purchasing_manager'],
    escalation: 'immediate_to_supplier_quality'
  },
  paymentDue: {
    threshold: '3_days_before_due',
    recipients: ['accounts_payable', 'finance_manager'],
    escalation: 'day_of_due_date'
  }
};
```

## 📊 Vendor Reporting

### Standard Reports

#### Vendor Performance Report
```json
{
  "reportPeriod": "Q1 2024",
  "totalVendors": 25,
  "activeVendors": 22,
  "topPerformers": [
    {
      "vendorName": "ABC Supplier",
      "overallScore": 92,
      "deliveryScore": 95,
      "qualityScore": 88,
      "totalSpend": 45000
    }
  ],
  "improvementNeeded": [
    {
      "vendorName": "XYZ Corp",
      "overallScore": 65,
      "issues": ["Late deliveries", "Quality problems"],
      "actionPlan": "Performance improvement meeting scheduled"
    }
  ]
}
```

#### Purchase Order Summary
| Period | POs Created | POs Completed | Total Value | Avg Lead Time |
|--------|-------------|---------------|-------------|---------------|
| Jan 2024 | 15 | 12 | $125,000 | 16 days |
| Dec 2023 | 18 | 16 | $145,000 | 18 days |
| Nov 2023 | 12 | 11 | $95,000 | 15 days |

### Custom Analytics

#### Vendor Risk Assessment
```json
{
  "vendorRiskProfile": {
    "financialStability": {
      "creditRating": "A+",
      "paymentHistory": "Excellent",
      "riskLevel": "Low"
    },
    "operationalRisk": {
      "singleSource": false,
      "geographicRisk": "Low",
      "capacityRisk": "Medium"
    },
    "complianceRisk": {
      "certifications": "Current",
      "auditResults": "Passed",
      "insuranceCoverage": "Adequate"
    },
    "overallRiskRating": "Low-Medium"
  }
}
```

## 🤝 Strategic Vendor Relationships

### Vendor Development Programs

#### Supplier Development Initiatives
- **Capability Building**: Help vendors improve processes and quality
- **Technology Integration**: Implement EDI and API integrations
- **Sustainability Programs**: Environmental and social responsibility
- **Innovation Partnerships**: Collaborate on new product development
- **Training Programs**: Provide vendor staff training and certification

#### Partnership Levels
```json
{
  "partnershipTiers": {
    "preferred": {
      "benefits": [
        "Priority allocation during shortages",
        "Extended payment terms",
        "Joint marketing opportunities",
        "Early access to new products"
      ],
      "requirements": [
        "95%+ on-time delivery",
        "Quality score above 90%",
        "Competitive pricing",
        "Continuous improvement participation"
      ]
    },
    "certified": {
      "benefits": [
        "Reduced inspection requirements",
        "Simplified approval process",
        "Volume commitments"
      ],
      "requirements": [
        "ISO certification",
        "Quality management system",
        "Regular audits passed"
      ]
    }
  }
}
```

## 🔐 Security & Compliance

### Vendor Onboarding

#### Due Diligence Process
1. **Financial Verification**: Credit checks and financial statements
2. **Legal Compliance**: Business licenses and registrations
3. **Insurance Verification**: Liability and coverage confirmation
4. **Reference Checks**: Previous customer references
5. **Site Visits**: Facility inspections for critical vendors
6. **Contract Negotiation**: Terms, conditions, and SLAs

#### Compliance Tracking
```json
{
  "complianceChecklist": {
    "businessLicense": {
      "status": "current",
      "expiryDate": "2024-12-31",
      "documentId": "BL-2024-ABC"
    },
    "insurance": {
      "generalLiability": "current",
      "productLiability": "current",
      "workersComp": "current",
      "minimumCoverage": 1000000
    },
    "certifications": {
      "iso9001": "current",
      "iso14001": "pending",
      "industrySpecific": "required"
    }
  }
}
```

## 📱 Mobile Vendor Management

### Mobile App Features
- **Vendor Directory**: Quick access to vendor contacts
- **PO Approval**: Approve purchase orders on mobile
- **Delivery Tracking**: Real-time shipment updates
- **Performance Dashboards**: Key metrics on mobile
- **Communication Tools**: Call, email, message vendors directly

### Field Operations
- **Receipt Confirmation**: Confirm deliveries at receiving dock
- **Quality Inspection**: Record quality issues on mobile
- **Photo Documentation**: Capture delivery and quality photos
- **Barcode Scanning**: Scan incoming products for verification

---

*This vendor management documentation provides comprehensive coverage of all supplier relationship and procurement features in the ShopifyApp system. The system is optimized for the Replit development environment while maintaining production-ready standards.*

**Built for strategic supplier relationships**

*ShopifyApp Vendor Management - Partnerships that drive success*
