import { IncomingMessageWithSession, NextApiRequestWithSession, SessionContents } from '../interfaces';

export const updateSessionAttribute = (
    req: IncomingMessageWithSession | NextApiRequestWithSession,
    attributeName: string,
    attributeValue: SessionContents,
): void => {
    req.session[attributeName] = attributeValue;
};

export const getSessionAttribute = (req: IncomingMessageWithSession, attributeName: string): any => {
    return req?.session?.[attributeName]?.body;
};
