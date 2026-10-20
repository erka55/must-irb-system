"use client";

import React, { useState } from 'react';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    methodology: '',
    reviewLevel: 'EXEMPTED',
  });
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponseMsg(null);

    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Хүсэлт илгээхэд алдаа гарлаа.');
      }

      setResponseMsg(data);
      setFormData({ title: '', summary: '', methodology: '', reviewLevel: 'EXEMPTED' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          📝 IRB Судалгааны Хүсэлт Гаргах (Маягт 1)
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          Судалгааны ёс зүйн хороонд хяналуулах хүсэлтийн үндсэн мэдээллийг оруулна уу.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {responseMsg && (
        <div className="p-4 mb-4 bg-green-50 text-green-800 text-sm rounded-lg border border-green-200">
          ✅ {responseMsg.message} <br />
          <strong>Таны Хүсэлтийн Код:</strong>{' '}
          <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
            {responseMsg.application.application_no}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Судалгааны Сэдвийн Нэр *
          </label>
          <input
            type="text"
            required
            placeholder="Судалгааны ажлын бүрэн нэрийг оруулна уу"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Судалгааны Товч Хураангуй (Summary) *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Судалгааны зорилго, хамрах хүрээ, ач холбогдлын товч танилцуулга"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Судалгааны Арга Зүй (Methodology) *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Судалгаа хийх арга зүй, асуулга, туршилт, мэдээлэл цуглуулах хэлбэрийг тодорхойлно уу"
            value={formData.methodology}
            onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Эрсдэлийн Түвшин / Үнэлгээний Төрөл
          </label>
          <select
            value={formData.reviewLevel}
            onChange={(e) => setFormData({ ...formData, reviewLevel: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="EXEMPTED">Чөлөөлөгдөх (EXEMPTED - Маш бага эрсдэлтэй)</option>
            <option value="EXPEDITED">Хялбаршуулсан (EXPEDITED - Бага эрсдэлтэй)</option>
            <option value="FULL_BOARD">Бүрэн хэлэлцүүлэг (FULL_BOARD - Өндөр эрсдэлтэй)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Илгээж байна...' : 'Хүсэлт Илгээх'}
        </button>
      </form>
    </div>
  );
}
