'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/protected/RoleGuard';
import { getProposals } from '@/services/proposalService';
import { Proposal } from '@/types/proposal';
import { useAuth } from '@/context/AuthContext';

export default function ProposalsPage() {
  const router = useRouter();
  const { user } = useAuth(); // Нэвтэрсэн хэрэглэгчийн мэдээллийг авах
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await getProposals();
        setProposals(data);
      } catch (err: any) {
        console.error('Error fetching proposals:', err);
        setError('Төслүүдийн мэдээллийг татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  return (
    <RoleGuard allowedRoles={['RESEARCHER', 'REVIEWER', 'CHAIR', 'SECRETARY', 'ADMIN']}>
      <DashboardLayout>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Судалгааны төслүүд</h1>
            <button
              onClick={() => router.push('/proposals/new')}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors text-sm"
            >
              + Шинэ төсөл бүртгэх
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 text-center py-8">Ачаалж байна...</p>
          ) : proposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Одоогоор бүртгэгдсэн төсөл байхгүй байна.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                    <th className="p-4">Төслийн нэр</th>
                    <th className="p-4">Судлаач</th>
                    <th className="p-4">Төлөв</th>
                    <th className="p-4">Огноо</th>
                    <th className="p-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {proposals.map((item) => {
                    // Хэрэглэгчийн ID болон төслийн судлаачийн ID таарч байгаа эсэхийг шалгах
                    const isMine = String(user?.id) === String(item.researcher);

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors ${isMine ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span 
                              className={`font-medium ${
                                isMine 
                                  ? 'text-blue-800 underline decoration-blue-400 underline-offset-4' 
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </span>
                            {isMine && (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-200 rounded-full whitespace-nowrap">
                                Миний төсөл
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{item.researcher_name || '-'}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {item.status_display || item.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => router.push(`/proposals/${item.id}`)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                          >
                            Харах
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
