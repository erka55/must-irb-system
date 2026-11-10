"use client";
import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import { Meeting } from "@/types/meeting";
import RecordDecisionModal from "@/components/meetings/RecordDecisionModal";
import CreateMeetingModal from "@/components/meetings/CreateMeetingModal"; // Шинээр нэмсэн модал
import { useAuth } from "@/context/AuthContext";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  // Шийдвэр гаргах модалын төлвүүд
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [selectedMeetingProposals, setSelectedMeetingProposals] = useState<number[]>([]);

  // Шинэ хурал үүсгэх модалын төлөв (Алхам 3)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Эрх шалгах туслах функц
  const canManageMeetings = user?.role === "CHAIR" || user?.role === "SECRETARY";

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      // api interceptor ашиглаж байгаа тул token дамжуулах шаардлагагүй болсон
      const data = await meetingService.getMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.error("Хурлын мэдээлэл татахад алдаа гарлаа:", err);
      setError(err.message || "Хурлын мэдээлэл татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const openDecisionModal = (meetingId: number, proposals: number[]) => {
    setSelectedMeetingId(meetingId);
    setSelectedMeetingProposals(proposals);
    setIsDecisionModalOpen(true);
  };

  const handleDecisionSuccess = () => {
    setIsDecisionModalOpen(false);
    fetchMeetings(); // Шийдвэр нэмсний дараа жагсаалтаа шинэчлэх
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchMeetings(); // Шинэ хурал нэмсний дараа жагсаалтаа шинэчлэх
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Уншиж байна...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Алдаа гарлаа: {error}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">IRB Хурлын тов</h1>

        {/* Зөвхөн Дарга, Нарийн бичигт харагдана */}
        {canManageMeetings && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            onClick={() => setIsCreateModalOpen(true)} // Алхам 3: Товч дарахад модал нээгдэнэ
          >
            + Шинэ хурал товлох
          </button>
        )}
      </div>

      {meetings.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow text-center text-gray-500">Одоогоор товлогдсон хурал алга байна.</div>
      ) : (
        <div className="grid gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="border p-5 rounded-lg shadow-sm bg-white hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{meeting.title}</h2>
                  <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                    <span>📅 {new Date(meeting.meeting_date).toLocaleString("mn-MN")}</span>
                    <span>📍 {meeting.location || "Байршил тодорхойгүй"}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                  {meeting.status_display}
                </span>
              </div>

              {meeting.decisions && meeting.decisions.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded p-4 border border-gray-100">
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Гаргасан шийдвэрүүд:</h3>
                  <ul className="space-y-2">
                    {meeting.decisions.map((decision) => (
                      <li key={decision.id} className="text-sm flex justify-between items-center bg-white p-3 rounded border shadow-sm">
                        <span className="font-medium text-gray-700">Өргөдөл #{decision.proposal}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            decision.decision === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : decision.decision === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {decision.decision_display}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Дарга, Нарийн бичигт болон зөвхөн Явагдаж байгаа хуралд харагдана */}
              {canManageMeetings && meeting.status === "IN_PROGRESS" && (
                <div className="mt-4 flex gap-2 justify-end">
                  <button
                    onClick={() => openDecisionModal(meeting.id, meeting.proposals)}
                    className="text-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                  >
                    Шийдвэр бүртгэх
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Шийдвэр бүртгэх модал */}
      <RecordDecisionModal
        isOpen={isDecisionModalOpen}
        meetingId={selectedMeetingId}
        proposalIds={selectedMeetingProposals}
        onClose={() => setIsDecisionModalOpen(false)}
        onSuccess={handleDecisionSuccess}
      />

      {/* Шинэ хурал үүсгэх модал (Алхам 3) */}
      <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />
    </div>
  );
}
