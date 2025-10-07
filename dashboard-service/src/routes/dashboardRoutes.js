const express = require('express');
const router = express.Router();
const {
  getSalesSummary,
  getInventoryStatus,
  getCustomerMetrics,
  getFinancialOverview,
  getRealtimeEndpoint
} = require('../controllers/dashboardController');

/**
 * @swagger
 * /api/dashboard/sales-summary:
 *   get:
 *     summary: Get sales summary metrics
 *     tags: [Dashboard]
 *     description: Returns total sales, revenue, and profit for the current day
 *     responses:
 *       200:
 *         description: Sales summary data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     totalProfit:
 *                       type: number
 *                     date:
 *                       type: string
 */
router.get('/sales-summary', getSalesSummary);

/**
 * @swagger
 * /api/dashboard/inventory-status:
 *   get:
 *     summary: Get inventory status metrics
 *     tags: [Dashboard]
 *     description: Returns low stock count and total items
 *     responses:
 *       200:
 *         description: Inventory status data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     lowStockCount:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     date:
 *                       type: string
 */
router.get('/inventory-status', getInventoryStatus);

/**
 * @swagger
 * /api/dashboard/customer-metrics:
 *   get:
 *     summary: Get customer metrics
 *     tags: [Dashboard]
 *     description: Returns new customers, active customers, and churn rate
 *     responses:
 *       200:
 *         description: Customer metrics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     newCustomers:
 *                       type: integer
 *                     activeCustomers:
 *                       type: integer
 *                     churnRate:
 *                       type: number
 *                     date:
 *                       type: string
 */
router.get('/customer-metrics', getCustomerMetrics);

/**
 * @swagger
 * /api/dashboard/financial-overview:
 *   get:
 *     summary: Get financial overview
 *     tags: [Dashboard]
 *     description: Returns cash flow summary, receivables, and payables
 *     responses:
 *       200:
 *         description: Financial overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     cashFlow:
 *                       type: number
 *                     accountsReceivable:
 *                       type: number
 *                     accountsPayable:
 *                       type: number
 *                     date:
 *                       type: string
 */
router.get('/financial-overview', getFinancialOverview);

/**
 * @swagger
 * /api/dashboard/realtime:
 *   get:
 *     summary: Get WebSocket endpoint information
 *     tags: [Dashboard]
 *     description: Returns information about the WebSocket endpoint for real-time updates
 *     responses:
 *       200:
 *         description: WebSocket endpoint information
 */
router.get('/realtime', getRealtimeEndpoint);

module.exports = router;
