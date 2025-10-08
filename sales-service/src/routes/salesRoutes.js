const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create a new sale
 *     tags: [Sales]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *               - price
 *             properties:
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Sale created successfully
 */
router.post('/', salesController.createSale);

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales
 *     tags: [Sales]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit number of results
 *     responses:
 *       200:
 *         description: List of sales
 */
router.get('/', salesController.getAllSales);

/**
 * @swagger
 * /api/sales/summary:
 *   get:
 *     summary: Get sales summary
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Sales summary
 */
router.get('/summary', salesController.getSalesSummary);

/**
 * @swagger
 * /api/sales/today:
 *   get:
 *     summary: Get today's sales
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Today's sales summary
 */
router.get('/today', salesController.getTodaysSales);

/**
 * @swagger
 * /api/sales/chart:
 *   get:
 *     summary: Get last 7 days sales for chart
 *     tags: [Sales]
 *     responses:
 *       200:
 *         description: Chart data
 */
router.get('/chart', salesController.getLast7DaysSales);

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 */
router.get('/:id', salesController.getSaleById);

module.exports = router;
