/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/upload-pdf',
        destination: 'http://localhost:8088/upload-pdf',
      },
      {
        source: '/api/generate-exam/:sessionId',
        destination: 'http://localhost:8088/generate-exam/:sessionId',
      },
      {
        source: '/api/exam-data/:sessionId',
        destination: 'http://localhost:8088/exam-data/:sessionId',
      },
      {
        source: '/api/session-info/:sessionId',
        destination: 'http://localhost:8088/session-info/:sessionId',
      },
      {
        source: '/api/download-result/:sessionId',
        destination: 'http://localhost:8088/download-result/:sessionId',
      },
    ];
  },
};

export default nextConfig;
