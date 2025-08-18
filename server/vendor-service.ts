import { storage } from "./storage";

export class VendorService {
  async createPurchaseOrder(poData: any, items: any[]) {
    try {
      // Generate PO number
      const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

      // Create purchase order
      const purchaseOrder = await storage.createPurchaseOrder({
        ...poData,
        poNumber,
        totalAmount: totalAmount.toString(),
        status: 'draft'
      });

      // Create purchase order items
      for (const item of items) {
        await storage.createPurchaseOrderItem({
          purchaseOrderId: purchaseOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost.toString(),
          totalCost: (item.quantity * item.unitCost).toString()
        });
      }

      // Update PO status to 'sent' if specified
      if (poData.autoSend) {
        await storage.updatePurchaseOrder(purchaseOrder.id, {
          status: 'sent',
          orderDate: new Date().toISOString()
        });
      }

      return {
        purchaseOrder,
        items,
        totalAmount
      };
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  async receivePurchaseOrder(poId: string, receivedItems: any[], warehouseId: string, receivedBy: string) {
    try {
      const purchaseOrder = await storage.getPurchaseOrder(poId);
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      const poItems = await storage.getPurchaseOrderItems(poId);
      let allItemsReceived = true;

      for (const receivedItem of receivedItems) {
        const poItem = poItems.find(item => item.productId === receivedItem.productId);
        if (!poItem) continue;

        // Update received quantity
        const newReceivedQuantity = (poItem.receivedQuantity || 0) + receivedItem.receivedQuantity;
        await storage.updatePurchaseOrderItem(poItem.id, {
          receivedQuantity: newReceivedQuantity
        });

        // Create inventory batch
        const batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        await storage.createInventoryBatch({
          productId: receivedItem.productId,
          warehouseId,
          vendorId: purchaseOrder.vendorId,
          batchNumber,
          quantity: receivedItem.receivedQuantity,
          remainingQuantity: receivedItem.receivedQuantity,
          costPrice: poItem.unitCost,
          expiryDate: receivedItem.expiryDate || null,
          manufacturedDate: receivedItem.manufacturedDate || null
        });

        // Create stock movement
        await storage.createStockMovement({
          productId: receivedItem.productId,
          warehouseId,
          movementType: 'in',
          quantity: receivedItem.receivedQuantity,
          reference: poId,
          referenceType: 'purchase_order',
          performedBy: receivedBy
        });

        // Check if item is fully received
        if (newReceivedQuantity < poItem.quantity) {
          allItemsReceived = false;
        }
      }

      // Update PO status
      const newStatus = allItemsReceived ? 'delivered' : 'partial';
      await storage.updatePurchaseOrder(poId, {
        status: newStatus,
        actualDelivery: allItemsReceived ? new Date().toISOString() : undefined
      });

      return {
        purchaseOrderId: poId,
        status: newStatus,
        receivedItems: receivedItems.length,
        allItemsReceived
      };
    } catch (error) {
      console.error('Error receiving purchase order:', error);
      throw error;
    }
  }

  async getVendorAnalytics(vendorId: string, days: number = 90) {
    try {
      const purchaseOrders = await storage.getPurchaseOrders();
      const vendorPOs = purchaseOrders.filter(po => 
        po.vendorId === vendorId &&
        new Date(po.createdAt) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      );

      const totalOrders = vendorPOs.length;
      const totalSpent = vendorPOs.reduce((sum, po) => sum + parseFloat(po.totalAmount || '0'), 0);
      const deliveredOrders = vendorPOs.filter(po => po.status === 'delivered').length;
      const deliveryRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

      // Calculate average delivery time
      const deliveredPOs = vendorPOs.filter(po => po.actualDelivery && po.orderDate);
      const avgDeliveryTime = deliveredPOs.length > 0 
        ? deliveredPOs.reduce((sum, po) => {
            const orderDate = new Date(po.orderDate);
            const deliveryDate = new Date(po.actualDelivery);
            return sum + (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / deliveredPOs.length
        : 0;

      // Performance score (weighted average)
      const performanceScore = Math.round(
        (deliveryRate * 0.4) + 
        (Math.max(0, 100 - avgDeliveryTime * 2) * 0.3) + 
        (totalOrders > 0 ? Math.min(totalOrders * 10, 100) : 0) * 0.3
      );

      return {
        totalOrders,
        totalSpent,
        deliveryRate: Math.round(deliveryRate),
        avgDeliveryTime: Math.round(avgDeliveryTime),
        performanceScore,
        recentTrends: {
          ordersThisMonth: vendorPOs.filter(po => 
            new Date(po.createdAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          onTimeDeliveries: deliveredPOs.filter(po => {
            if (!po.expectedDelivery || !po.actualDelivery) return false;
            return new Date(po.actualDelivery) <= new Date(po.expectedDelivery);
          }).length
        }
      };
    } catch (error) {
      console.error('Error getting vendor analytics:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        deliveryRate: 0,
        avgDeliveryTime: 0,
        performanceScore: 0,
        recentTrends: { ordersThisMonth: 0, onTimeDeliveries: 0 }
      };
    }
  }

  async getPurchaseOrderRecommendations(warehouseId: string) {
    try {
      const products = await storage.getProducts();
      const inventoryBatches = await storage.getInventoryBatches();
      const vendors = await storage.getVendors();

      const recommendations = [];

      for (const product of products) {
        const productBatches = inventoryBatches.filter(b => 
          b.productId === product.id && 
          (warehouseId === 'all' || b.warehouseId === warehouseId)
        );

        const totalStock = productBatches.reduce((sum, batch) => sum + batch.remainingQuantity, 0);

        // Calculate reorder point (simplified logic)
        const reorderPoint = 20; // Could be based on historical sales data
        const economicOrderQuantity = 50; // Could be calculated based on demand and costs

        if (totalStock <= reorderPoint) {
          // Find preferred vendor (could be based on cost, performance, etc.)
          const preferredVendor = vendors.find(v => v.isActive) || vendors[0];

          if (preferredVendor) {
            recommendations.push({
              productId: product.id,
              productName: product.name,
              currentStock: totalStock,
              reorderPoint,
              recommendedQuantity: economicOrderQuantity,
              vendorId: preferredVendor.id,
              vendorName: preferredVendor.name,
              estimatedCost: economicOrderQuantity * parseFloat(product.price || '0') * 0.7, // Assume 30% markup
              priority: totalStock === 0 ? 'critical' : totalStock < reorderPoint / 2 ? 'high' : 'medium',
              reason: `Stock level (${totalStock}) below reorder point (${reorderPoint})`
            });
          }
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } catch (error) {
      console.error('Error getting PO recommendations:', error);
      return [];
    }
  }

  async recordPayment(paymentData: any) {
    try {
      // Create vendor payment record
      const payment = await storage.createVendorPayment(paymentData);

      // Update vendor outstanding dues
      const vendor = await storage.getVendor(paymentData.vendorId);
      if (vendor) {
        const currentDues = parseFloat(vendor.outstandingDues || '0');
        const newDues = Math.max(0, currentDues - parseFloat(paymentData.amount));

        await storage.updateVendor(paymentData.vendorId, {
          outstandingDues: newDues.toString()
        });
      }

      // Update purchase order paid amount if linked
      if (paymentData.purchaseOrderId) {
        const po = await storage.getPurchaseOrder(paymentData.purchaseOrderId);
        if (po) {
          const currentPaid = parseFloat(po.paidAmount || '0');
          const newPaidAmount = currentPaid + parseFloat(paymentData.amount);

          await storage.updatePurchaseOrder(paymentData.purchaseOrderId, {
            paidAmount: newPaidAmount.toString()
          });

          // Check if PO is fully paid
          if (newPaidAmount >= parseFloat(po.totalAmount || '0')) {
            await storage.updatePurchaseOrder(paymentData.purchaseOrderId, {
              status: 'closed'
            });
          }
        }
      }

      return payment;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
}

export const vendorService = new VendorService();