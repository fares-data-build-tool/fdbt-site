import {
    IncomingMessageWithSession,
    ProductInfo,
    ProductData,
    PeriodExpiryWithErrors,
    SelectSalesOfferPackageWithError,
} from '../interfaces';

// Below is an example of how we could implement sessions. We are able to apply types to the actual functions, which in turn use type lookups to return a 'return type' to the function.
// This way we are allowing Typescript to infer the return type on the session functions from the objects we pass them.
// The only extra work that is required to make this work for the site is to create types for each and every 'constant' that we have.
// The types should be the same/similar for each of the get and set functionality.
// An easier way to do this work would be to have a high level type for each 'MatchingData'.
// By nesting type lookups, these sessions methods will be able to accurately infer the correct types for the type that it is called with.
// The only other cautious aspect of these type assertions is to make sure that both the site pages/APIs and these sessions funtions read from the same types/interfaces.

import { SalesOfferPackage, SalesOfferPackageWithErrors } from '../pages/api/describeSalesOfferPackage';
import { SalesOfferPackageInfo } from '../pages/describeSalesOfferPackage';
import { MatchingInfo, MatchingWithErrors, InboundMatchingInfo } from '../interfaces/matchingInterface';
import {
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    SOP_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    PRODUCT_DETAILS_ATTRIBUTE,
} from '../constants';

type MatchingData = {
    [SOP_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackage | SalesOfferPackageWithErrors;
    [MATCHING_ATTRIBUTE]: MatchingWithErrors | MatchingInfo;
    [INBOUND_MATCHING_ATTRIBUTE]: MatchingWithErrors | InboundMatchingInfo;
    [PERIOD_EXPIRY_ATTRIBUTE]: PeriodExpiryWithErrors | ProductData;
    [PRODUCT_DETAILS_ATTRIBUTE]: ProductInfo | ProductData;
    [SALES_OFFER_PACKAGES_ATTRIBUTE]: SelectSalesOfferPackageWithError;
};

type GetSalesOfferPackageSessionAttribute = <Key extends keyof MatchingData>(
    req: IncomingMessageWithSession,
    attributeName: Key,
) => MatchingData[Key];

export const getSessionAttribute: GetSalesOfferPackageSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName,
) => req?.session?.[attributeName];

export const updateSessionAttribute = (
    req: IncomingMessageWithSession,
    attributeName: string,
    attributeValue: string | {} | [],
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
