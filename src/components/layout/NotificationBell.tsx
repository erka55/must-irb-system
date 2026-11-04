'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Мэдэгдлийн тоо болон жагсаалтыг татах
  const fetchNotifications = async () => {
    // sessionStorage-оос токеноо авна
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    if (!token) return;

    try {
      // Уншаагүй тоог авах
      const countRes = await axios.get('http://localhost:8000/api/notifications/unread_count/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(countRes.data.unread_count);

      // Хамгийн сүүлийн мэдэгдлүүдийг авах
      const listRes = await axios.get('http://localhost:8000/api/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(listRes.data);
    } catch (error) {
      console.error('Мэдэгдэл татахад алдаа гарлаа:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // 30 секунд тутамд шинэчлэх
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Дэлгэцийн өөр газар дарахад dropdown-ийг хаах
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Нэг мэдэгдлийг уншсан болгох
  const markAsRead = async (id: number) => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;
    try {
      await axios.post(`http://localhost:8000/api/notifications/${id}/mark_as_read/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Алдаа гарлаа:', error);
    }
  };

  // Бүх мэдэгдлийг уншсан болгох
  const markAllAsRead = async () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;
    try {
      await axios.post('http://localhost:8000/api/notifications/mark_all_as_read/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      setIsOpen(false);
    } catch (error) {
      console.error('Алдаа гарлаа:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Хонхны Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
      >
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Цэс */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Мэдэгдлүүд</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Бүгдийг уншсан
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">
                Танд шинэ мэдэгдэл алга байна.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${notif.is_read ? 'opacity-60' : 'bg-blue-50'}`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                    {!notif.is_read && (
                      <CheckCircleIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString('mn-MN')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
