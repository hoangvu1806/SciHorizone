/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Cấu hình tổng quát để proxy tất cả các yêu cầu /api/* đến backend
      // Sử dụng domain apisci.hoangvu.id.vn đã được ánh xạ đến FastAPI server
      {
        source: '/api/:path*',
        destination: 'https://apisci.hoangvu.id.vn/:path*',
      },
    ];
  },
};

export default nextConfig;
