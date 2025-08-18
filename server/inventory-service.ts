
import { storage } from "./storage";
import type { InsertInventoryBatch, InsertStockAdjustment, InsertStockMovement } from "@shared/schema";

export class InventoryService {
  // FIFO Logic for stock consumption
  async consumeStock(productId: string, warehouseId: string, quantity: number, reference: string, referenceType: string, performedBy: string) {
    const batches = await storage.getProductBatches(productId, warehouseId);
    let remainingToConsume = quantity;
    const consumedBatches = [];

    // Sort by expiry date (FIFO - First In, First Out)
    batches.sort((a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime());

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
      throw new Error(`Insufficient stock. Need ${remainingToConsume} more units of product ${productId}`);
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
    const movements = await storage.getStockMovements(productId, warehouseId);

    // Calculate daily consumption rate from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMovements = movements.filter(m => 
      m.movementType === 'out' && 
      new Date(m.createdAt) >= thirtyDaysAgo
    );

    const totalConsumed = recentMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const dailyConsumption = totalConsumed / 30;

    const forecast = batches.reduce((acc, batch) => {
      const existing = acc.find(f => f.productId === batch.productId);
      if (existing) {
        existing.totalStock += batch.remainingQuantity;
        existing.batches.push({
          batchNumber: batch.batchNumber,
          quantity: batch.remainingQuantity,
          expiryDate: batch.expiryDate,
          daysToExpiry: batch.expiryDate ? 
            Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
        });
      } else {
        acc.push({
          productId: batch.productId!,
          warehouseId: batch.warehouseId!,
          totalStock: batch.remainingQuantity,
          dailyConsumption,
          daysUntilOut: dailyConsumption > 0 ? Math.ceil(batch.remainingQuantity / dailyConsumption) : 999,
          batches: [{
            batchNumber: batch.batchNumber,
            quantity: batch.remainingQuantity,
            expiryDate: batch.expiryDate,
            daysToExpiry: batch.expiryDate ? 
              Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
          }],
          status: 'good'
        });
      }
      return acc;
    }, [] as any[]);

    // Determine status based on days until out and expiry
    forecast.forEach(f => {
      const hasExpiringSoon = f.batches.some((b: any) => b.daysToExpiry && b.daysToExpiry <= 7);
      if (f.daysUntilOut <= 7 || hasExpiringSoon) f.status = 'critical';
      else if (f.daysUntilOut <= 14) f.status = 'warning';
    });

    return forecast;
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
      ...movements.map(m => ({ ...m, type: 'movement' })),
      ...adjustments.map(a => ({ ...a, type: 'adjustment' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return auditTrail;
  }
}

export const inventoryService = new InventoryService();
