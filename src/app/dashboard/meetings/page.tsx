"use client";

import { useEffect, useState } from "react";
import { meetingService } from "@/services/meetingService";
import { Meeting } from "@/types/meeting";
import { useAuth } from "@/context/AuthContext";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Модал төлөв

  // Шинэ хурал үүсгэх формын төлөв
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    meeting_date: "",
    location: "",
  });

  const { user } = useAuth();
  
  useEffect(() => {
    const fetchMeetings = async () => {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await meetingService.getMeetings(token);
        setMeetings(data);
      } catch (error) {
        console.error("Хурлын мэдээлэл татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Хурал үүсгэх функц
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("access_token");
    if (!token) return;

    try {
      const createdMeeting = await meetingService.createMeeting(newMeeting, token);
      // Үүссэн хурлыг жагсаалтын эхэнд нэмэх
      setMeetings([createdMeeting, ...meetings]);
      // Модал хаах, формыг цэвэрлэх
      setIsModalOpen(false);
      setNewMeeting({ title: "", meeting_date: "", location: "" });
    } catch (error) {
      console.error("Хурал үүсгэхэд алдаа гарлаа:", error);
      alert("Хурал үүсгэхэд алдаа гарлаа.");
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Уншиж байна...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Хорооны хурлууд</h1>
                {(user?.role === "CHAIR" || user?.role === "SECRETARY") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            + Шинэ хурал товлох
          </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Хурлын нэр</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Огноо, Цаг</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Байршил</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Төлөв</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Одоогоор товлогдсон хурал алга байна.
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meeting.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(meeting.meeting_date).toLocaleString("mn-MN")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meeting.location || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(meeting.status)}`}>
                      {meeting.status_display}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модал */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Шинэ хурал товлох</h2>
            <form onSubmit={handleCreateMeeting}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Хурлын нэр</label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Огноо, Цаг</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newMeeting.meeting_date}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meeting_date: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Байршил / Zoom</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newMeeting.location}
                  onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Цуцлах
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
