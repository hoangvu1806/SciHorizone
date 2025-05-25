// Cấu hình API cho ứng dụng
// Sử dụng đường dẫn tương đối để Next.js có thể xử lý proxy
export const API_BASE_URL = '/api';

// Danh sách endpoint
export const API_ENDPOINTS = {
  UPLOAD_PDF: '/upload-pdf',
  GENERATE_EXAM: (sessionId: string) => `/generate-exam/${sessionId}`,
  EXAM_DATA: (sessionId: string) => `/exam-data/${sessionId}`,
  SESSION_INFO: (sessionId: string) => `/session-info/${sessionId}`,
  DOWNLOAD_RESULT: (sessionId: string) => `/download-result/${sessionId}`
}; 