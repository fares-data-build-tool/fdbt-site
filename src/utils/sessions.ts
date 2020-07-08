import { IncomingMessageWithSession, SessionAttributeCollection } from '../interfaces';

export const updateSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName: string,
    attributeValue: string | {},
): void => {
    req.session[attributeName] = attributeValue;
};

export const getSessionAttributes = (
    req: IncomingMessageWithSession,
    attributes: string[],
): SessionAttributeCollection => {
    const attributeCollection: SessionAttributeCollection = {};
    attributes.forEach(attribute => {
        attributeCollection[attribute] = req.session[attribute];
    });
    return attributeCollection;
};

export const overwriteSession = (req: IncomingMessageWithSession, session: {}): void => {
    req.session = session;
};

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(() => {
        throw new Error('Could not destroy session');
    });
};
