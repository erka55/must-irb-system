'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/users/token/', { username, password });
      const { access, user: resUser } = res.data;

      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      let userData = resUser;

      if (!userData) {
        try {
          const profileRes = await api.get('/users/me/');
          userData = profileRes.data;
        } catch {
          userData = { username, role: res.data.role || 'RESEARCHER' };
        }
      }

      // 1. AuthContext-д хадгалах
      login(access, userData);

      // 2. Ролоос хамаарч тохирох хуудас руу шилжүүлэх
      const userRole = userData?.role;

      if (userRole === 'RESEARCHER') {
        router.push('/proposals');
      } else if (userRole === 'REVIEWER') {
        router.push('/reviewer/assigned');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login failure:', err);
      setError('Нэвтрэх нэр эсвэл нууц үг буруу байна.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md border border-gray-200">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">ШУТИС - IRB</h2>
          <p className="text-sm text-gray-500 mt-1">Системд нэвтрэх</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Нэвтрэх нэр
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Хэрэглэгчийн нэр"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Нууц үг
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
          >
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
          </button>
        </form>
      </div>
    </div>
  );
}
