"use client";

import React, { useState } from 'react';

export default function StatusTracker() {
  const [appCode, setAppCode] = useState('');
  const [activeApp, setActiveApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!appCode.trim()) return;

    setLoading(true);
    setError('');
    setActiveApp(null);

    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appCode.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Хүсэлт олдсонгүй.');
      }

      setActiveApp(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">🔍 Хүсэлтийн Явц Шалгах</h2>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Хүсэлтийн код оруулна уу (ж: IRB-2026-003)"
          value={appCode}
          onChange={(e) => setAppCode(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-lg transition"
        >
          {loading ? 'Хайж байна...' : 'Хайх'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
          ⚠️ {error}
        </div>
      )}

      {activeApp && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
          <div className="flex justify-between items-center border-b border-blue-200 pb-3">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Хүсэлтийн Дугаар
              </span>
              <h3 className="text-xl font-bold text-blue-950">
                {activeApp.application_no}
              </h3>
            </div>
            <span className="px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded-full">
              {activeApp.status}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Сэдвийн Нэр</span>
            <p className="text-base font-medium text-gray-800">{activeApp.title}</p>
          </div>

          {activeApp.summary && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Хураангуй</span>
              <p className="text-sm text-gray-600">{activeApp.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Үнэлгээний Төрөл</span>
              <p className="text-sm font-semibold text-gray-700">{activeApp.review_level}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase">Бүртгэгдсэн Статус</span>
              <p className="text-sm font-semibold text-blue-800">{activeApp.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}