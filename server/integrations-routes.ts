import express from 'express';
import { auditMiddleware, requirePermission, requireRole } from './middleware';
import crypto from 'crypto';

const router = express.Router();

// Mock integrations store - in real implementation, use database
const integrations = new Map([
  ['stripe', {
    id: 'stripe',
    name: 'Stripe',
    type: 'payment',
    isEnabled: false,
    config: JSON.stringify({
      publishableKey: '',
      webhookSecret: '',
      currency: 'usd',
      captureMethod: 'automatic'
    }),
    credentials: '', // Encrypted API key
    webhookUrl: '/api/integrations/stripe/webhook',
    lastSyncAt: null,
    syncStatus: 'idle',
    errorLog: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['sendgrid', {
    id: 'sendgrid',
    name: 'SendGrid',
    type: 'email',
    isEnabled: false,
    config: JSON.stringify({
      fromEmail: '',
      fromName: '',
      templateIds: {
        welcome: '',
        orderConfirmation: '',
        loyaltyUpdate: '',
        passwordReset: ''
      }
    }),
    credentials: '', // Encrypted API key
    webhookUrl: '/api/integrations/sendgrid/webhook',
    lastSyncAt: null,
    syncStatus: 'idle',
    errorLog: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['twilio', {
    id: 'twilio',
    name: 'Twilio',
    type: 'sms',
    isEnabled: false,
    config: JSON.stringify({
      fromNumber: '',
      enableOrderNotifications: true,
      enableLoyaltyNotifications: true,
      enableLowStockAlerts: false
    }),
    credentials: '', // Encrypted Account SID and Auth Token
    webhookUrl: '/api/integrations/twilio/webhook',
    lastSyncAt: null,
    syncStatus: 'idle',
    errorLog: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  ['quickbooks', {
    id: 'quickbooks',
    name: 'QuickBooks',
    type: 'accounting',
    isEnabled: false,
    config: JSON.stringify({
      companyId: '',
      baseUrl: 'https://sandbox-quickbooks.api.intuit.com',
      syncFrequency: 'daily',
      autoCreateCustomers: true,
      autoCreateProducts: true
    }),
    credentials: '', // Encrypted OAuth tokens
    webhookUrl: '/api/integrations/quickbooks/webhook',
    lastSyncAt: null,
    syncStatus: 'idle',
    errorLog: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }]
]);

// Get all integrations
router.get('/', requirePermission('integrations:view'), async (req, res) => {
  try {
    const integrationsArray = Array.from(integrations.values()).map(integration => ({
      ...integration,
      credentials: integration.credentials ? '***encrypted***' : null // Don't expose credentials
    }));

    res.json(integrationsArray);
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get specific integration
router.get('/:name', requirePermission('integrations:view'), async (req, res) => {
  try {
    const { name } = req.params;
    const integration = integrations.get(name);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({
      ...integration,
      credentials: integration.credentials ? '***encrypted***' : null
    });
  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Update integration configuration
router.put('/:name', 
  requirePermission('integrations:edit'),
  auditMiddleware('integrations', 'update'),
  async (req, res) => {
    try {
      const { name } = req.params;
      const { config, credentials, isEnabled } = req.body;
      
      const integration = integrations.get(name);
      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const oldValues = { ...integration };

      // Update integration
      if (config !== undefined) {
        integration.config = JSON.stringify(config);
      }
      
      if (credentials !== undefined && credentials !== '***encrypted***') {
        // In real implementation, encrypt the credentials
        integration.credentials = encryptCredentials(credentials);
      }
      
      if (isEnabled !== undefined) {
        integration.isEnabled = isEnabled;
      }

      integration.updatedAt = new Date();
      integrations.set(name, integration);

      req.auditData = {
        resourceId: name,
        oldValues,
        newValues: {
          config: config ? JSON.parse(integration.config) : undefined,
          isEnabled,
          hasCredentials: !!integration.credentials
        }
      };

      res.json({
        ...integration,
        credentials: integration.credentials ? '***encrypted***' : null,
        message: 'Integration updated successfully'
      });
    } catch (error) {
      console.error('Update integration error:', error);
      res.status(500).json({ error: 'Failed to update integration' });
    }
  }
);

// Test integration connection
router.post('/:name/test', requirePermission('integrations:edit'), async (req, res) => {
  try {
    const { name } = req.params;
    const integration = integrations.get(name);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    if (!integration.isEnabled) {
      return res.status(400).json({ error: 'Integration is not enabled' });
    }

    // Mock test results - in real implementation, test actual connections
    const testResults = await testIntegrationConnection(name, integration);

    res.json(testResults);
  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

// Stripe webhook handler
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In real implementation, verify webhook signature
    const event = req.body;
    
    console.log('Stripe webhook received:', event.type);
    
    // Handle different Stripe events
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        break;
      case 'payment_intent.payment_failed':
        // Handle failed payment
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// SendGrid webhook handler
router.post('/sendgrid/webhook', async (req, res) => {
  try {
    const events = req.body;
    
    console.log('SendGrid webhook received:', events.length, 'events');
    
    // Process email events (delivered, opened, clicked, etc.)
    for (const event of events) {
      console.log(`Email event: ${event.event} for ${event.email}`);
      // Update email status in database
    }

    res.json({ received: true });
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Twilio webhook handler
router.post('/twilio/webhook', async (req, res) => {
  try {
    const { MessageStatus, To, MessageSid } = req.body;
    
    console.log('Twilio webhook received:', MessageStatus, 'for', To);
    
    // Update SMS status in database
    
    res.json({ received: true });
  } catch (error) {
    console.error('Twilio webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// QuickBooks webhook handler
router.post('/quickbooks/webhook', async (req, res) => {
  try {
    const payload = req.body;
    
    console.log('QuickBooks webhook received:', payload);
    
    // Process QuickBooks data changes
    
    res.json({ received: true });
  } catch (error) {
    console.error('QuickBooks webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
function encryptCredentials(credentials: any): string {
  // In real implementation, use proper encryption
  const key = process.env.ENCRYPTION_KEY || 'fallback-encryption-key';
  const cipher = crypto.createCipher('aes256', key);
  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptCredentials(encryptedCredentials: string): any {
  // In real implementation, use proper decryption
  try {
    const key = process.env.ENCRYPTION_KEY || 'fallback-encryption-key';
    const decipher = crypto.createDecipher('aes256', key);
    let decrypted = decipher.update(encryptedCredentials, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

async function testIntegrationConnection(name: string, integration: any): Promise<any> {
  // Mock test implementations
  switch (name) {
    case 'stripe':
      return {
        success: true,
        message: 'Successfully connected to Stripe API',
        details: {
          accountId: 'acct_test123',
          country: 'US',
          currency: 'usd'
        }
      };
      
    case 'sendgrid':
      return {
        success: true,
        message: 'Successfully connected to SendGrid API',
        details: {
          accountName: 'Test Account',
          reputation: 99.5,
          sendingQuota: 100000
        }
      };
      
    case 'twilio':
      return {
        success: true,
        message: 'Successfully connected to Twilio API',
        details: {
          accountSid: 'AC***',
          fromNumber: '+1234567890',
          balance: '$10.00'
        }
      };
      
    case 'quickbooks':
      return {
        success: true,
        message: 'Successfully connected to QuickBooks API',
        details: {
          companyName: 'Test Company',
          companyId: 'comp123',
          lastSync: new Date().toISOString()
        }
      };
      
    default:
      return {
        success: false,
        message: 'Unknown integration type'
      };
  }
}

export default router;