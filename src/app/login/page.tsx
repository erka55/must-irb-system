'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      router.push('/proposals');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Хэрэглэгчийн нэр эсвэл нууц үг буруу байна.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Системд нэвтрэх</h2>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хэрэглэгчийн нэр</label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
            <input
              type="password"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  );
}
