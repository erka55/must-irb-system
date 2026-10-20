'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/components/protected/RoleGuard';
import { getProposalById } from '@/services/proposalService';
import { Proposal } from '@/types/proposal';

function ProposalDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const data = await getProposalById(id);
        setProposal(data);
      } catch (err: any) {
        console.error('Error fetching proposal detail:', err);
        setError('Төслийн мэдээллийг татахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProposal();
    }
  }, [id]);

  if (loading) return <p className="text-gray-500 text-center py-8">Ачаалж байна...</p>;
  if (error) return <div className="p-3 mb-4 text-red-700 bg-red-100 rounded border border-red-200">{error}</div>;
  if (!proposal) return <p className="text-gray-500 text-center py-8">Төсөл олдсонгүй.</p>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="border-b pb-4">
        <button
          onClick={() => router.back()}
          className="mb-3 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
        >
          ← Буцах
        </button>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Үүсгэсэн огноо: {proposal.created_at ? new Date(proposal.created_at).toLocaleDateString() : '-'}
            </p>
            {proposal.researcher_name && (
              <p className="text-sm text-gray-600 mt-1">
                Судлаач: <span className="font-semibold">{proposal.researcher_name}</span>
              </p>
            )}
          </div>
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shrink-0">
            {proposal.status_display || proposal.status}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Товч агуулга / Хураангуй</h3>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed">
            {proposal.summary || 'Хураангуй мэдээлэл одоогоор бичигдээгүй байна.'}
          </div>
        </div>

        {proposal.reviewers && proposal.reviewers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Хуваарилагдсан шүүмжлэгчид</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {proposal.reviewers.map((reviewer) => (
                <div key={reviewer.id} className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
                  <p className="font-medium text-gray-800">
                    {reviewer.first_name} {reviewer.last_name}
                  </p>
                  <p className="text-gray-500 text-xs">{reviewer.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Хавсаргасан баримт бичгүүд (Протокол / Маягт)</h3>
          {proposal.documents && proposal.documents.length > 0 ? (
            <ul className="divide-y divide-gray-200 border rounded-md bg-white">
              {proposal.documents.map((doc, index) => {
                const fileName = doc.document_type_display || `Баримт бичиг ${index + 1}`;
                return (
                  <li key={doc.id || index} className="p-3 flex justify-between items-center text-sm hover:bg-gray-50">
                    <div>
                      <span className="text-gray-800 font-medium">{fileName}</span>
                      {doc.uploaded_at && (
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Хуулсан: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {doc.file ? (
                      <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 font-medium text-xs rounded hover:bg-blue-100 transition-colors"
                      >
                        Татах / Харах
                      </a>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Файл байхгүй</span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border">
              Хавсаргасан баримт бичиг байхгүй байна.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <RoleGuard allowedRoles={['RESEARCHER', 'REVIEWER', 'CHAIR', 'SECRETARY', 'ADMIN']}>
      <DashboardLayout>
        <div className="p-6 max-w-5xl mx-auto">
          <Suspense fallback={<p className="text-gray-500 text-center py-8">Ачаалж байна...</p>}>
            <ProposalDetailContent params={params} />
          </Suspense>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
