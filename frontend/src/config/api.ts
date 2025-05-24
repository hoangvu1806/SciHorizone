// Cấu hình API cho ứng dụng
export const API_BASE_URL = 'http://localhost:8088';

// Danh sách endpoint
export const API_ENDPOINTS = {
  UPLOAD_PDF: '/upload-pdf',
  GENERATE_EXAM: (sessionId: string) => `/generate-exam/${sessionId}`,
  EXAM_DATA: (sessionId: string) => `/exam-data/${sessionId}`,
  SESSION_INFO: (sessionId: string) => `/session-info/${sessionId}`,
  DOWNLOAD_RESULT: (sessionId: string) => `/download-result/${sessionId}`
}; 