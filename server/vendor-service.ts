
import { storage } from "./storage";
import type { InsertVendor, InsertPurchaseOrder, InsertPurchaseOrderItem, InsertVendorPayment } from "@shared/schema";

export class VendorService {
  // Create purchase order
  async createPurchaseOrder(poData: InsertPurchaseOrder, items: InsertPurchaseOrderItem[]) {
    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const totalAmount = items.reduce((sum, item) => 
      sum + (parseFloat(item.totalCost?.toString() || '0')), 0
    );

    const po = await storage.createPurchaseOrder({
      ...poData,
      poNumber,
      totalAmount: totalAmount.toString()
    });

    // Create PO items
    for (const item of items) {
      await storage.createPurchaseOrderItem({
        ...item,
        purchaseOrderId: po.id
      });
    }

    return { po, items: items.length };
  }

  // Receive purchase order (partial or full)
  async receivePurchaseOrder(poId: string, receivedItems: { itemId: string, receivedQuantity: number, batchNumber?: string, expiryDate?: Date }[], warehouseId: string, receivedBy: string) {
    const po = await storage.getPurchaseOrder(poId);
    if (!po) throw new Error("Purchase order not found");

    const poItems = await storage.getPurchaseOrderItems(poId);
    let fullyReceived = true;

    for (const receivedItem of receivedItems) {
      const poItem = poItems.find(item => item.id === receivedItem.itemId);
      if (!poItem) continue;

      const newReceivedQuantity = (poItem.receivedQuantity || 0) + receivedItem.receivedQuantity;
      
      // Update PO item
      await storage.updatePurchaseOrderItem(receivedItem.itemId, {
        receivedQuantity: newReceivedQuantity
      });

      // Create inventory batch if receiving items
      if (receivedItem.receivedQuantity > 0) {
        const batchNumber = receivedItem.batchNumber || `BATCH-${Date.now()}-${poItem.id.substr(-6)}`;
        
        await storage.createInventoryBatch({
          productId: poItem.productId!,
          warehouseId,
          vendorId: po.vendorId!,
          batchNumber,
          quantity: receivedItem.receivedQuantity,
          remainingQuantity: receivedItem.receivedQuantity,
          costPrice: poItem.unitCost?.toString(),
          expiryDate: receivedItem.expiryDate,
          manufacturedDate: null,
          receivedDate: new Date()
        });

        // Record stock movement
        await storage.createStockMovement({
          productId: poItem.productId!,
          batchId: null, // Will be updated after batch creation
          warehouseId,
          movementType: 'in',
          quantity: receivedItem.receivedQuantity,
          reference: po.id,
          referenceType: 'purchase_order',
          performedBy: receivedBy
        });
      }

      // Check if this item is fully received
      if (newReceivedQuantity < poItem.quantity) {
        fullyReceived = false;
      }
    }

    // Update PO status
    const allItems = await storage.getPurchaseOrderItems(poId);
    const hasPartialReceived = allItems.some(item => (item.receivedQuantity || 0) > 0);
    const allFullyReceived = allItems.every(item => (item.receivedQuantity || 0) >= item.quantity);

    let newStatus = po.status;
    if (allFullyReceived) {
      newStatus = 'delivered';
    } else if (hasPartialReceived) {
      newStatus = 'partial';
    }

    await storage.updatePurchaseOrder(poId, {
      status: newStatus,
      actualDelivery: allFullyReceived ? new Date() : po.actualDelivery
    });

    return { po, status: newStatus, fullyReceived };
  }

  // Record vendor payment
  async recordPayment(paymentData: InsertVendorPayment) {
    const payment = await storage.createVendorPayment(paymentData);
    
    // Update vendor outstanding dues
    const vendor = await storage.getVendor(paymentData.vendorId!);
    if (vendor) {
      const newDues = parseFloat(vendor.outstandingDues || '0') - parseFloat(paymentData.amount?.toString() || '0');
      await storage.updateVendor(vendor.id, {
        outstandingDues: Math.max(0, newDues).toString()
      });
    }

    // Update PO paid amount if linked
    if (paymentData.purchaseOrderId) {
      const po = await storage.getPurchaseOrder(paymentData.purchaseOrderId);
      if (po) {
        const newPaidAmount = parseFloat(po.paidAmount || '0') + parseFloat(paymentData.amount?.toString() || '0');
        await storage.updatePurchaseOrder(po.id, {
          paidAmount: newPaidAmount.toString()
        });
      }
    }

    return payment;
  }

  // Get vendor analytics
  async getVendorAnalytics(vendorId?: string, days: number = 90) {
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const vendors = vendorId ? [await storage.getVendor(vendorId)] : await storage.getVendors();
    
    const analytics = [];

    for (const vendor of vendors) {
      if (!vendor) continue;

      const purchaseOrders = await storage.getVendorPurchaseOrders(vendor.id, fromDate);
      const payments = await storage.getVendorPayments(vendor.id, fromDate);

      const totalOrders = purchaseOrders.length;
      const totalSpent = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.totalAmount || '0'), 0);
      const deliveredOnTime = purchaseOrders.filter(po => 
        po.actualDelivery && po.expectedDelivery &&
        new Date(po.actualDelivery) <= new Date(po.expectedDelivery)
      ).length;
      
      const avgDeliveryTime = purchaseOrders
        .filter(po => po.actualDelivery && po.orderDate)
        .reduce((sum, po, _, arr) => {
          const days = Math.ceil((new Date(po.actualDelivery!).getTime() - new Date(po.orderDate).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days / arr.length;
        }, 0);

      analytics.push({
        vendor,
        metrics: {
          totalOrders,
          totalSpent,
          avgOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          deliveryPerformance: totalOrders > 0 ? (deliveredOnTime / totalOrders) * 100 : 0,
          avgDeliveryTime: Math.round(avgDeliveryTime),
          outstandingDues: parseFloat(vendor.outstandingDues || '0'),
          totalPayments: payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
        }
      });
    }

    return analytics.sort((a, b) => b.metrics.totalSpent - a.metrics.totalSpent);
  }

  // Get purchase order recommendations
  async getPurchaseOrderRecommendations(warehouseId?: string) {
    const forecast = await storage.getStockForecast();
    const vendors = await storage.getVendors();
    
    const recommendations = [];

    for (const item of forecast) {
      if (item.status === 'critical' || item.daysUntilOut <= 14) {
        // Find the best vendor for this product based on cost and delivery time
        const productVendors = await storage.getProductVendors(item.productId);
        const bestVendor = productVendors.reduce((best, current) => {
          // Simple scoring: lower cost + better delivery performance
          const currentScore = (current.avgCost || 999999) + (current.avgDeliveryTime || 30);
          const bestScore = (best?.avgCost || 999999) + (best?.avgDeliveryTime || 30);
          return currentScore < bestScore ? current : best;
        }, null);

        if (bestVendor) {
          const recommendedQuantity = Math.max(
            item.dailyConsumption * 30, // 30 days worth
            50 // Minimum order quantity
          );

          recommendations.push({
            productId: item.productId,
            warehouseId: item.warehouseId,
            currentStock: item.totalStock,
            daysUntilOut: item.daysUntilOut,
            recommendedQuantity: Math.ceil(recommendedQuantity),
            suggestedVendor: bestVendor,
            priority: item.status === 'critical' ? 'high' : 'medium'
          });
        }
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

export const vendorService = new VendorService();
