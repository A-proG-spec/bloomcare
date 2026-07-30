import Notification from "../models/Notification";
import { logger } from "../config/logger";

interface ICreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type?: "order" | "pharmacy" | "review" | "system" | "promotion";
  referenceId?: string;
  referenceType?: string;
  icon?: string;
  link?: string;
}

class NotificationService {
  // Create a notification
  async createNotification(data: ICreateNotificationData) {
    const notification = await Notification.create({
      user: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "system",
      referenceId: data.referenceId,
      referenceType: data.referenceType,
      icon: data.icon || "📢",
      link: data.link,
      isRead: false,
    } as any);

    logger.info(`Notification created for user ${data.userId}: ${data.title}`);

    return notification;
  }

  // Get user notifications with pagination and filters
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isRead?: boolean
  ) {
    const query: any = { user: userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query),
    ]);

    // Get unread count
    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    } as any);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        unreadCount,
      },
    };
  }

  // Get a single notification by ID
  async getNotificationById(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    } as any);

    if (!notification) {
      throw new Error("Notification not found");
    }

    return notification;
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    } as any);

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);

    return notification;
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    } as any);

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.isRead = false;
    await notification.save();

    logger.info(`Notification ${notificationId} marked as unread by user ${userId}`);

    return notification;
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[], userId: string) {
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        user: userId,
      } as any,
      { isRead: true } as any
    );

    logger.info(`${result.modifiedCount} notifications marked as read for user ${userId}`);

    return { modifiedCount: result.modifiedCount };
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string) {
    const result = await Notification.updateMany(
      { user: userId, isRead: false } as any,
      { isRead: true } as any
    );

    logger.info(`All notifications marked as read for user ${userId}. ${result.modifiedCount} updated`);

    return { modifiedCount: result.modifiedCount };
  }

  // Delete a notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    } as any);

    if (!notification) {
      throw new Error("Notification not found");
    }

    await Notification.findByIdAndDelete(notificationId);

    logger.info(`Notification ${notificationId} deleted by user ${userId}`);

    return { success: true, message: "Notification deleted successfully" };
  }

  // Delete all notifications for a user
  async deleteAllNotifications(userId: string) {
    const result = await Notification.deleteMany({ user: userId } as any);

    logger.info(`${result.deletedCount} notifications deleted for user ${userId}`);

    return { deletedCount: result.deletedCount };
  }

  // Get unread count only (for badge)
  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    } as any);

    return { unreadCount: count };
  }

  // Delete old notifications (admin utility)
  async deleteOldNotifications(days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
    } as any);

    logger.info(`${result.deletedCount} old notifications deleted`);

    return { deletedCount: result.deletedCount };
  }
}

export default new NotificationService();