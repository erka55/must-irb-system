'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import RoleGuard from '../../src/components/protected/RoleGuard';
import { getProposals } from '../../src/services/proposalService';
import { Proposal } from '../../src/types/proposal';

export default function ResearcherProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await getProposals();
        setProposals(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Proposals fetch error:', err);
        setError('Хүсэлтүүдийн мэдээллийг татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={['RESEARCHER', 'SYSADMIN']}>
        <div className="space-y-6">
          {/* Header & Шинэ төсөл үүсгэх товч */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Миний судалгааны төслүүд</h1>
              <p className="text-sm text-gray-500">Ёс зүйн хороонд мэдүүлсэн судалгааны ажил болон тэдгээрийн шийдвэрлэх төлөв</p>
            </div>
            <button
              onClick={() => router.push('/proposals/new')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Шинэ төсөл мэдүүлэх</span>
            </button>
          </div>

          {/* Төслийн хүснэгт */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Ачаалж байна...</div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
            ) : proposals.length === 0 ? (
              <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg space-y-3">
                <p className="text-base font-medium">Одоогоор илгээсэн төсөл байхгүй байна.</p>
                <button
                  onClick={() => router.push('/proposals/new')}
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Шинэ судалгааны төсөл илгээх ↗
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Төслийн №</th>
                      <th className="px-4 py-3">Судалгааны сэдэв</th>
                      <th className="px-4 py-3">Төлөв</th>
                      <th className="px-4 py-3">Илгээсэн огноо</th>
                      <th className="px-4 py-3 text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {proposals.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/proposals/${item.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-semibold text-indigo-600">
                          {item.application_no || `#${item.id}`}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {item.status_display || item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(
                            item.submitted_at || item.created_at || item.updated_at || Date.now()
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/proposals/${item.id}`);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-xs"
                          >
                            Дэлгэрэнгүй ↗
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
