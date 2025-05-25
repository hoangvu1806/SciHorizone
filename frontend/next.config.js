/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Cấu hình tổng quát để proxy tất cả các yêu cầu /api/* đến backend
      // Sử dụng host.docker.internal để container có thể giao tiếp với máy host
      {
        source: '/api/:path*',
        destination: 'http://host.docker.internal:8088/:path*',
      },
    ];
  },
};

export default nextConfig;
