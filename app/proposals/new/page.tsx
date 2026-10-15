'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProposal, uploadProposalDocument } from '../../../services/proposals';

export default function NewProposalPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [methodology, setMethodology] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setSummary('');
    setMethodology('');
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    resetForm();
    router.back();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Django Proposal API-д шаардлагатай талбаруудыг илгээх
      const newProposal = await createProposal({
        title,
        summary: summary.trim() || 'Товч хураангуй оруулаагүй',
        methodology: methodology.trim() || 'Арга зүй оруулаагүй',
      });

      // 2. Хэрэв файл сонгосон бол Upload хийнэ
      if (file && newProposal.id) {
        await uploadProposalDocument(newProposal.id, file, 'PROTOCOL');
      }

      resetForm();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Submit error detail:', err.response?.data || err);

      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          const details = Object.entries(err.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
          setError(details);
        } else {
          setError(String(err.response.data));
        }
      } else {
        setError('Сервертэй холбогдоход алдаа гарлаа.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Шинэ ёс зүйн хяналтын хүсэлт үүсгэх
          </h1>
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Буцах
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            <strong>Алдааны мэдээлэл:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Судалгааны ажлын нэр / Сэдэв *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Судалгааны ажлын нэрийг оруулна уу"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Товч хураангуй (Summary) *
            </label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Судалгааны зорилго, хураангуй агуулга"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Судалгааны арга зүй (Methodology) *
            </label>
            <textarea
              rows={3}
              required
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Судалгааны арга зүй, хамрах хүрээ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Баримт бичиг хавсаргах (PDF, DOCX)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Цуцлах
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Илгээж байна...' : 'Хүсэлт илгээх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}