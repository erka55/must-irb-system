'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown цэснээс гадуур дарахад цэсийг хаах
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Хэрэглэгчийн ролийг уншихад хялбар текст болгох
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'CHAIR':
        return 'Chair, IRB Board';
      case 'SECRETARY':
        return 'Secretary, IRB Board';
      case 'REVIEWER':
        return 'Reviewer';
      case 'RESEARCHER':
        return 'Researcher';
      default:
        return role || 'Guest';
    }
  };

  // Хэрэглэгчийн овог нэрийг бэлдэх
  const displayName = user
    ? user.first_name && user.last_name
      ? `${user.first_name[0]}. ${user.last_name} (${user.username})`
      : user.username
    : 'Хэрэглэгч';

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      {/* Лого & Системийн Нэр */}
      <div className="flex items-center space-x-3">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            IR
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">
            IRB Proposal Management System
          </span>
        </Link>
      </div>

      {/* Баруун дээд талын хэрэглэгчийн мэдээлэл & Хэрэгслүүд */}
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            {/* Хэрэглэгчийн товчлуур */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 rounded-lg border border-gray-200 p-1.5 px-3 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              {/* Профайл зураг / Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                {user.username ? user.username[0].toUpperCase() : 'U'}
              </div>

              {/* Нэр & Роль */}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-gray-800">
                  {displayName}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* Сумны дүрс */}
              <svg
                className={`h-4 w-4 text-gray-500 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown цэс */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs text-gray-500">Нэвтэрсэн:</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.email || user.username}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign out (Гарах)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  );
}
