'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../lib/api';

interface UserType {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface ReviewType {
  id: number;
  reviewer: UserType;
  comments: string;
  recommendation: string;
  created_at: string;
}

interface ProposalDetail {
  id: number;
  title: string;
  summary?: string;
  status?: string;
  status_display?: string;
  researcher_name?: string;
  reviewers?: UserType[];
  reviews?: ReviewType[];
  created_at?: string;
}

export default function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();

  const resolvedParams = params instanceof Promise ? use(params) : params;
  const id = resolvedParams?.id;

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [availableReviewers, setAvailableReviewers] = useState<UserType[]>([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');

  const [comments, setComments] = useState('');
  const [recommendation, setRecommendation] = useState('APPROVED');

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchProposal = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/proposals/${id}/`);
      setProposal(res.data);
    } catch (err: any) {
      console.error('Error loading proposal:', err);
      if (err.response?.status === 404) {
        setError('Энэ судалгааны хүсэлт олдсонгүй эсвэл үзэх эрхгүй байна.');
      } else {
        setError('Төслийн мэдээллийг татахад алдаа гарлаа.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const res = await api.get('/users/?role=REVIEWER');
      setAvailableReviewers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  useEffect(() => {
    if (!id || !user) return;

    fetchProposal();

    if (['SECRETARY', 'CHAIR', 'SECRETARY_CHAIR'].includes(user.role || '')) {
      fetchReviewers();
    }
  }, [id, user]);

  const handleAssignReviewer = async () => {
    if (!selectedReviewerId) return;
    setActionLoading(true);
    try {
      await api.post(`/proposals/${id}/assign-reviewer/`, {
        reviewer_id: selectedReviewerId,
      });
      setSelectedReviewerId('');
      await fetchProposal();
    } catch (err) {
      alert('Шүүмжлэгч томилоход алдаа гарлаа.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/reviews/', {
        proposal: id,
        comments,
        recommendation,
      });
      setComments('');
      await fetchProposal();
      alert('Дүгнэлт амжилттай хадгалагдлаа.');
    } catch (err) {
      alert('Дүгнэлт хадгалахад алдаа гарлаа.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-500">Мэдээлэл ачаалж байна...</div>;
  }

  if (error || !proposal) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error || 'Хүсэлт олдсонгүй.'}</div>
        <button onClick={() => router.back()} className="text-sm text-indigo-600 font-medium hover:underline">
          ← Буцах
        </button>
      </div>
    );
  }

  const isSecretaryOrChair = user && ['SECRETARY', 'CHAIR', 'SECRETARY_CHAIR'].includes(user.role || '');
  const isReviewer = user?.role === 'REVIEWER';

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <button onClick={() => router.back()} className="text-xs text-indigo-600 font-semibold mb-1 block hover:underline">
            ← ЖАГСААЛТ РУУ БУЦАХ
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{proposal.title}</h1>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold uppercase">
          {proposal.status_display || proposal.status || 'ХҮНДЭТГЭЖ БУЙ'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase mb-3">Хураангуй (Summary)</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{proposal.summary || 'Хураангуй байхгүй'}</p>
          </div>

          {/* Reviewer Section */}
          {isReviewer && (
            <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-indigo-900 uppercase">Шүүмжийн дүгнэлт оруулах</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Шийдвэрийн санал</label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                  >
                    <option value="APPROVED">Зөвшөөрөх (Approved)</option>
                    <option value="REVISION_REQUIRED">Засвар шаардлагатай (Revision Required)</option>
                    <option value="REJECTED">Татгалзах (Rejected)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Санал / Дүгнэлт</label>
                  <textarea
                    rows={4}
                    required
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
                    placeholder="Дүгнэлтээ бичнэ үү..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Илгээж байна...' : 'Дүгнэлт хадгалах'}
                </button>
              </form>
            </div>
          )}

          {/* Ирүүлсэн Дүгнэлтүүд */}
          {proposal.reviews && proposal.reviews.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase">Ирүүлсэн Шүүмжүүд</h2>
              <div className="divide-y divide-gray-100">
                {proposal.reviews.map((rev) => (
                  <div key={rev.id} className="py-3 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">{rev.reviewer?.username}</span>
                      <span className="text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600">{rev.recommendation}</p>
                    <p className="text-xs text-gray-600">{rev.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {isSecretaryOrChair && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">Шүүмжлэгч Томилох</h3>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white"
              >
                <option value="">Шүүмжлэгч сонгох...</option>
                {availableReviewers.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    {rev.first_name ? `${rev.first_name} (${rev.username})` : rev.username}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignReviewer}
                disabled={!selectedReviewerId || actionLoading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                Томилох
              </button>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase">Ерөнхий мэдээлэл</h3>
            <div>
              <span className="block text-xs text-gray-500">Үндсэн судлаач</span>
              <span className="text-sm font-medium text-gray-800">{proposal.researcher_name || '-'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 mb-1">Томилогдсон Шүүмжлэгчид</span>
              <div className="flex flex-wrap gap-1">
                {proposal.reviewers && proposal.reviewers.length > 0 ? (
                  proposal.reviewers.map((r) => (
                    <span key={r.id} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded border border-indigo-100">
                      {r.username}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Шүүмжлэгч томилогдоогүй</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
