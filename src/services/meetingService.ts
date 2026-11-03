import api from './proposalService';
import { Meeting, DecisionLog, FinalDecision } from '../types/meeting';

export const meetingService = {
    getMeetings: async (): Promise<Meeting[]> => {
        const response = await api.get('/meetings/');
        return response.data;
    },

    getMeetingById: async (id: number): Promise<Meeting> => {
        const response = await api.get(`/meetings/${id}/`);
        return response.data;
    },

    // fetch-ийн оронд api.post ашигласнаар код илүү богино бөгөөд токен автоматаар явна
    createMeeting: async (meetingData: any) => {
        const response = await api.post('/meetings/', meetingData);
        return response.data;
    }, // <-- ЭНЭ ТАСЛАЛЫГ МАРТАЖ БОЛОХГҮЙ

    // ӨӨРЧЛӨГДСӨН ХЭСЭГ: Файл хүлээж авах болон FormData ашиглах
    recordDecision: async (
        meetingId: number, 
        proposalId: number, 
        decision: FinalDecision | string, 
        meetingMinutes?: string,
        protocolFile?: File | null
    ): Promise<DecisionLog> => {
        const formData = new FormData();
        
        formData.append('proposal_id', proposalId.toString());
        formData.append('decision', decision);
        
        if (meetingMinutes) {
            formData.append('meeting_minutes', meetingMinutes);
        }
        
        // Файл сонгогдсон байвал formData-д хавсаргана
        if (protocolFile) {
            formData.append('protocol_file', protocolFile);
        }

        const response = await api.post(`/meetings/${meetingId}/record_decision/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    },

    // Хурлын мэдээлэл засах
    updateMeeting: async (id: number, data: any) => {
        const response = await api.patch(`/meetings/${id}/`, data);
        return response.data;
    },

    // Хурал устгах
    deleteMeeting: async (id: number) => {
        const response = await api.delete(`/meetings/${id}/`);
        return response.data;
    },
};
