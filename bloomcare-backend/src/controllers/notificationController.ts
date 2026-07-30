import { Request, Response } from "express";
import { z } from "zod";
import notificationService from "../services/notificationService";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getNotificationsQuerySchema,
  markNotificationsAsReadSchema,
} from "../validations/notificationValidation";

class NotificationController {
  // Get user's notifications
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const query = (req as Request).query;
      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;
      const isRead = query.isRead === 'true' ? true : 
                     query.isRead === 'false' ? false : undefined;

      const result = await notificationService.getUserNotifications(
        user._id.toString(),
        page,
        limit,
        isRead
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
        error: error.message,
      });
    }
  }

  // Get unread count (for badge)
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await notificationService.getUnreadCount(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to get unread count",
        error: error.message,
      });
    }
  }

  // Get a single notification
  async getNotificationById(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const notificationId = (req as Request).params.id as string;
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      const notification = await notificationService.getNotificationById(
        notificationId,
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error('Error getting notification:', error);
      return res.status(404).json({
        success: false,
        message: error.message || "Notification not found",
      });
    }
  }

  // Mark notification as read
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const notificationId = (req as Request).params.id as string;
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      const notification = await notificationService.markAsRead(
        notificationId,
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to mark notification as read",
      });
    }
  }

  // Mark notification as unread
  async markAsUnread(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const notificationId = (req as Request).params.id as string;
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      const notification = await notificationService.markAsUnread(
        notificationId,
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "Notification marked as unread",
        data: notification,
      });
    } catch (error: any) {
      console.error('Error marking notification as unread:', error);
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to mark notification as unread",
      });
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access body
      const validatedData = markNotificationsAsReadSchema.parse((req as Request).body);

      if (validatedData.markAll) {
        const result = await notificationService.markAllAsRead(
          user._id.toString()
        );
        return res.status(200).json({
          success: true,
          message: "All notifications marked as read",
          data: result,
        });
      }

      if (!validatedData.notificationIds || validatedData.notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Notification IDs are required or markAll must be true",
        });
      }

      const result = await notificationService.markMultipleAsRead(
        validatedData.notificationIds,
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "Notifications marked as read",
        data: result,
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

      console.error('Error marking multiple notifications as read:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
        error: error.message,
      });
    }
  }

  // Mark all as read (dedicated endpoint)
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await notificationService.markAllAsRead(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: result,
      });
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark all as read",
        error: error.message,
      });
    }
  }

  // Delete a notification
  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // ✅ FIX: Cast to Request to access params
      const notificationId = (req as Request).params.id as string;
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Notification ID is required",
        });
      }

      const result = await notificationService.deleteNotification(
        notificationId,
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to delete notification",
      });
    }
  }

  // Delete all notifications
  async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await notificationService.deleteAllNotifications(
        user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} notifications`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notifications",
        error: error.message,
      });
    }
  }

  // Admin: Delete old notifications
  async deleteOldNotifications(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin only.",
        });
      }

      // ✅ FIX: Cast to Request to access query
      const { days } = (req as Request).query;
      const result = await notificationService.deleteOldNotifications(
        parseInt(days as string) || 30
      );

      return res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} old notifications`,
        data: result,
      });
    } catch (error: any) {
      console.error('Error deleting old notifications:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete old notifications",
        error: error.message,
      });
    }
  }
}

export default new NotificationController();