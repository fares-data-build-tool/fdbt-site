import { Auth } from '@aws-amplify/auth';

const configureAmplifyAuth = (): void => {
    console.log('CONFIGURING AMPLIFY');
    Auth.configure({
        region: 'eu-west-2',
        userPoolId: process.env.FDBT_USER_POOL_ID,
        userPoolWebClientId: process.env.FDBT_USER_POOL_CLIENT_ID,
    });
};

configureAmplifyAuth();

export default Auth;
