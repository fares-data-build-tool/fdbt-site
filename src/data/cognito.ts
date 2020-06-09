import { CognitoIdentityServiceProvider } from 'aws-sdk';
import awsParamStore from 'aws-param-store';
import crypto from 'crypto';

const clientId = process.env.FDBT_USER_POOL_CLIENT_ID as string;
const userPoolId = process.env.FDBT_USER_POOL_ID as string;
let clientSecret: string | undefined;

const getCognitoClient = (): CognitoIdentityServiceProvider => new CognitoIdentityServiceProvider();

const cognito = getCognitoClient();

const calculateSecretHash = (username: string): string => {
    if (!clientSecret) {
        clientSecret = awsParamStore.getParameterSync('fdbt-cognito-client-secret', { region: 'eu-west-2' }).Value;
    }
    return crypto
        .createHmac('SHA256', clientSecret as string)
        .update(username + clientId)
        .digest('base64');
};

export const initiateAuth = async (
    username: string,
    password: string,
): Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse> => {
    const params: CognitoIdentityServiceProvider.AdminInitiateAuthRequest = {
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        ClientId: clientId,
        UserPoolId: userPoolId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: calculateSecretHash(username),
        },
    };

    try {
        const response = await cognito.adminInitiateAuth(params).promise();

        return response;
    } catch (error) {
        throw new Error(`Failed to authenticate user: ${error.stack}`);
    }
};

export const respondToNewPasswordChallenge = async (
    username: string,
    password: string,
    session: string,
): Promise<void> => {
    const params: CognitoIdentityServiceProvider.AdminRespondToAuthChallengeRequest = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: clientId,
        UserPoolId: userPoolId,
        ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: password,
            SECRET_HASH: calculateSecretHash(username),
        },
        Session: session,
    };

    try {
        await cognito.adminRespondToAuthChallenge(params).promise();
    } catch (error) {
        throw new Error(`Failed to respond to password challenge: ${error.stack}`);
    }
};

export const globalSignOut = async (username: string): Promise<void> => {
    const params: CognitoIdentityServiceProvider.AdminUserGlobalSignOutRequest = {
        Username: username,
        UserPoolId: userPoolId,
    };

    try {
        await cognito.adminUserGlobalSignOut(params).promise();
    } catch (error) {
        throw new Error(`Failed to perform global sign out: ${error.stack}`);
    }
};

export const updateUserAttributes = async (
    username: string,
    attributes: { Name: string; Value: string }[],
): Promise<void> => {
    const params: CognitoIdentityServiceProvider.AdminUpdateUserAttributesRequest = {
        UserAttributes: attributes,
        UserPoolId: userPoolId,
        Username: username,
    };

    try {
        await cognito.adminUpdateUserAttributes(params).promise();
    } catch (error) {
        throw new Error(`Failed to update user attributes: ${error.stack}`);
    }
};

export const forgotPassword = async (username: string): Promise<void> => {
    const params: CognitoIdentityServiceProvider.ForgotPasswordRequest = {
        ClientId: clientId,
        Username: username,
        SecretHash: calculateSecretHash(username),
    };

    try {
        await cognito.forgotPassword(params).promise();
    } catch (error) {
        throw new Error(`Failed to perform forgot password request: ${error.stack}`);
    }
};

export const confirmForgotPassword = async (
    username: string,
    confirmationCode: string,
    password: string,
): Promise<void> => {
    const params: CognitoIdentityServiceProvider.ConfirmForgotPasswordRequest = {
        ClientId: clientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        Password: password,
    };

    try {
        await cognito.confirmForgotPassword(params).promise();
    } catch (error) {
        throw new Error(`Failed to confirm forgotten password: ${error.stack}`);
    }
};
