// Бусад сервисүүд дээрээ ашиглаж буй API зам болон fetch/axios тохиргоотойгоо уялдуулаарай
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const meetingService = {
  // Хурлуудын жагсаалт авах
  getMeetings: async (token: string) => {
    const response = await fetch(`${API_URL}/meetings/`, {
      headers: getHeaders(token),
    });
    if (!response.ok) throw new Error('Хурлын мэдээлэл татахад алдаа гарлаа');
    return response.json();
  },

  // Шинэ хурал товлох
  createMeeting: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/meetings/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Хурал үүсгэхэд алдаа гарлаа');
    return response.json();
  },

  // Хурлын шийдвэр оруулах
  recordDecision: async (meetingId: number, data: { proposal_id: number, decision: string, meeting_minutes: string }, token: string) => {
    const response = await fetch(`${API_URL}/meetings/${meetingId}/record_decision/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Шийдвэр хадгалахад алдаа гарлаа');
    return response.json();
  },
};
