"use client";
import { useState, useEffect } from "react";
import { meetingService } from "@/services/meetingService";
import api from "@/services/proposalService";

interface EditMeetingModalProps {
  isOpen: boolean;
  meeting: any; // Засах гэж буй хурлын дата
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMeetingModal({ isOpen, meeting, onClose, onSuccess }: EditMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [selectedProposals, setSelectedProposals] = useState<number[]>([]);
  const [availableProposals, setAvailableProposals] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && meeting) {
      setTitle(meeting.title || "");
      // Огноог input type="datetime-local" -д тааруулж форматлах (YYYY-MM-DDThh:mm)
      const formattedDate = meeting.meeting_date ? new Date(meeting.meeting_date).toISOString().slice(0, 16) : "";
      setMeetingDate(formattedDate);
      setLocation(meeting.location || "");
      setStatus(meeting.status || "SCHEDULED");
      // Төслүүдийг татах
      const fetchProposals = async () => {
        try {
          const res = await api.get("/proposals/");
          // Энэ хуралд аль хэдийн орсон төслүүд эсвэл шинээр нэмэхэд бэлэн болсон (is_ready: true) төслүүдийг харуулах
          const selectableProposals = res.data.filter(
            (p: any) =>
              (p.status === "UNDER_REVIEW" && p.review_progress?.is_ready === true) ||
              (meeting.proposals && meeting.proposals.includes(p.id))
          );
          setAvailableProposals(selectableProposals);
        } catch (err) {
          console.error("Төслүүд татахад алдаа гарлаа:", err);
        }
      };
      fetchProposals();
    }
  }, [isOpen, meeting]);

  if (!isOpen || !meeting) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const meetingData = {
        title,
        meeting_date: meetingDate,
        location,
        status,
        proposals: selectedProposals,
      };
      await meetingService.updateMeeting(meeting.id, meetingData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Хурал засах үед алдаа гарлаа");
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
          <h2 className="text-xl font-bold text-gray-800">Хурлын тов засах</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">
            &times;
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хурлын нэр / Сэдэв</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none"
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
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Байршил / Холбоос</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Төлөв</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="SCHEDULED">Товлогдсон</option>
                <option value="IN_PROGRESS">Явагдаж байгаа</option>
                <option value="COMPLETED">Өндөрлөсөн</option>
                <option value="CANCELLED">Цуцлагдсан</option>
              </select>
            </div>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Хэлэлцэх төслүүд (Өөрчлөх)</label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 bg-gray-50">
              {availableProposals.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Сонгох төсөл олдсонгүй.</p>
              ) : (
                availableProposals.map((proposal) => (
                  <label key={proposal.id} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => handleCheckboxChange(proposal.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 leading-tight">
                      <span className="font-semibold block text-xs text-blue-800">#{proposal.application_no || proposal.id}</span>
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
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Цуцлах
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              {loading ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
