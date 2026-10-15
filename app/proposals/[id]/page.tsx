'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getProposalDetail, assignReviewer, getReviewers, Proposal } from '../../../services/proposals';

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const proposalId = parseInt(resolvedParams.id, 10);

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<number | string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!proposalId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getProposalDetail(proposalId);
        setProposal(data);

        // Шүүмжлэгчдийн жагсаалтыг унших
        try {
          const revList = await getReviewers();
          setReviewers(revList);
        } catch (e) {
          console.warn('Шүүмжлэгчдийн жагсаалтыг татахад эрх хүрэхгүй эсвэл хоосон байна.');
        }
      } catch (err: any) {
        console.error('Fetch detail error:', err);
        setError(err.response?.data?.detail || 'Хүсэлтийн мэдээллийг ачаалахад алдаа гарлаа.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [proposalId]);

  const handleAssign = async () => {
    if (!selectedReviewer) return;
    setAssigning(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await assignReviewer(proposalId, Number(selectedReviewer));
      setSuccessMsg(res.detail || 'Шүүмжлэгч амжилттай томилогдлоо.');
      // Шинэчлэгдсэн төлвийг дахин авах
      const updated = await getProposalDetail(proposalId);
      setProposal(updated);
    } catch (err: any) {
      console.error('Assign error:', err);
      setError(err.response?.data?.detail || 'Шүүмжлэгч хуваарилахад алдаа гарлаа.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Мэдээллийг ачаалж байна...</div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Dashboard руу буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Буцах товч ба Гарчиг */}
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-indigo-600">
                {proposal?.application_no || `IRB-${proposal?.id}`}
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {proposal?.status_display || proposal?.status}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{proposal?.title}</h1>
            {proposal?.researcher_name && (
              <p className="mt-1 text-sm text-gray-500">
                Судлаач: {proposal.researcher_name}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Буцах
          </button>
        </div>

        {/* Нарийн бичиг / Даргын Шүүмжлэгч хуваарилах хэсэг */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-amber-900 mb-2">
            ⚙️ Нарийн бичгийн үйлдэл: Шүүмжлэгч (Reviewer) томилох
          </h2>
          <p className="text-xs text-amber-700 mb-4">
            Энэхүү судалгааны хүсэлтийг хянаж, үнэлгээ хийх Шүүмжлэгч гишүүнийг сонгоно уу.
          </p>

          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-100 p-3 text-xs text-green-700">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">-- Шүүмжлэгчийг сонгоно уу --</option>
              {reviewers.map((rev) => (
                <option key={rev.id} value={rev.id}>
                  {rev.first_name || rev.username} ({rev.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedReviewer || assigning}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {assigning ? 'Томилж байна...' : 'Шүүмжлэгчээр томилох'}
            </button>
          </div>
        </div>

        {/* Үндсэн мэдээлэл (Summary & Methodology) */}
        <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Товч хураангуй (Summary)
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {proposal?.summary || 'Мэдээлэл байхгүй.'}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">
              Судалгааны арга зүй (Methodology)
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {proposal?.methodology || 'Мэдээлэл байхгүй.'}
            </p>
          </div>
        </div>

        {/* Хавсаргасан баримт бичгүүд */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Хавсаргасан баримт бичгүүд
          </h2>
          {proposal?.documents && proposal.documents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {proposal.documents.map((doc: any) => (
                <li key={doc.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {doc.document_type_display || doc.document_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      Оруулсан: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Татаж харах ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Хавсаргасан баримт бичиг байхгүй байна.</p>
          )}
        </div>

        {/* Ирсэн шүүмж болон санал дүгнэлтүүд */}
        {proposal?.reviews && proposal.reviews.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
              Шүүмжлэгчдийн санал ба дүгнэлт
            </h2>
            <div className="space-y-4">
              {proposal.reviews.map((rev: any) => (
                <div key={rev.id} className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800">
                      Шүүмжлэгч: {rev.reviewer_name || 'Нэргүй'}
                    </span>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {rev.decision_display || rev.decision}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {rev.comments || 'Сэтгэгдэл бичээгүй байна.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
