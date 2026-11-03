"use client";
import { useState, useEffect } from "react";
import { meetingService } from "@/services/meetingService";
import api from "@/services/proposalService"; // api instance-ийг импортлох

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMeetingModal({ isOpen, onClose, onSuccess }: CreateMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [selectedProposals, setSelectedProposals] = useState<number[]>([]);
  const [availableProposals, setAvailableProposals] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Модал нээгдэх үед төслүүдийг татах
  useEffect(() => {
    if (isOpen) {
      const fetchProposals = async () => {
        try {
          const res = await api.get("/proposals/");
          // Зөвхөн хэлэлцэх шаардлагатай төслүүдийг шүүх (Ноороглосон болон хэдийнэ батлагдсан төслүүдийг хасах)
          const pendingProposals = res.data.filter((p: any) => ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUIRED"].includes(p.status));
          setAvailableProposals(pendingProposals);
        } catch (err) {
          console.error("Төслүүд татахад алдаа гарлаа:", err);
        }
      };

      fetchProposals();

      // Маягтын утгуудыг шинээр эхлүүлэх
      setTitle("");
      setMeetingDate("");
      setLocation("");
      setSelectedProposals([]);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // DRF нь ManyToMany талбарт ID-нуудын жагсаалт хүлээж авдаг [1, 2, 3]
      const meetingData = {
        title,
        meeting_date: meetingDate,
        location,
        status: "SCHEDULED",
        proposals: selectedProposals,
      };

      await meetingService.createMeeting(meetingData);

      onSuccess(); // Амжилттай болсны дараа жагсаалтыг шинэчлэх, модалыг хаах
    } catch (err: any) {
      setError(err.message || "Хурал үүсгэх үед алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (proposalId: number) => {
    if (selectedProposals.includes(proposalId)) {
      setSelectedProposals(selectedProposals.filter((id) => id !== proposalId));
    } else {
      setSelectedProposals([...selectedProposals, proposalId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Шинэ хурал товлох</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
            &times;
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хурлын нэр / Сэдэв</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жишээ: 2024 оны 1-р улирлын хурал"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Огноо ба Цаг</label>
              <input
                type="datetime-local"
                required
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Байршил / Холбоос</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Өрөө эсвэл Zoom линк"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Төсөл сонгох хэсэг */}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Хэлэлцэх төслүүд (Сонгох)</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 bg-gray-50">
              {availableProposals.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Хэлэлцэх боломжтой (SUBMITTED, UNDER_REVIEW) төсөл алга байна.</p>
              ) : (
                availableProposals.map((proposal) => (
                  <label
                    key={proposal.id}
                    className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => handleCheckboxChange(proposal.id)}
                    />
                    <span className="text-sm text-gray-700 leading-tight">
                      <span className="font-semibold block text-xs text-blue-800 mb-0.5">#{proposal.application_no || proposal.id}</span>
                      {proposal.title}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Цуцлах
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-md transition font-medium ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={loading}
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
