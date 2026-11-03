"use client";
import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import { Meeting } from "@/types/meeting";
import RecordDecisionModal from "@/components/meetings/RecordDecisionModal";
import CreateMeetingModal from "@/components/meetings/CreateMeetingModal";
import EditMeetingModal from "@/components/meetings/EditMeetingModal";
import { useAuth } from "@/context/AuthContext";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [selectedMeetingProposals, setSelectedMeetingProposals] = useState<number[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canManageMeetings = user?.role === "CHAIR" || user?.role === "SECRETARY";

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingService.getMeetings();
      setMeetings(data);
    } catch (err: any) {
      console.error("Хурлын мэдээлэл татахад алдаа гарлаа:", err);
      setError(err.message || "Хурлын мэдээлэл татахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (id: number) => {
    if (window.confirm("Та энэ хурлыг устгахдаа итгэлтэй байна уу?")) {
      try {
        await meetingService.deleteMeeting(id);
        fetchMeetings();
      } catch (err) {
        alert("Устгахад алдаа гарлаа.");
        console.error(err);
      }
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
    fetchMeetings();
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchMeetings();
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

        {canManageMeetings && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            onClick={() => setIsCreateModalOpen(true)}
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

                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                    {meeting.status_display}
                  </span>

                  {/* ШИНЭ НЬ: Зөвхөн Товлогдсон үед л хурлын мэдээллийг Засах/Устгах боломжтой */}
                  {canManageMeetings && meeting.status === "SCHEDULED" && (
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setEditingMeeting(meeting)}
                        className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition"
                      >
                        Засах
                      </button>
                      <button
                        onClick={() => handleDeleteMeeting(meeting.id)}
                        className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                      >
                        Устгах
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {meeting.proposals_detail && meeting.proposals_detail.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm text-gray-700 mb-2">Хэлэлцэх төслүүд:</h3>
                  <div className="flex flex-col gap-2">
                    {meeting.proposals_detail.map((proposal: any) => (
                      <div
                        key={proposal.id}
                        className="bg-blue-50 text-blue-800 text-sm px-3 py-2 rounded border border-blue-100 flex items-start"
                      >
                        <span className="font-bold mr-2 whitespace-nowrap">{proposal.application_no || proposal.id}</span>
                        <span>{proposal.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ӨӨРЧЛӨГДСӨН ХЭСЭГ: Шийдвэрүүдийг харуулах (Файл болон Тэмдэглэл нэмэгдсэн) */}
              {meeting.decisions && meeting.decisions.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded p-4 border border-gray-100">
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Гаргасан шийдвэрүүд:</h3>
                  <ul className="space-y-2">
                    {meeting.decisions.map((decision: any) => (
                      <li key={decision.id} className="text-sm flex flex-col bg-white p-3 rounded border shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-700 mt-1">
                            {decision.proposal_no ? `${decision.proposal_no} : ` : `ID #${decision.proposal} : `}
                            {decision.proposal_title
                              ? decision.proposal_title.length > 55
                                ? decision.proposal_title.substring(0, 55) + "..."
                                : decision.proposal_title
                              : ""}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 ${
                              decision.decision === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : decision.decision === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {decision.decision_display}
                          </span>
                        </div>

                        {/* Хэрэв протокол файл байвал харуулах */}
                        {decision.protocol_file && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Протокол:</span>
                            <a
                              href={decision.protocol_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              📎 Файл харах / Татах
                            </a>
                          </div>
                        )}

                        {/* Хэрэв хурлын тэмдэглэл (Текст) оруулсан байвал харуулах */}
                        {decision.meeting_minutes && (
                          <div className="mt-2 pt-2 border-t border-gray-50 text-xs text-gray-600">
                            <span className="font-medium text-gray-500 mr-1">Тэмдэглэл:</span>
                            {decision.meeting_minutes}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* ------------------------------------------------------------------------- */}

              {canManageMeetings && (
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

      {/* Шинэ хурал үүсгэх модал */}
      <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

      {/* Хурлын тов засах модал */}
      <EditMeetingModal
        isOpen={!!editingMeeting}
        meeting={editingMeeting}
        onClose={() => setEditingMeeting(null)}
        onSuccess={() => {
          setEditingMeeting(null);
          fetchMeetings();
        }}
      />
    </div>
  );
}
