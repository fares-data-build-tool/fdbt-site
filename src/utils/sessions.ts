import { IncomingMessageWithSession, NextApiRequestWithSession, SessionContents } from '../interfaces';

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
export const getSessionAttribute = (req: IncomingMessageWithSession, attributeName: string): any =>
    req?.session?.[attributeName]?.body;
