/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'aws-speed-date.s3-website-us-east-1.amazonaws.com',
        port: '',
        pathname: '/user/**'
      }
    ]
  }
};

export default nextConfig;
