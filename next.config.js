const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');

const nextConfig = {
    target: 'server',
    poweredByHeader: false,
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.(pdf|csv)$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/files/',
                    outputPath: '../static/files/',
                    name: '[name]-[contentHash:8].[ext]',
                    esModule: false,
                },
            },
        });

        if (!isServer) {
            config.node = {
                fs: 'empty',
            };
        }

        return config;
    },
};

module.exports = withPlugins([[withImages]], nextConfig);
