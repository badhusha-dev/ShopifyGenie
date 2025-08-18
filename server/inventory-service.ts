import { storage } from "./storage";
import type { InsertInventoryBatch, InsertStockAdjustment, InsertStockMovement } from "@shared/schema";

export class InventoryService {
  // FIFO Logic for stock consumption
  async consumeStock(productId: string, warehouseId: string, quantity: number, reference: string, referenceType: string, performedBy: string) {
    const batches = await storage.getProductBatches(productId, warehouseId);
    let remainingToConsume = quantity;
    const consumedBatches = [];

    // Sort by expiry date (FEFO - First Expired First Out), then by received date (FIFO)
    batches.sort((a, b) => {
      if (a.expiryDate && b.expiryDate) {
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      }
      if (a.expiryDate && !b.expiryDate) return -1;
      if (!a.expiryDate && b.expiryDate) return 1;
      return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
    });

    for (const batch of batches) {
      if (remainingToConsume <= 0) break;
      if (batch.remainingQuantity <= 0) continue;

      const consumeFromBatch = Math.min(batch.remainingQuantity, remainingToConsume);

      // Update batch quantity
      await storage.updateInventoryBatch(batch.id, {
        remainingQuantity: batch.remainingQuantity - consumeFromBatch
      });

      // Record stock movement
      await storage.createStockMovement({
        productId,
        batchId: batch.id,
        warehouseId,
        movementType: 'out',
        quantity: -consumeFromBatch,
        reference,
        referenceType,
        performedBy
      });

      consumedBatches.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        quantity: consumeFromBatch,
        expiryDate: batch.expiryDate
      });

      remainingToConsume -= consumeFromBatch;
    }

    if (remainingToConsume > 0) {
      throw new Error(`Insufficient stock. Need ${remainingToConsume} more units of product ${productId} in warehouse ${warehouseId}`);
    }

    return consumedBatches;
  }

  // Add stock with batch tracking
  async addStock(batchData: InsertInventoryBatch, performedBy: string) {
    const batch = await storage.createInventoryBatch(batchData);

    // Record stock movement
    await storage.createStockMovement({
      productId: batchData.productId!,
      batchId: batch.id,
      warehouseId: batchData.warehouseId!,
      movementType: 'in',
      quantity: batchData.quantity,
      reference: batch.id,
      referenceType: 'batch_creation',
      performedBy
    });

    return batch;
  }

  // Stock adjustment with audit trail
  async adjustStock(adjustmentData: InsertStockAdjustment) {
    const batch = await storage.getInventoryBatch(adjustmentData.batchId!);
    if (!batch) throw new Error("Batch not found");

    const adjustment = await storage.createStockAdjustment(adjustmentData);

    // Update batch quantity
    await storage.updateInventoryBatch(batch.id, {
      remainingQuantity: adjustmentData.quantityAfter
    });

    // Record stock movement
    await storage.createStockMovement({
      productId: adjustmentData.productId!,
      batchId: adjustmentData.batchId!,
      warehouseId: adjustmentData.warehouseId!,
      movementType: 'adjustment',
      quantity: adjustmentData.quantityAfter - adjustmentData.quantityBefore,
      reference: adjustment.id,
      referenceType: 'adjustment',
      performedBy: adjustmentData.adjustedBy
    });

    return adjustment;
  }

  // Get stock forecast with expiry tracking
  async getStockForecast(productId?: string, warehouseId?: string) {
    const batches = await storage.getInventoryBatches(productId, warehouseId);
    const movements = await storage.getStockMovements(productId, warehouseId); // For historical consumption data

    // Calculate daily consumption rate from last 30 days of 'out' movements
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOutwardMovements = movements.filter(m =>
      m.movementType === 'out' &&
      new Date(m.createdAt) >= thirtyDaysAgo
    );

    const totalConsumedLast30Days = recentOutwardMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const dailyConsumptionRate = 30 > 0 ? totalConsumedLast30Days / 30 : 0;

    const forecastData = batches.reduce((acc, batch) => {
      const existingForecast = acc.find(f => f.productId === batch.productId && f.warehouseId === batch.warehouseId);

      const daysToExpiry = batch.expiryDate ?
        Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

      if (existingForecast) {
        existingForecast.totalStock += batch.remainingQuantity;
        existingForecast.batches.push({
          batchNumber: batch.batchNumber,
          quantity: batch.remainingQuantity,
          expiryDate: batch.expiryDate,
          daysToExpiry
        });
      } else {
        const currentDailyConsumption = dailyConsumptionRate > 0 ? dailyConsumptionRate : 1; // Prevent division by zero
        const daysUntilOut = currentDailyConsumption > 0 ? Math.ceil(batch.remainingQuantity / currentDailyConsumption) : Infinity;

        acc.push({
          productId: batch.productId!,
          warehouseId: batch.warehouseId!,
          totalStock: batch.remainingQuantity,
          dailyConsumption: dailyConsumptionRate,
          daysUntilOut: daysUntilOut,
          batches: [{
            batchNumber: batch.batchNumber,
            quantity: batch.remainingQuantity,
            expiryDate: batch.expiryDate,
            daysToExpiry
          }],
          status: 'good' // Default status
        });
      }
      return acc;
    }, [] as any[]);

    // Recalculate total stock and consolidate batches for forecast entries that spanned multiple batches
    forecastData.forEach(forecast => {
      const totalStockForProductWarehouse = batches
        .filter(b => b.productId === forecast.productId && b.warehouseId === forecast.warehouseId)
        .reduce((sum, b) => sum + b.remainingQuantity, 0);
      forecast.totalStock = totalStockForProductWarehouse;

      const relevantBatches = batches.filter(b => b.productId === forecast.productId && b.warehouseId === forecast.warehouseId);
      forecast.batches = relevantBatches.map(batch => ({
        batchNumber: batch.batchNumber,
        quantity: batch.remainingQuantity,
        expiryDate: batch.expiryDate,
        daysToExpiry: batch.expiryDate ?
          Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
      })).sort((a, b) => {
        if (a.daysToExpiry !== null && b.daysToExpiry !== null) {
          return a.daysToExpiry - b.daysToExpiry;
        }
        if (a.daysToExpiry !== null && b.daysToExpiry === null) return -1;
        if (a.daysToExpiry === null && b.daysToExpiry !== null) return 1;
        return 0; // Should not happen if sorting by expiry first
      });

      const hasExpiringSoon = forecast.batches.some((b: any) => b.daysToExpiry !== null && b.daysToExpiry <= 7);
      if (forecast.daysUntilOut <= 7 || hasExpiringSoon) forecast.status = 'critical';
      else if (forecast.daysUntilOut <= 14) forecast.status = 'warning';
    });

    return forecastData;
  }

  // Get expiring stock report
  async getExpiringStock(days: number = 30) {
    const cutoffDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const batches = await storage.getInventoryBatches();

    return batches
      .filter(batch =>
        batch.expiryDate &&
        new Date(batch.expiryDate) <= cutoffDate &&
        batch.remainingQuantity > 0
      )
      .map(batch => ({
        ...batch,
        daysToExpiry: Math.ceil((new Date(batch.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }

  // Stock audit trail
  async getStockAuditTrail(productId?: string, warehouseId?: string, days: number = 30) {
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const movements = await storage.getStockMovements(productId, warehouseId, fromDate);
    const adjustments = await storage.getStockAdjustments(productId, warehouseId, fromDate);

    const auditTrail = [
      ...movements.map(m => ({ ...m, type: 'movement', entryDate: m.createdAt })),
      ...adjustments.map(a => ({ ...a, type: 'adjustment', entryDate: a.createdAt }))
    ].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

    return auditTrail;
  }
}

export const inventoryService = new InventoryService();