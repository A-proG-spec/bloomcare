import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import paymentService from '../services/paymentService';
import Order from '../models/Order';
import Payment from '../models/Payment';
import { logger } from '../config/logger';
import { stripe } from '../config/stripe';
import { environment } from '../config/enviroment';

// Helper function for type safety
const getString = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] : value || '';
};

const initializePaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentMethod: z.enum(['card', 'mobile_pay', 'bank_transfer']).default('card'),
});

const verifyPaymentSchema = z.object({
  payment_intent_id: z.string().min(1, 'Payment intent ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
});


export class PaymentController {
  /**
   * Initialize Stripe payment
   * POST /api/payments/initialize
   */
  async initializePayment(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const validatedData = initializePaymentSchema.parse((req as Request).body);
      const { orderId, paymentMethod } = validatedData;

      const order = await Order.findById(orderId).populate('pharmacy', 'name');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.user.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to pay for this order',
        });
      }

      if (order.paymentStatus === 'paid' || order.status === 'Confirmed') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid',
        });
      }

      const result = await paymentService.initializePayment({
        orderId: orderId,
        amount: order.totalPrice,
        customerEmail: user.email,
        customerName: user.fullName,
        pharmacyName: (order.pharmacy as any)?.name || 'Unknown',
        paymentMethod: paymentMethod,
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: 'Payment initialized successfully',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      logger.error('Error initializing payment', {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to initialize payment',
      });
    }
  }

  /**
   * Verify payment (called after successful payment)
   * GET /api/payments/verify?payment_intent_id=...&orderId=...
   */
  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const validatedData = verifyPaymentSchema.parse((req as Request).query);
      const { payment_intent_id, orderId } = validatedData;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (order.user.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order',
        });
      }

      const result = await paymentService.confirmPayment(orderId, payment_intent_id);

      return res.status(200).json({
        success: true,
        data: result,
        message: result.success ? 'Payment verified successfully' : 'Payment verification failed',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      logger.error('Error verifying payment', {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to verify payment',
      });
    }
  }

  /**
   * Get payment status for an order
   * GET /api/payments/status/:orderId
   */
  async getPaymentStatus(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
      }

      const orderId = getString((req as Request).params.orderId);
      
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Check authorization
      if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this order',
        });
      }

      // Now get payment status
      const result = await paymentService.getPaymentStatus(orderId);

      return res.status(200).json({
        success: true,
        data: {
          ...result,
          order: {
            _id: order._id,
            status: order.status,
            totalPrice: order.totalPrice,
          }
        },
      });
    } catch (error: any) {
      logger.error('Error getting payment status', {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment status',
      });
    }
  }

  /**
   * Webhook handler for Stripe
   * POST /api/payments/stripe-webhook
   */
  async webhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      logger.warn('Missing stripe-signature header');
      return res.status(400).send('Missing stripe-signature header');
    }

    if (!environment.STRIPE_WEBHOOK_SECRET) {
      logger.error('STRIPE_WEBHOOK_SECRET is not configured');
      return res.status(500).send('Webhook secret not configured');
    }

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        environment.STRIPE_WEBHOOK_SECRET
      );

      logger.info(`Received Stripe webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object);
          break;

        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }

      return res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error(`Webhook error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      logger.warn('Missing orderId in payment intent metadata');
      return;
    }

    logger.info(`Processing successful payment for order ${orderId}`);
    try {
      const result = await paymentService.confirmPayment(orderId, paymentIntent.id);
      if (result.success) {
        logger.info(`Payment succeeded and inventory deducted for order ${orderId}`);
      }
    } catch (error) {
      logger.error(`Error processing successful payment for order ${orderId}:`, error);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      logger.warn('Missing orderId in payment intent metadata');
      return;
    }

    logger.info(`Processing failed payment for order ${orderId}`);
    try {
      await paymentService.handlePaymentFailure(
        orderId,
        paymentIntent.last_payment_error?.message || 'Payment failed'
      );
      logger.info(`Payment failed for order ${orderId}`);
    } catch (error) {
      logger.error(`Error processing failed payment for order ${orderId}:`, error);
    }
  }

  private async handlePaymentIntentCanceled(paymentIntent: any) {
    const orderId = paymentIntent.metadata?.orderId;
    if (!orderId) {
      logger.warn('Missing orderId in payment intent metadata');
      return;
    }

    logger.info(`Payment canceled for order ${orderId}`);
    try {
      await paymentService.handlePaymentFailure(orderId, 'Payment canceled');
    } catch (error) {
      logger.error(`Error processing canceled payment for order ${orderId}:`, error);
    }
  }


  async getPaymentStats(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin only.',
        });
      }

      const stats = await paymentService.getPaymentStats();

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error getting payment stats', {
        message: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment statistics',
      });
    }
  }
}

export default new PaymentController();