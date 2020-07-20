import { IncomingMessageWithSession } from '../interfaces';
import { SalesOfferPackageInfoWithErrors } from '../pages/api/salesOfferPackages';
import { SalesOfferPackageInfo } from '../pages/describeSalesOfferPackage';
import { SalesOfferPackage, SalesOfferPackageWithErrors } from '../pages/api/describeSalesOfferPackage';
import { SOP_ATTRIBUTE, SOP_INFO_ATTRIBUTE } from '../constants';

type GetSessionAttributeTypes = {
    [SOP_ATTRIBUTE]: undefined | SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: undefined | SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
};

type GetSessionAttribute = <Key extends keyof GetSessionAttributeTypes>(
    req: IncomingMessageWithSession,
    attributeName: Key,
) => GetSessionAttributeTypes[Key];

export const getSessionAttribute: GetSessionAttribute = (req: IncomingMessageWithSession, attributeName) =>
    req?.session?.[attributeName];

type UpdateSessionAttributeTypes = {
    [SOP_ATTRIBUTE]: SalesOfferPackage | SalesOfferPackageWithErrors | undefined;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors | undefined;
};

type UpdateSessionAttribute = <Key extends keyof UpdateSessionAttributeTypes>(
    req: IncomingMessageWithSession,
    attributeName: Key,
    attributeValue: UpdateSessionAttributeTypes[Key],
) => void;

export const updateSessionAttribute: UpdateSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName,
    attributeValue,
): void => {
    req.session[attributeName] = attributeValue;
};

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy(err => {
        if (err) {
            throw new Error('Could not destroy session');
        }
    });
};
