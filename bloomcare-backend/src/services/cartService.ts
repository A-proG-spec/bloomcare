import mongoose from "mongoose";
import Cart, { ICart, ICartItem } from "../models/Cart";
import Medicine from "../models/Medicine";
import Pharmacy from "../models/Pharmacy";
import { logger } from "../config/logger";

class CartService {
  // ============================================================
  // GET CART
  // ============================================================

  async getCart(userId?: string, sessionId?: string): Promise<ICart | null> {
    if (!userId && !sessionId) {
      throw new Error("Either userId or sessionId is required");
    }

    const query: any = {};
    if (userId) {
      query.user = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    return await Cart.findOne(query);
  }

  async getOrCreateCart(userId?: string, sessionId?: string): Promise<ICart> {
    let cart = await this.getCart(userId, sessionId);

    if (!cart) {
      cart = await Cart.create({
        user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        sessionId: sessionId || undefined,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        status: 'active',
      });
    }

    return cart;
  }

  // ============================================================
  // ADD ITEM
  // ============================================================

  async addItem(
    userId: string | undefined,
    sessionId: string | undefined,
    data: {
      medicineId: string;
      pharmacyId: string;
      quantity: number;
    }
  ): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const { medicineId, pharmacyId, quantity } = data;

    // ✅ Validate medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw new Error("Medicine not found");
    }

    // ✅ Validate pharmacy exists and has the medicine
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // ✅ Check if pharmacy has the medicine in stock
    const inventoryItem = pharmacy.medicines.find(
      (med) => med.medicine.toString() === medicineId
    );
    if (!inventoryItem) {
      throw new Error("Medicine not available at this pharmacy");
    }

    if (inventoryItem.quantity < quantity) {
      throw new Error(`Only ${inventoryItem.quantity} items available in stock`);
    }

    // ✅ Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.medicineId.toString() === medicineId &&
        item.pharmacyId.toString() === pharmacyId
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (inventoryItem.quantity < newQuantity) {
        throw new Error(`Only ${inventoryItem.quantity} items available in stock`);
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        medicineId: new mongoose.Types.ObjectId(medicineId),
        pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
        quantity,
        price: inventoryItem.price,
        medicineName: medicine.name,
        pharmacyName: pharmacy.name,
        image: medicine.image || '',
        stockStatus: inventoryItem.stockStatus,
        addedAt: new Date(),
      } as ICartItem);
    }

    // ✅ Recalculate totals
    this.recalculateTotals(cart);

    await cart.save();
    logger.info(`Item added to cart for ${userId || sessionId}`);

    return cart;
  }

  // ============================================================
  // UPDATE ITEM
  // ============================================================

  async updateItemQuantity(
    userId: string | undefined,
    sessionId: string | undefined,
    medicineId: string,
    pharmacyId: string,
    quantity: number
  ): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.medicineId.toString() === medicineId &&
        item.pharmacyId.toString() === pharmacyId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      // ✅ Validate stock
      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (!pharmacy) {
        throw new Error("Pharmacy not found");
      }

      const inventoryItem = pharmacy.medicines.find(
        (med) => med.medicine.toString() === medicineId
      );
      if (!inventoryItem) {
        throw new Error("Medicine not available at this pharmacy");
      }

      if (inventoryItem.quantity < quantity) {
        throw new Error(`Only ${inventoryItem.quantity} items available in stock`);
      }

      cart.items[itemIndex].quantity = quantity;
    }

    this.recalculateTotals(cart);
    await cart.save();

    logger.info(`Cart item updated for ${userId || sessionId}`);
    return cart;
  }

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  async removeItem(
    userId: string | undefined,
    sessionId: string | undefined,
    medicineId: string,
    pharmacyId: string
  ): Promise<ICart> {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.medicineId.toString() === medicineId &&
        item.pharmacyId.toString() === pharmacyId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    this.recalculateTotals(cart);
    await cart.save();

    logger.info(`Item removed from cart for ${userId || sessionId}`);
    return cart;
  }

  // ============================================================
  // CLEAR CART
  // ============================================================

  async clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    logger.info(`Cart cleared for ${userId || sessionId}`);
  }

  // ============================================================
  // MERGE GUEST CART
  // ============================================================

  async mergeGuestCart(userId: string, sessionId: string, guestItems: any[]): Promise<ICart> {
    // ✅ Get or create user cart
    let userCart = await this.getCart(userId);
    if (!userCart) {
      userCart = await Cart.create({
        user: new mongoose.Types.ObjectId(userId),
        items: [],
        totalItems: 0,
        totalPrice: 0,
        status: 'active',
      });
    }

    // ✅ Get guest cart
    const guestCart = await this.getCart(undefined, sessionId);

    if (!guestCart || guestCart.items.length === 0) {
      // No guest cart, return user cart
      return userCart;
    }

    // ✅ Merge items
    for (const guestItem of guestCart.items) {
      const existingIndex = userCart.items.findIndex(
        (item) =>
          item.medicineId.toString() === guestItem.medicineId.toString() &&
          item.pharmacyId.toString() === guestItem.pharmacyId.toString()
      );

      if (existingIndex !== -1) {
        // Update quantity
        userCart.items[existingIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.items.push(guestItem);
      }
    }

    this.recalculateTotals(userCart);
    await userCart.save();

    // ✅ Delete guest cart
    await Cart.findByIdAndDelete(guestCart._id);

    logger.info(`Guest cart merged for user ${userId}`);
    return userCart;
  }

  // ============================================================
  // VALIDATE CART ON CHECKOUT
  // ============================================================

  async validateCartForCheckout(cart: ICart): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    for (const item of cart.items) {
      // ✅ Check if medicine still exists
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        errors.push(`Medicine "${item.medicineName}" no longer exists`);
        continue;
      }

      // ✅ Check if pharmacy still exists and has the medicine
      const pharmacy = await Pharmacy.findById(item.pharmacyId);
      if (!pharmacy) {
        errors.push(`Pharmacy "${item.pharmacyName}" no longer exists`);
        continue;
      }

      const inventoryItem = pharmacy.medicines.find(
        (med) => med.medicine.toString() === item.medicineId.toString()
      );
      if (!inventoryItem) {
        errors.push(`Medicine "${item.medicineName}" no longer available at this pharmacy`);
        continue;
      }

      // ✅ Check stock
      if (inventoryItem.quantity < item.quantity) {
        errors.push(`Only ${inventoryItem.quantity} of "${item.medicineName}" available`);
        continue;
      }

      // ✅ Check price difference
      if (inventoryItem.price !== item.price) {
        // Update price to current
        item.price = inventoryItem.price;
        errors.push(`Price for "${item.medicineName}" has changed to ${inventoryItem.price}`);
      }
    }

    // ✅ Recalculate totals after price updates
    if (errors.length > 0) {
      this.recalculateTotals(cart);
      await cart.save();
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ============================================================
  // HELPER: RECALCULATE TOTALS
  // ============================================================

  private recalculateTotals(cart: ICart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // ============================================================
  // ADMIN: CLEANUP EXPIRED CARTS
  // ============================================================

  async cleanupExpiredCarts(): Promise<number> {
    const result = await Cart.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    logger.info(`Cleaned up ${result.deletedCount} expired carts`);
    return result.deletedCount;
  }
}

export default new CartService();