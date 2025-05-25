/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Cấu hình tổng quát để proxy tất cả các yêu cầu /api/* đến backend
      // Sử dụng IP của Docker host (172.17.0.1 là gateway mặc định của Docker trên Linux)
      {
        source: '/api/:path*',
        destination: 'http://172.17.0.1:8088/:path*',
      },
    ];
  },
};

export default nextConfig;
