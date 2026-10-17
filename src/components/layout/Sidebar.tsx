'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon?: string;
}

const navItems: NavItem[] = [
  // 1. Судлаачийн цэс
  { label: 'Хянагдаж буй төслүүд', href: '/proposals', roles: ['RESEARCHER'], icon: '📁' },
  { label: '+ Шинэ төсөл илгээх', href: '/proposals/new', roles: ['RESEARCHER'], icon: '➕' },

  // 2. Нарийн бичгийн цэс
  { label: 'Удирдах хэсэг', href: '/dashboard', roles: ['SECRETARY'], icon: '📊' },
  { label: 'Ирсэн төслүүд', href: '/secretary/incoming', roles: ['SECRETARY'], icon: '📥' },
  { label: 'Хуралдаан удирдах', href: '/secretary/meetings', roles: ['SECRETARY'], icon: '📅' },

  // 3. Шүүмжлэгчийн цэс
  { label: 'Миний шүүмжүүд', href: '/reviewer/assigned', roles: ['REVIEWER'], icon: '📝' },

  // 4. Даргын цэс
  { label: 'Даргын хяналт', href: '/chair/dashboard', roles: ['CHAIR'], icon: '🏛️' },
  { label: 'Батлах шийдвэрүүд', href: '/chair/approvals', roles: ['CHAIR'], icon: '✅' },

  // 5. Админы цэс
  { label: 'Хэрэглэгчийн удирдлага', href: '/admin/users', roles: ['SYSADMIN'], icon: '👥' },
  { label: 'Системийн тохиргоо', href: '/admin/settings', roles: ['SYSADMIN'], icon: '⚙️' },
  { label: 'Системийн лог', href: '/admin/logs', roles: ['SYSADMIN'], icon: '📜' },

  // Нийтлэг цэс
  { label: 'Архив', href: '/archive', roles: ['SECRETARY', 'CHAIR', 'SYSADMIN'], icon: '📦' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  // Нэвтэрсэн хэрэглэгчийн рольд тохирох цэсүүдийг шүүж авна
  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        {/* Лого & Системийн нэр */}
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-indigo-400">ШУТИС - IRB</h2>
          <p className="text-xs text-slate-400 mt-1">Ёс зүйн хорооны систем</p>
        </div>

        {/* Навигацийн цэсүүд */}
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Хэрэглэгчийн ролийг доод хэсэгт харуулах */}
      <div className="border-t border-slate-800 pt-4 px-2">
        <p className="text-xs text-slate-400">Системд нэвтэрсэн:</p>
        <p className="text-sm font-semibold text-slate-200 truncate">{user.username}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-900/60 text-indigo-300">
          {user.role}
        </span>
      </div>
    </aside>
  );
}
