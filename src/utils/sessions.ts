import { IncomingMessageWithSession } from '../interfaces';

// Below is an example of how we could implement sessions. We are able to apply types to the actual functions, which in turn use type lookups to return a 'return type' to the function.
// This way we are allowing Typescript to infer the return type on the session functions from the objects we pass them.
// The only extra work that is required to make this work for the site is to create types for each and every 'constant' that we have.
// The types should be the same/similar for each of the get and set functionality.
// An easier way to do this work would be to have a high level type for each 'MatchingData'.
// By nesting type lookups, these sessions methods will be able to accurately infer the correct types for the type that it is called with.
// The only other cautious aspect of these type assertions is to make sure that both the site pages/APIs and these sessions funtions read from the same types/interfaces.

// 'Matching Data' needs to be a dictionary of every page name and what types each page cares about.
// Should only be three types for each page/API combination [i] type built up from previous pages in journey [ii] end type that the API formats ready for later pages in the journey [iii] same type as in (ii) but with 'errors: ErrorInfo[]' attached

import { SalesOfferPackageInfoWithErrors } from '../pages/api/salesOfferPackages';
import { SalesOfferPackageInfo } from '../pages/describeSalesOfferPackage';
import { SalesOfferPackage, SalesOfferPackageWithErrors } from '../pages/api/describeSalesOfferPackage';
import { SOP_ATTRIBUTE, SOP_INFO_ATTRIBUTE } from '../constants';

// Look at type narrowing

type GetSessionAttributeTypes = {
    [SOP_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackage | SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: undefined | SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
};

type GetSessionAttribute = <Key extends keyof GetSessionAttributeTypes>(
    req: IncomingMessageWithSession,
    attributeName: Key,
) => GetSessionAttributeTypes[Key];

export const getSessionAttribute: GetSessionAttribute = (req: IncomingMessageWithSession, attributeName) =>
    req?.session?.[attributeName];

type UpdateSessionAttributeTypes = {
    [SOP_ATTRIBUTE]: SalesOfferPackage | SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
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
