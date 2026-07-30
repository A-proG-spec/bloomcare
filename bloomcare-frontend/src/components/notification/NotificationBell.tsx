import React, { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { NotificationList } from './NotificationList';
import { FaBell } from 'react-icons/fa';

export const NotificationBell: React.FC = () => {
  const { 
    unreadCount, 
    isOpen, 
    toggleNotifications, 
    closeNotifications,
    fetchUnreadCount 
  } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUnreadCount = async () => {
      await fetchUnreadCount();
      setIsLoading(false);
    };
    loadUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        closeNotifications();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeNotifications]);

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <FaBell className="w-5 h-5" />
        {!isLoading && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#d1f843] text-black text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl z-50 border border-gray-200 max-h-[500px] flex flex-col">
          <NotificationList />
        </div>
      )}
    </div>
  );
};