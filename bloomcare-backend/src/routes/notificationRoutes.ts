import { Router } from "express";
import notificationController from "../controllers/notificationController";
import { authenticate, authorize } from "../middleware/authMiddleware";
import { validate } from "../middleware/validateMiddleware";
import {
  getNotificationsQuerySchema,
  markNotificationsAsReadSchema,
} from "../validations/notificationValidation";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get notifications with pagination & filters - REMOVE validation middleware
router.get(
  "/",
  // validate(getNotificationsQuerySchema.partial()), // <-- REMOVE THIS LINE
  notificationController.getNotifications
);

// Get unread count (for badge)
router.get(
  "/unread-count",
  notificationController.getUnreadCount
);

// Get single notification
router.get(
  "/:id",
  notificationController.getNotificationById
);

// Mark single notification as read
router.put(
  "/:id/read",
  notificationController.markAsRead
);

// Mark single notification as unread
router.put(
  "/:id/unread",
  notificationController.markAsUnread
);

// Mark multiple as read or all as read
router.post(
  "/mark-read",
  validate(markNotificationsAsReadSchema),
  notificationController.markMultipleAsRead
);

// Mark all as read (dedicated)
router.post(
  "/mark-all-read",
  notificationController.markAllAsRead
);

// Delete a notification
router.delete(
  "/:id",
  notificationController.deleteNotification
);

// Delete all notifications
router.delete(
  "/",
  notificationController.deleteAllNotifications
);

// Admin only: Delete old notifications
router.delete(
  "/admin/cleanup",
  authorize("admin"),
  notificationController.deleteOldNotifications
);

export default router;