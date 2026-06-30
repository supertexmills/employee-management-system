import type { NextConfig } from "next";
import path from "path";

const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8080";

const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block this site from being embedded in iframes (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },
  // Only send origin in Referer header; strip path/query for cross-origin requests
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict access to browser features not used by this app
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Enable DNS prefetching for faster asset resolution
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Force HTTPS for 1 year (includeSubDomains) — only applies in production over HTTPS
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Cross-origin isolation policies
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
