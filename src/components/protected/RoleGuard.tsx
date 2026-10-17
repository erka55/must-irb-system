'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user, hasRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || !hasRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Хандах эрх хязгаарлагдсан</h3>
        <p className="mt-1 text-sm text-gray-500">
          Та энэ хэсгийг үзэх эрхгүй байна. Таны роль: <span className="font-semibold text-gray-700">{user?.role || 'Тодорхойгүй'}</span>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
