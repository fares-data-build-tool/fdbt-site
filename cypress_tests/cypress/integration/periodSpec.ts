import {
    selectFareType,
    defineUserTypeAndTimeRestrictions,
    completeSalesPages,
    completePeriodGeoZonePages,
} from '../support/steps';
import { isUuidStringValid } from '../support/helpers';

describe('The period faretype product journey', () => {
    it('completes successfully for geozone and a single product', () => {
        selectFareType('period');
        defineUserTypeAndTimeRestrictions();
        completePeriodGeoZonePages();
        completeSalesPages();
        isUuidStringValid();
    });
});
