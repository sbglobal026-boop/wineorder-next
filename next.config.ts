import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FAQ를 QnA로 바꾸면서 옛 주소로 들어오는 방문자를 새 페이지로 보냄
  async redirects() {
    return [{ source: '/faq', destination: '/qna', permanent: false }]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tpytgmyqbtmmomkpnyrs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
