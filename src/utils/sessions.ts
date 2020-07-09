import { IncomingMessageWithSession } from '../interfaces';

export const createSession = (req: IncomingMessageWithSession): void => {
    req.session = {};
};

export const updateSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName: string,
    attributeValue: any,
): void => {
    if (!req.session) {
        req.session = {};
    }
    req.session[attributeName] = attributeValue;
};

export const getSessionAttribute = (req: IncomingMessageWithSession, attribute: string): any => {
    if (!req.session) {
        return undefined;
    }
    return req.session[attribute];
};

export const overwriteSession = (req: IncomingMessageWithSession, session: {}): void => {
    req.session = session;
};

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(() => {
        throw new Error('Could not destroy session');
    });
};