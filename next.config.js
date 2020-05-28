const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const withFonts = require('next-fonts');
const { Amplify } = require('@aws-amplify/core');

const nextConfig = {
    target: 'server',
    webpack: function(config) {
        const originalEntry = config.entry;
        config.entry = async () => {
            const entries = await originalEntry();
            Amplify.configure({
                Auth: {
                    region: 'eu-west-2',
                    userPoolId: process.env.FDBT_USER_POOL_ID,
                    userPoolWebClientId: process.env.FDBT_USER_POOL_CLIENT_ID,
                },
            });
            return entries;
        };
        return config;
    },
};

module.exports = withPlugins([[withFonts], [withImages]], nextConfig);
