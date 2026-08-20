/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

const remotePatterns = []
if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl)
    if (hostname) remotePatterns.push({ protocol: "https", hostname })
  } catch {
    // ignore malformed URL
  }
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      { source: "/admin/login", destination: "/login", permanent: true },
      { source: "/admin/signup", destination: "/signup", permanent: true },
      { source: "/admin/forgot-password", destination: "/forgot-password", permanent: true },
      { source: "/admin/reset-password", destination: "/reset-password", permanent: true },
      { source: "/admin/client/:path*", destination: "/client/:path*", permanent: true },
      { source: "/admin/client", destination: "/client", permanent: true },
      { source: "/admin/my-tasks", destination: "/member/my-tasks", permanent: true },
      { source: "/admin/my-earnings", destination: "/member/my-earnings", permanent: true },
      { source: "/admin/timer", destination: "/member/timer", permanent: true },
      { source: "/admin/profile", destination: "/member/profile", permanent: true },
      { source: "/admin/profile/:path*", destination: "/member/profile/:path*", permanent: true },
    ];
  },
}

module.exports = nextConfig
