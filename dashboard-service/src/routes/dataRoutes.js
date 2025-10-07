const express = require('express');
const router = express.Router();
const {
  getHistoricalMetrics,
  getRealtimeEvents
} = require('../controllers/dataController');

/**
 * @swagger
 * /api/data/historical-metrics:
 *   get:
 *     summary: Get historical metrics data
 *     tags: [Data]
 *     description: Returns historical metrics data from backend (30 days of data)
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Historical metrics data from backend
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
 *                     metrics:
 *                       type: array
 *                     count:
 *                       type: integer
 *                     source:
 *                       type: string
 */
router.get('/historical-metrics', getHistoricalMetrics);

/**
 * @swagger
 * /api/data/realtime-events:
 *   get:
 *     summary: Get realtime events data
 *     tags: [Data]
 *     description: Returns realtime events data from backend
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events to return
 *     responses:
 *       200:
 *         description: Realtime events data from backend
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
 *                     events:
 *                       type: array
 *                     count:
 *                       type: integer
 *                     source:
 *                       type: string
 */
router.get('/realtime-events', getRealtimeEvents);

module.exports = router;
