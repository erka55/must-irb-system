'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Хянах самбар', path: '/dashboard' },
    { label: 'Төслүүд', path: '/proposals' },
    { label: '+ Шинэ төсөл', path: '/proposals/new' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Дээд хэсгийн тогтмол Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-900 tracking-wide">MUST IRB</span>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
            Систем
          </span>
        </div>

        {/* Баруун дээд хэсгийн мэдээлэл */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Хэрэглэгч'}
            </p>
            <p className="text-xs text-gray-500">{user?.role || 'RESEARCHER'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 font-medium rounded hover:bg-red-100 transition-colors border border-red-200"
          >
            Гарах
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Зүүн талын тогтмол Панел */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-[57px] h-[calc(100vh-57px)]">
          {/* Нэвтэрсэн хэрэглэгчийн мэдээлэл */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0">
                {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </p>
                <p className="text-xs text-blue-600 font-medium">{user?.role || 'Хэрэглэгч'}</p>
              </div>
            </div>
          </div>

          {/* Навигацийн цэс */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Баруун талын үндсэн контент */}
        <main className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
