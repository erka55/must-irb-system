'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-gray-500 text-center py-8">Хандах эрхийг шалгаж байна...</p>;
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 m-6">
        Нэвтрээгүй байна. Системд дахин нэвтэрнэ үү.
      </div>
    );
  }

  const userRole = (user.role || '').toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());

  if (userRole && !normalizedAllowedRoles.includes(userRole)) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg border border-red-200 m-6">
        Та энэ хуудсанд нэвтрэх эрхгүй байна. (Одоогийн эрх: <span className="font-bold">{user.role || 'Тодорхойгүй'}</span>)
      </div>
    );
  }

  return <>{children}</>;
}
