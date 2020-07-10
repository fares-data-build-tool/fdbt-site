import { IncomingMessageWithSession, NextApiRequestWithSession, SessionContents } from '../interfaces';

// export const createSession = (req: IncomingMessageWithSession): void => {
//     req.session = {};
// };

export const updateSessionAttribute = (
    req: IncomingMessageWithSession | NextApiRequestWithSession,
    attributeName: string,
    attributeValue: SessionContents,
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
    if (!req.session || !req.session[attributeName] || !req.session[attributeName].body) {
        return undefined;
    }
    return req.session[attributeName].body;
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
