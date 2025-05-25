/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Cấu hình tổng quát để proxy tất cả các yêu cầu /api/* đến backend
      // Sử dụng localhost vì container sẽ chạy với tùy chọn --network=host
      {
        source: '/api/:path*',
        destination: 'http://localhost:8088/:path*',
      },
    ];
  },
};

export default nextConfig;
