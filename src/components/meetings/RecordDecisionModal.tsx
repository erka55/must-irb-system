"use client";
import { useState, useEffect } from "react";
import { meetingService } from "@/services/meetingService";
import api from "@/services/proposalService";

interface RecordDecisionModalProps {
  isOpen: boolean;
  meetingId: number | null;
  proposalIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordDecisionModal({ isOpen, meetingId, proposalIds, onClose, onSuccess }: RecordDecisionModalProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<number | "">("");
  const [decision, setDecision] = useState("");
  const [meetingMinutes, setMeetingMinutes] = useState("");

  // 1. ШИНЭЭР НЭМСЭН: Файл хадгалах төлөв
  const [protocolFile, setProtocolFile] = useState<File | null>(null);

  const [proposalsInfo, setProposalsInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchProposalsInfo = async () => {
        if (!proposalIds || proposalIds.length === 0) {
          setProposalsInfo([]);
          return;
        }
        try {
          const res = await api.get("/proposals/");
          const meetingProposals = res.data.filter((p: any) => proposalIds.includes(p.id));
          setProposalsInfo(meetingProposals);

          setSelectedProposalId(meetingProposals.length === 1 ? meetingProposals[0].id : "");
        } catch (err) {
          console.error("Төслийн мэдээлэл татахад алдаа гарлаа:", err);
          setProposalsInfo(proposalIds.map((id) => ({ id, title: `Өргөдөл #${id}` })));
        }
      };

      fetchProposalsInfo();
      setDecision("");
      setMeetingMinutes("");
      setProtocolFile(null); // 2. ШИНЭЭР НЭМСЭН: Модал нээгдэхэд файлыг цэвэрлэх
      setError(null);
    }
  }, [isOpen, proposalIds]);

  if (!isOpen || !meetingId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProposalId) {
      setError("Шийдвэр гаргах төслийг сонгоно уу.");
      return;
    }
    if (!decision) {
      setError("Эцсийн шийдвэрийг сонгоно уу.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 3. ШИНЭЭР НЭМСЭН: protocolFile-ийг service рүү дамжуулах
      await meetingService.recordDecision(meetingId, Number(selectedProposalId), decision as any, meetingMinutes, protocolFile);

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Шийдвэр хадгалахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">Хурлын шийдвэр бүртгэх</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">{error}</div>}

        {!proposalIds || proposalIds.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500 mb-4">Энэ хуралд хэлэлцэхээр холбогдсон төсөл алга байна.</p>
            <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">
              Хаах
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Шийдвэр гаргах төсөл</label>
              <select
                value={selectedProposalId}
                onChange={(e) => setSelectedProposalId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
              >
                <option value="" disabled>
                  -- Төсөл сонгох --
                </option>
                {proposalsInfo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.application_no ? `${p.application_no} : ` : `ID #${p.id} : `}
                    {p.title.length > 60 ? p.title.substring(0, 60) + "..." : p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хорооны эцсийн шийдвэр</label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
              >
                <option value="" disabled>
                  -- Шийдвэр сонгох --
                </option>
                <option value="APPROVED">Зөвшөөрөгдсөн (Approved)</option>
                <option value="REVISION_REQUIRED">Засвар шаардлагатай (Revision Required)</option>
                <option value="REJECTED">Татгалзсан (Rejected)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хурлын тэмдэглэл / Үндэслэл (Сонголттой)</label>
              <textarea
                value={meetingMinutes}
                onChange={(e) => setMeetingMinutes(e.target.value)}
                placeholder="Шийдвэрийн үндэслэл болон судлаачид өгөх зөвлөмж..."
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm"
              ></textarea>
            </div>

            {/* 4. ШИНЭЭР НЭМСЭН: Файл хавсаргах input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Хурлын протокол (PDF, Word файл хавсаргах)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setProtocolFile(e.target.files ? e.target.files[0] : null)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition text-sm font-medium"
                disabled={loading}
              >
                Цуцлах
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-md transition text-sm font-medium ${
                  loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={loading}
              >
                {loading ? "Хадгалж байна..." : "Шийдвэр баталгаажуулах"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
