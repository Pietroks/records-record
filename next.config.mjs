/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coverartarchive.org",
        port: "",
        pathname: "/release-group/**",
      },
    ],
  },
};

export default nextConfig;
