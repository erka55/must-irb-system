'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../src/components/layout/DashboardLayout';
import RoleGuard from '../../src/components/protected/RoleGuard';
import { getProposals } from '../../src/services/proposalService';
import { Proposal } from '../../src/types/proposal';

export default function DashboardPage() {
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

  const totalCount = proposals.length;
  const inReviewCount = proposals.filter((p) => Array.isArray(p.reviewers) && p.reviewers.length > 0).length;
  const pendingReviewCount = proposals.filter((p) => !Array.isArray(p.reviewers) || p.reviewers.length === 0).length;

  return (
    <DashboardLayout>
      {/* Нарийн бичиг (SECRETARY) болон ДАРГА (CHAIR) ролд зориулсан хамгаалалт */}
      <RoleGuard allowedRoles={['SECRETARY', 'CHAIR', 'SYSADMIN']}>
        <div className="space-y-6">
          {/* Статистик картууд */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white p-5 border border-gray-200 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Нийт хүсэлт
              </p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalCount}</p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-amber-200 bg-amber-50/40 shadow-sm">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Шүүмжлэгч томилогдоогүй
              </p>
              <p className="text-3xl font-extrabold text-amber-900 mt-2">{pendingReviewCount}</p>
            </div>

            <div className="rounded-xl bg-white p-5 border border-indigo-200 bg-indigo-50/40 shadow-sm">
              <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                Шүүмжлэгч томилогдсон
              </p>
              <p className="text-3xl font-extrabold text-indigo-900 mt-2">{inReviewCount}</p>
            </div>
          </div>

          {/* Хүсэлтүүдийн хүснэгт */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Ирсэн хүсэлтүүдийн жагсаалт
            </h2>

            {loading ? (
              <div className="py-8 text-center text-gray-500">Ачаалж байна...</div>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
            ) : proposals.length === 0 ? (
              <div className="py-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
                Одоогоор илгээсэн хүсэлт байхгүй байна.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Хүсэлтийн №</th>
                      <th className="px-4 py-3">Сэдэв / Нэр</th>
                      <th className="px-4 py-3">Шүүмжлэгчид</th>
                      <th className="px-4 py-3">Төлөв</th>
                      <th className="px-4 py-3">Огноо</th>
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
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              Array.isArray(item.reviewers) && item.reviewers.length > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {Array.isArray(item.reviewers) && item.reviewers.length > 0
                              ? `👤 ${item.reviewers.length} томилогдсон`
                              : 'Хоосон'}
                          </span>
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
                            Үзэх ↗
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
