'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RoleGuard from '@/components/protected/RoleGuard';
import { createProposal } from '@/services/proposalService';

export default function NewProposalPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Төслийн нэрийг оруулна уу.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('abstract', abstract);
      if (file) {
        formData.append('file', file);
      }

      await createProposal(formData);
      router.push('/proposals');
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError('Төсөл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['PI', 'ADMIN']}>
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ← Буцах
          </button>

          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 border-b pb-4">Шинэ судалгааны төсөл бүртгэх</h1>

            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Төслийн нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  placeholder="Төслийн нэрийг оруулна уу"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Хураангуй / Товч агуулга
                </label>
                <textarea
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                  placeholder="Төслийн хураангуй мэдээллийг энд бичнэ үү..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Хавсралт файл (PDF, DOCX)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full p-2 border border-gray-300 rounded text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Илгээж байна...' : 'Төсөл хадгалах'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
