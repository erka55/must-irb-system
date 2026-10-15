'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '../../services/auth';
import { getProposals, Proposal } from '../../services/proposals';

export default function DashboardPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await getProposals();
        setProposals(data);
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              ШУТИС - IRB Удирдах хэсэг
            </h1>
            <p className="text-sm text-gray-500">Ёс зүйн хороонд илгээсэн хүсэлтүүд</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/proposals/new')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              + Шинэ хүсэлт үүсгэх
            </button>
            <button
              onClick={() => logout()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition-colors"
            >
              Гарах
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Миний хүсэлтүүд
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
    </div>
  );
}
