
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [ 'antd', '@ant-design', 'rc-util', 'rc-pagination', 'rc-picker', 'rc-notification', 'rc-tooltip' ],
  images: {
    unoptimized: true
  },
}

module.exports = nextConfig