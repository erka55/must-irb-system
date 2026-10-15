'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../services/auth';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    try {
      setLoading(true);
      await login({ username, password });
      // Амжилттай нэвтэрвэл Удирдах хэсэг / Dashboard руу шилжинэ
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 
        'Хэрэглэгчийн нэр эсвэл нууц үг буруу байна!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            ШУТИС - IRB Систем
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ёс зүйн хяналтын хорооны системд нэвтрэх
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Хэрэглэгчийн нэр
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="Нэвтрэх нэрээ оруулна уу"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                placeholder="Нууц үгээ оруулна уу"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
