'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../src/components/layout/DashboardLayout';
import RoleGuard from '../../../src/components/protected/RoleGuard';
import { createProposal, uploadProposalDocument } from '../../../src/services/proposalService';

export default function CreateProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    methodology: '',
  });

  const [protocolFile, setProtocolFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Төслийн үндсэн мэдээллийг үүсгэх
      const createdProposal = await createProposal(formData);

      // 2. Хэрэв файл хавсаргасан бол сервер рүү хуулах
      if (protocolFile && createdProposal.id) {
        await uploadProposalDocument(createdProposal.id, protocolFile, 'PROTOCOL');
      }

      // Амжилттай бол жагсаалт руу шилжих
      router.push('/proposals');
    } catch (err: any) {
      console.error('Proposal creation error:', err);
      setError('Төсөл үүсгэхэд алдаа гарлаа. Мэдээллээ шалгаад дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={['RESEARCHER', 'SYSADMIN']}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Шинэ судалгааны төсөл мэдүүлэх</h1>
            <p className="text-sm text-gray-500">Ёс зүйн хорооны хяналтад хамрагдах судалгааны материалуудыг оруулна уу.</p>
          </div>

          {/* Stepper Wizard */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs">1</span>
              <span>Ерөнхий мэдээлэл</span>
            </div>
            <div className="text-gray-300">→</div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs">2</span>
              <span>Баримт бичиг</span>
            </div>
            <div className="text-gray-300">→</div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-indigo-600 font-semibold' : 'text-gray-400'}`}>
              <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs">3</span>
              <span>Илгээх</span>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            {/* Step 1: Ерөнхий мэдээлэл */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Судалгааны төслийн нэр / Сэдэв *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Төслийн бүтэн нэр"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Судалгааны хураангуй (Summary) *
                  </label>
                  <textarea
                    name="summary"
                    rows={4}
                    required
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Төслийн зорилго, хамрах хүрээ..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Судалгааны арга зүй (Methodology) *
                  </label>
                  <textarea
                    name="methodology"
                    rows={4}
                    required
                    value={formData.methodology}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Судалгаа хийх аргачлал, туршилтын дараалал..."
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.title || !formData.summary || !formData.methodology}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                  >
                    Дараах: Баримт бичиг →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Баримт бичиг хавсаргах */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Судалгааны Протокол / Маягт (PDF/Word)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setProtocolFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-600"
                  />
                  <p className="text-xs text-gray-400 mt-1">Файлын дээд хэмжээ: 20MB</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ← Буцах
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Дараах: Хянаж илгээх →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Дүнг хянаад илгээх */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Мэдүүлж буй төслийн мэдээлэл:</p>
                  <p className="text-base font-bold text-gray-800">{formData.title}</p>
                  <p className="text-sm text-gray-600"><strong>Хураангуй:</strong> {formData.summary}</p>
                  <p className="text-sm text-gray-600">
                    <strong>Хавсаргасан файл:</strong> {protocolFile ? protocolFile.name : 'Файл сонгоогүй'}
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    ← Буцах
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:bg-emerald-400"
                  >
                    {loading ? 'Илгээж байна...' : 'Илгээх'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
