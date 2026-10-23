'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getProposalDocuments, uploadProposalDocument, deleteProposalDocument } from '@/services/proposalService';

interface DocumentItem {
  id: number;
  proposal: number;
  document_type: string;
  document_type_display: string;
  file: string;
  uploaded_at: string;
}

interface DocumentsListProps {
  proposalId: string | number;
  status: string;
}

const DOCUMENT_TYPES = [
  { value: 'PROTOCOL', label: 'Судалгааны протокол / Маягт' },
  { value: 'CONSENT_FORM', label: 'Зөвшөөрлийн хуудас' },
  { value: 'QUESTIONNAIRE', label: 'Асуулга / Тайлбар' },
  { value: 'APPROVAL_LETTER', label: 'Эцсийн батламж / Шийдвэр' },
  { value: 'OTHER', label: 'Бусад хавсралт' },
];

export const DocumentsList: React.FC<DocumentsListProps> = ({ proposalId, status }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<string>('PROTOCOL');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditable = status === 'DRAFT' || status === 'NEEDS_REVISION';

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProposalDocuments(proposalId);
      setDocuments(data);
    } catch (err: any) {
      console.error("Fetch docs error:", err);
      setError('Баримт бичгүүдийг татахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    if (proposalId) {
      fetchDocuments();
    }
  }, [proposalId, fetchDocuments]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Файлаа сонгоно уу!');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      await uploadProposalDocument(proposalId, selectedFile, selectedType);
      
      setSelectedFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchDocuments();
    } catch (err: any) {
      console.error("Upload error:", err);
      alert('Файл хуулахад алдаа гарлаа. Төслийн төлөв баримт бичих боломжтой эсэхийг шалгана уу.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Энэ баримт бичгийг устгахдаа итгэлтэй байна уу?')) return;

    try {
      await deleteProposalDocument(docId);
      await fetchDocuments();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert('Файл устгахад алдаа гарлаа.');
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return 'Баримт бичиг';
    return url.split('/').pop() || 'Баримт бичиг';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
        <span>📄 Хавсаргасан баримт бичгүүд</span>
        {!isEditable && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-normal">
            🔒 Зөвхөн унших горим
          </span>
        )}
      </h2>

      {isEditable && (
        <form onSubmit={handleFileUpload} className="bg-gray-50 p-4 rounded-md mb-6 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Шинэ баримт бичиг хавсаргах</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Баримтын төрөл</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Файл сонгох (PDF/DOCX)</label>
              <input
                id="file-input"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md p-1"
                required
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Хуулж байна...' : 'Хуулах / Хавсаргах'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-500 text-sm">Файлуудыг ачаалж байна...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500 text-sm">{error}</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300 text-gray-500 text-sm">
          Одоогоор хавсаргасан баримт бичиг байхгүй байна.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Баримтын төрөл</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Файлын нэр</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Огноо</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {doc.document_type_display}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {getFileNameFromUrl(doc.file)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.uploaded_at).toLocaleDateString('mn-MN')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1">
                      Татах / Харах
                    </a>
                    {isEditable && (
                      <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">
                        Устгах
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
