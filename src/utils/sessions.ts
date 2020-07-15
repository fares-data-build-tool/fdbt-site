import { IncomingMessageWithSession } from '../interfaces';

export const updateSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName: string,
    attributeValue: string | {} | [],
): void => {
    req.session[attributeName] = attributeValue;
};

export const getSessionAttribute = (req: IncomingMessageWithSession, attributeName: string): any =>
    req?.session?.[attributeName];

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(err => {
        if (err) {
            throw new Error('Could not destroy session');
        }
    });
};
