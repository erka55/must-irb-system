'use client';

import React, { useState } from 'react';
import { submitReview } from '@/services/proposalService';

interface ReviewEvaluationProps {
  proposalId: string | number;
  onUpdate: () => void;
}

export default function ReviewEvaluation({ proposalId, onUpdate }: ReviewEvaluationProps) {
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comments.trim()) return alert('Дүгнэлтээ оруулна уу.');
    if (!decision) return alert('Шийдвэрээ сонгоно уу.');

    setSubmitting(true);
    try {
      await submitReview({ proposal: proposalId, comments, decision });
      alert('Дүгнэлт амжилттай хадгалагдлаа!');
      onUpdate(); // Мэдээллийг шинэчлэх
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.detail || 'Алдаа гарлаа. Та дахин оролдоно уу.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border border-gray-200 bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Шүүмжлэгчийн дүгнэлт оруулах</h3>
      <div className="space-y-4">
        {/* Задгай текст оруулах хэсэг */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Таны дүгнэлт, санал (Чөлөөт текст)
          </label>
          <textarea
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px]"
            placeholder="Төслийн давуу, сул тал болон бусад саналаа энд бичнэ үү..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Шийдвэр сонгох хэсэг */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Эцсийн шийдвэр
          </label>
          <select
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <option value="">-- Шийдвэр сонгох --</option>
            <option value="ACCEPT">Зөвшөөрөх</option>
            <option value="MINOR_REVISION">Бага хэмжээний засвар хийлгэх</option>
            <option value="MAJOR_REVISION">Их хэмжээний засвар хийлгэх</option>
            <option value="REJECT">Татгалзах</option>
          </select>
        </div>

        {/* Илгээх товч */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Түр хүлээнэ үү...' : 'Дүгнэлт илгээх'}
        </button>
      </div>
    </div>
  );
}
