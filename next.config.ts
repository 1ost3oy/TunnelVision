
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // بهینهسازی برای عملکرد بهتر
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },
  // Origins مجاز در حالت توسعه برای دسترسی بین-مبدا به منابع dev server
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    // اضافه: آی‌پی لوکال شما که هشدار از آن گزارش شد
    'http://192.168.1.3:3000'
  ],
  // فشردهسازی بهتر
  compress: true,
  // کش کردن بهتر
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // بهینهسازی webpack
    config.externals = [...(config.externals || []), 'ssh2', 'node-ssh'];
    
    // کاهش اندازه bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.resolve.alias = {
        ...config.resolve.alias,
        './crypto/build/Release/sshcrypto.node': false,
        "handlebars": "handlebars/dist/handlebars.js",
    };
    
    // Suppress OpenTelemetry warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@opentelemetry/ },
      /Critical dependency: the request of a dependency is an expression/
    ];
    
    return config;
  },
};

export default nextConfig;
