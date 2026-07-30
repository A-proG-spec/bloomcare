import React, { useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';


export const NotificationList: React.FC = () => {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications({ limit: 10 });
  }, [fetchNotifications]);

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-black font-outfit">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-[#22c55e] hover:text-[#16a34a] font-medium font-outfit"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="font-outfit">No notifications yet</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-[#d1f843]/10 border-l-4 border-l-[#d1f843]' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm text-black font-outfit">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-[#d1f843] rounded-full flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-words font-outfit">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 font-outfit">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="text-gray-400 hover:text-red-500 text-lg leading-none flex-shrink-0 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete notification"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="text-xs text-[#22c55e] hover:text-[#16a34a] mt-2 font-medium flex items-center gap-1 font-outfit"
                >
                  <FaCheck className="w-3 h-3" />
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};