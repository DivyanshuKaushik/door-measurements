/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
      
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals = [...(config.externals || []), "mongoose"];
        }
        return config;
    },
};

export default nextConfig;
