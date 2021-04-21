import {
    selectFareType,
    defineUserTypeAndTimeRestrictions,
    completeSalesPages,
    completePeriodGeoZonePages,
} from '../support/steps';
import { isUuidStringValid } from '../support/helpers';

describe('The period faretype product journey', () => {
    it('completes successfully for csv upload', () => {
        selectFareType('period');
        defineUserTypeAndTimeRestrictions();
        completePeriodGeoZonePages();
        completeSalesPages();
        isUuidStringValid();
    });
});
