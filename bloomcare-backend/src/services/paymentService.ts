import { stripe } from '../config/stripe';
import { environment } from '../config/enviroment';
import Payment from '../models/Payment';
import Order from '../models/Order';
import orderService from './orderService';
import notificationService from './notificationService';
import { logger } from '../config/logger';
import { Types } from 'mongoose';

interface IInitializePaymentData {
  orderId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerName: string;
  pharmacyName?: string;
  paymentMethod: 'card' | 'mobile_pay' | 'bank_transfer';
}

interface IVerifyPaymentData {
  paymentIntentId: string;
  orderId: string;
}

class PaymentService {
  /**
   * Initialize Stripe payment
   */
  async initializePayment(data: IInitializePaymentData) {
    const {
      orderId,
      amount,
      currency,
      customerEmail,
      customerName,
      pharmacyName,
      paymentMethod,
    } = data;

    try {
      if (!environment.STRIPE_SECRET_KEY) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Create payment record
      const payment = new Payment({
        order: new Types.ObjectId(orderId),
        user: order.user,
        pharmacy: order.pharmacy,
        amount: amount,
        currency: currency || environment.STRIPE_CURRENCY,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        transactionId: `pi_${orderId.slice(-6)}`,
        metadata: {
          orderId: orderId,
          pharmacyName: pharmacyName || '',
          customerEmail: customerEmail,
        },
      });

      await payment.save();

      // Create Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency || environment.STRIPE_CURRENCY,
        receipt_email: customerEmail,
        metadata: {
          orderId: orderId,
          pharmacyName: pharmacyName || '',
          platform: 'bloomcare',
          paymentId: payment._id.toString(),
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        statement_descriptor_suffix: 'BloomCare',
      });

      // Update payment with intent details
      payment.transactionId = paymentIntent.id;
      payment.paymentIntentId = paymentIntent.id;
      payment.paymentStatus = 'processing';
      await payment.save();

      // Update order with payment intent ID
      await Order.findByIdAndUpdate(orderId, {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        paymentMethod: 'online',
        paymentDetails: {
          transactionId: paymentIntent.id,
          paymentGateway: 'stripe',
        },
      });

      logger.info(`Stripe payment initialized for order ${orderId}: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        message: 'Payment initialized successfully',
      };
    } catch (error: any) {
      logger.error('Error initializing Stripe payment', {
        message: error.message,
        stack: error.stack,
        orderId: orderId,
      });
      throw new Error(error.message || 'Failed to initialize payment');
    }
  }

  /**
   * Confirm payment and deduct inventory (only for online orders)
   */
  async confirmPayment(orderId: string, paymentIntentId: string) {
    try {
      // Get order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        // Payment failed - cancel online order (no inventory to restore)
        await orderService.cancelOnlineOrder(
          orderId,
          paymentIntent.last_payment_error?.message || 'Payment failed'
        );
        
        return { success: false, message: 'Payment failed' };
      }

      // Get payment record
      const payment = await Payment.findOne({ paymentIntentId });
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Payment succeeded - confirm order and deduct inventory (only for online orders)
      let updatedOrder;
      if (order.paymentMethod === 'online') {
        updatedOrder = await orderService.confirmOrderAndDeductInventory(orderId);
      } else {
        // For COD orders, inventory is already deducted
        order.paymentStatus = 'paid';
        await order.save();
        updatedOrder = order;
      }

      // Update payment record
      payment.paymentStatus = 'paid';
      payment.paymentDetails = {
        chapaStatus: paymentIntent.status,
        paymentMethodUsed: paymentIntent.payment_method_types?.[0] || 'card',
        paidAt: new Date(),
      };
      await payment.save();

      // Send success notification (if not already sent by orderService)
      if (order.paymentMethod === 'online') {
        await notificationService.createNotification({
          userId: order.user.toString(),
          title: 'Payment Successful! 💳',
          message: `Your payment of ${payment.amount} ${payment.currency} for order #${order._id.toString().slice(-6)} has been confirmed.`,
          type: 'order',
          referenceId: order._id.toString(),
          referenceType: 'order',
          icon: '✅',
          link: `/orders/${order._id}`,
        });
      }

      logger.info(`Payment confirmed for order ${orderId}: ${paymentIntentId}`);
      return { success: true, order: updatedOrder };
    } catch (error: any) {
      logger.error('Error confirming payment:', error);
      
      // If payment confirmation fails, cancel the order
      try {
        await orderService.cancelOnlineOrder(orderId, 'Payment confirmation failed');
      } catch (cancelError) {
        logger.error('Error cancelling order after payment failure:', cancelError);
      }
      
      throw new Error(error.message || 'Failed to confirm payment');
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(orderId: string, reason?: string) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Only cancel online orders (COD orders handle failure differently)
      if (order.paymentMethod === 'online') {
        await orderService.cancelOnlineOrder(orderId, reason || 'Payment failed');
      } else {
        // For COD, just update payment status
        order.paymentStatus = 'failed';
        await order.save();
      }

      logger.info(`Payment failed for order ${orderId}: ${reason || 'Unknown reason'}`);
      return { success: true, order };
    } catch (error: any) {
      logger.error('Error handling payment failure:', error);
      throw new Error(error.message || 'Failed to handle payment failure');
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const payment = await Payment.findOne({ order: orderId });
    return {
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentIntentId: order.paymentIntentId,
      paymentDetails: order.paymentDetails,
      payment: payment || null,
    };
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    const [totalPayments, totalRevenue, pendingPayments, successfulPayments, failedPayments] = await Promise.all([
      Payment.countDocuments(),
      Payment.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.countDocuments({ paymentStatus: 'pending' }),
      Payment.countDocuments({ paymentStatus: 'paid' }),
      Payment.countDocuments({ paymentStatus: 'failed' }),
    ]);

    return {
      totalPayments,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingPayments,
      successfulPayments,
      failedPayments,
    };
  }
}

export default new PaymentService();