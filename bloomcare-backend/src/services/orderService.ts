import mongoose from "mongoose";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import Pharmacy from "../models/Pharmacy";
import Medicine from "../models/Medicine";
import User from "../models/User";
import { logger } from "../config/logger";
import notificationService from "./notificationService";

interface ICreateOrderData {
  userId: string;
  pharmacyId: string;
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
  paymentMethod: 'cod' | 'online';
}

interface IUpdateStatusData {
  orderId: string;
  status: "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  note?: string;
  userId: string;
  userRole: string;
}

interface ICancelOrderData {
  orderId: string;
  reason: string;
  userId: string;
}

class OrderService {
  /**
   * Create a new order
   * - For COD: Deduct inventory immediately
   * - For Online (Card): Don't deduct inventory (will deduct after payment)
   */
  async createOrder(data: ICreateOrderData) {
    const { userId, pharmacyId, items, paymentMethod } = data;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Validate pharmacy
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    if (!pharmacy.isActive) {
      throw new Error("Pharmacy is currently inactive");
    }

    // Process items and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const inventoryItem = pharmacy.medicines.find(
        (med) => med.medicine.toString() === item.medicineId
      );

      if (!inventoryItem) {
        throw new Error(`Medicine not found in this pharmacy`);
      }

      // Check stock
      if (inventoryItem.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for medicine. Available: ${inventoryItem.quantity}`
        );
      }

      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        throw new Error(`Medicine not found`);
      }

      const itemTotal = inventoryItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        medicine: item.medicineId,
        quantity: item.quantity,
        price: inventoryItem.price,
      });
    }

    // For COD: Deduct inventory immediately
    // For Online: No inventory deduction yet
    let orderStatus: "Pending" | "Confirmed" = "Pending";
    let paymentStatus: "pending" | "paid" | "failed" | "refunded" = "pending";

    if (paymentMethod === 'cod') {
      // Deduct inventory for COD orders
      for (const item of items) {
        await Pharmacy.findOneAndUpdate(
          {
            _id: new mongoose.Types.ObjectId(pharmacyId),
            "medicines.medicine": new mongoose.Types.ObjectId(item.medicineId),
          },
          {
            $inc: {
              "medicines.$.quantity": -item.quantity,
            },
          }
        );

        // Update stock status
        await this.updateStockStatus(pharmacyId, item.medicineId);
      }
      
      orderStatus = "Confirmed";
      paymentStatus = "pending";
      
      logger.info(`Inventory deducted for COD order`);
    } else {
      logger.info(`Inventory will be deducted after successful payment for online order`);
    }

    // Create order - ✅ FIXED: Use proper ObjectId types
    const order = await Order.create({
      user: new mongoose.Types.ObjectId(userId),
      pharmacy: new mongoose.Types.ObjectId(pharmacyId),
      totalPrice,
      status: orderStatus,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      orderDate: new Date(),
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order: order._id,
        medicine: new mongoose.Types.ObjectId(item.medicine),
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Populate order items
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email phone")
      .populate("pharmacy", "name address phone")
      .populate({
        path: "items",
        populate: {
          path: "medicine",
          select: "name genericName category image",
        },
      });

    // Send notification for COD orders
    if (paymentMethod === 'cod') {
      await notificationService.createNotification({
        userId: order.user.toString(),
        title: "Order Confirmed! 📦",
        message: `Your COD order #${order._id.toString().slice(-6)} has been confirmed. You'll pay upon delivery.`,
        type: "order",
        referenceId: order._id.toString(),
        referenceType: "order",
        icon: "📦",
        link: `/orders/${order._id}`,
      });
    }

    logger.info(`Order created: ${order._id} by user ${userId} (${paymentMethod})`);

    return populatedOrder;
  }

  /**
   * Confirm order and deduct inventory (called after successful card payment)
   */
  async confirmOrderAndDeductInventory(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "Pending") {
      throw new Error(`Order is already ${order.status}`);
    }

    if (order.paymentMethod !== "online") {
      throw new Error("Only online orders require inventory deduction after payment");
    }

    // Get order items
    const orderItems = await OrderItem.find({ order: new mongoose.Types.ObjectId(orderId) });

    // Deduct inventory for each item
    for (const item of orderItems) {
      if (!item || !item.medicine || !item.quantity) {
        logger.warn(`Skipping invalid order item: ${item?._id}`);
        continue;
      }

      await Pharmacy.findOneAndUpdate(
        {
          _id: order.pharmacy,
          "medicines.medicine": item.medicine,
        },
        {
          $inc: {
            "medicines.$.quantity": -(item.quantity || 0),
          },
        }
      );

      // Update stock status
      await this.updateStockStatus(
        order.pharmacy.toString(),
        item.medicine.toString()
      );
    }

    // Update order status - ✅ FIXED: Use type assertions
    order.status = "Confirmed" as "Confirmed";
    order.paymentStatus = "paid" as "paid";
    await order.save();

    logger.info(`Order ${orderId} confirmed and inventory deducted for online payment`);

    // Send notification
    await notificationService.createNotification({
      userId: order.user.toString(),
      title: "Payment Successful! 💳",
      message: `Your order #${order._id.toString().slice(-6)} has been confirmed and is being processed.`,
      type: "order",
      referenceId: order._id.toString(),
      referenceType: "order",
      icon: "✅",
      link: `/orders/${order._id}`,
    });

    return order;
  }

  /**
   * Cancel online order (no inventory to restore since it wasn't deducted)
   */
  async cancelOnlineOrder(orderId: string, reason?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status !== "Pending") {
      throw new Error(`Order is already ${order.status}`);
    }

    if (order.paymentMethod !== "online") {
      throw new Error("Only online orders can be cancelled without restoring inventory");
    }

    order.status = "Cancelled" as "Cancelled";
    order.paymentStatus = "failed" as "failed";
    await order.save();

    logger.info(`Order ${orderId} cancelled. Reason: ${reason || "Payment failed or user cancelled"}`);

    await notificationService.createNotification({
      userId: order.user.toString(),
      title: "Order Cancelled ❌",
      message: `Your order #${order._id.toString().slice(-6)} has been cancelled. ${reason || "Payment was not successful."}`,
      type: "order",
      referenceId: order._id.toString(),
      referenceType: "order",
      icon: "❌",
      link: `/orders/${order._id}`,
    });

    return order;
  }

  /**
   * Update stock status for a medicine
   */
  private async updateStockStatus(pharmacyId: string, medicineId: string) {
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) return;

    const inventoryItem = pharmacy.medicines.find(
      (med) => med.medicine.toString() === medicineId
    );

    if (!inventoryItem) return;

    let stockStatus: "In Stock" | "Low Stock" | "Out of Stock" = "Out of Stock";
    if (inventoryItem.quantity > 10) {
      stockStatus = "In Stock";
    } else if (inventoryItem.quantity > 0 && inventoryItem.quantity <= 10) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "Out of Stock";
    }

    await Pharmacy.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(pharmacyId),
        "medicines.medicine": new mongoose.Types.ObjectId(medicineId),
      },
      {
        $set: {
          "medicines.$.stockStatus": stockStatus,
        },
      }
    );
  }

  // ============ GET ORDERS ============

  async getUserOrders(
    userId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    // ✅ FIXED: Convert string to ObjectId
    const query: any = { user: new mongoose.Types.ObjectId(userId) };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("pharmacy", "name address phone image")
        .populate({
          path: "items",
          populate: {
            path: "medicine",
            select: "name genericName category image",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPharmacyOrders(
    pharmacyId: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ) {
    // ✅ FIXED: Convert string to ObjectId
    const query: any = { pharmacy: new mongoose.Types.ObjectId(pharmacyId) };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "fullName email phone image")
        .populate({
          path: "items",
          populate: {
            path: "medicine",
            select: "name genericName category image",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetails(orderId: string, userId: string, userRole: string) {
    const order = await Order.findById(orderId)
      .populate("user", "fullName email phone image")
      .populate("pharmacy", "name address phone email image")
      .populate("items");

    if (!order) {
      throw new Error("Order not found");
    }

    // Check authorization
    let isOwner = false;
    let isPharmacyOwner = false;
    const isAdmin = userRole === "admin";

    if (order.user && typeof order.user === 'object' && '_id' in order.user) {
      isOwner = (order.user as any)._id.toString() === userId;
    }

    if (order.pharmacy && typeof order.pharmacy === 'object' && '_id' in order.pharmacy) {
      const pharmacyId = (order.pharmacy as any)._id.toString();
      isPharmacyOwner = await this.isPharmacyOwner(userId, pharmacyId);
    }

    if (!isOwner && !isPharmacyOwner && !isAdmin) {
      throw new Error("You are not authorized to view this order");
    }

    return order;
  }

  private async isPharmacyOwner(userId: string, pharmacyId: string): Promise<boolean> {
    const pharmacy = await Pharmacy.findOne({
      _id: new mongoose.Types.ObjectId(pharmacyId),
      owner: new mongoose.Types.ObjectId(userId),
    });
    return !!pharmacy;
  }

  // ============ UPDATE ORDER STATUS ============

  async updateOrderStatus(data: IUpdateStatusData) {
    const { orderId, status, note, userId, userRole } = data;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check authorization
    const pharmacy = await Pharmacy.findById(order.pharmacy);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const isPharmacyOwner = pharmacy.owner.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isPharmacyOwner && !isAdmin) {
      throw new Error("You are not authorized to update this order");
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    // Update order status
    order.status = status;
    if (note) {
      logger.info(`Order ${orderId} status updated to ${status}. Note: ${note}`);
    }

    await order.save();

    // If order is cancelled and was COD, restore inventory
    if (status === "Cancelled" && order.paymentMethod === "cod") {
      await this.restoreInventory(order._id.toString());
    }

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "fullName email phone")
      .populate("pharmacy", "name address phone")
      .populate({
        path: "items",
        populate: {
          path: "medicine",
          select: "name genericName category image",
        },
      });

    logger.info(`Order ${orderId} status updated to ${status} by user ${userId}`);

    return updatedOrder;
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    const validTransitions: { [key: string]: string[] } = {
      "Pending": ["Confirmed", "Cancelled"],
      "Confirmed": ["Processing", "Cancelled"],
      "Processing": ["Shipped", "Cancelled"],
      "Shipped": ["Delivered", "Cancelled"],
      "Delivered": [],
      "Cancelled": [],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed.join(", ")}`
      );
    }
  }

  // ============ CANCEL ORDER ============

  async cancelOrder(data: ICancelOrderData) {
    const { orderId, reason, userId } = data;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user owns the order
    if (order.user.toString() !== userId) {
      throw new Error("You are not authorized to cancel this order");
    }

    // Check if order can be cancelled
    if (order.status === "Delivered") {
      throw new Error("Cannot cancel a delivered order");
    }

    if (order.status === "Cancelled") {
      throw new Error("Order is already cancelled");
    }

    // Update order status
    order.status = "Cancelled" as "Cancelled";
    await order.save();

    // If order was COD, restore inventory
    if (order.paymentMethod === "cod") {
      await this.restoreInventory(orderId);
    }

    logger.info(`Order ${orderId} cancelled by user ${userId}. Reason: ${reason}`);

    const cancelledOrder = await Order.findById(orderId)
      .populate("user", "fullName email phone")
      .populate("pharmacy", "name address phone")
      .populate({
        path: "items",
        populate: {
          path: "medicine",
          select: "name genericName category image",
        },
      });

    return cancelledOrder;
  }

  // ============ RESTORE INVENTORY ============

  public async restoreInventory(orderId: string) {
    const orderItems = await OrderItem.find({ order: new mongoose.Types.ObjectId(orderId) });

    for (const item of orderItems) {
      if (!item || !item.medicine) {
        logger.warn(`Skipping invalid order item: ${item?._id}`);
        continue;
      }

      const order = await Order.findById(orderId);
      if (!order) continue;

      await Pharmacy.findOneAndUpdate(
        {
          _id: order.pharmacy,
          "medicines.medicine": item.medicine,
        },
        {
          $inc: {
            "medicines.$.quantity": item.quantity || 0,
          },
        }
      );

      // Update stock status
      await this.updateStockStatus(
        order.pharmacy.toString(),
        item.medicine.toString()
      );
    }

    logger.info(`Inventory restored for cancelled order ${orderId}`);
  }

  // ============ ORDER STATISTICS ============

  async getOrderStats() {
    const [totalOrders, pendingOrders, confirmedOrders, processingOrders, shippedOrders, deliveredOrders, cancelledOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Confirmed" }),
      Order.countDocuments({ status: "Processing" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: "Cancelled" }),
    ]);

    // Get total revenue from delivered orders
    const deliveredOrdersData = await Order.find({ status: "Delivered" });
    const totalRevenue = deliveredOrdersData.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Get today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todayOrders,
    };
  }
}

export default new OrderService();