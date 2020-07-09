import { IncomingMessageWithSession, NextApiRequestWithSession } from '../interfaces';

// export const createSession = (req: IncomingMessageWithSession): void => {
//     req.session = {};
// };

export const updateSessionAttribute = (
    req: IncomingMessageWithSession | NextApiRequestWithSession,
    attributeName: string,
    attributeValue: any,
): void => {
    // if (!req.session) {
    //     req.session = {};
    // }
    req.session[attributeName] = attributeValue;
};

export const getSessionAttribute = (
    req: IncomingMessageWithSession | NextApiRequestWithSession,
    attributeName: string,
): any => {
    // if (!req.session) {
    //     return undefined;
    // }
    return req.session[attributeName];
};

// export const overwriteSession = (
//     req: IncomingMessageWithSession | NextApiRequestWithSession,
//     session: Session,
// ): void => {
//     req.session = session;
// };

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(err => {
        if (err) {
            throw new Error('Could not destroy session');
        }
    });
};
