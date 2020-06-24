import { NextPageContext } from 'next';
import util from 'util';
import breadcrumb from '../../src/utils/breadcrumbs';
import {
    getMockContext,
    mockSingleAdultCsvUploadFromMatchingBreadcrumbs,
    mockReturnAnyoneManualFromPriceEntryBreadcrumbs,
    mockPeriodGeoZoneSeniorFromCsvZoneUploadBreadcrumbs,
} from '../testData/mockData';

describe('breadcrumbs', () => {
    let ctx: NextPageContext;

    it('creates the correct array of Breadcrumbs if user is on matching page having selected single, adult and csv upload', () => {
        ctx = getMockContext({ url: '/matching' });
        const result = breadcrumb(ctx).generate();

        expect(result).toEqual(mockSingleAdultCsvUploadFromMatchingBreadcrumbs);
    });

    it('creates the correct array of Breadcrumbs if user is on price entry page having selected return, anyone and manual upload', () => {
        ctx = getMockContext({
            url: '/priceEntry',
            cookies: { fareType: 'return', inputMethod: 'manual', passengerType: { passengerType: 'anyone' } },
        });
        const result = breadcrumb(ctx).generate();

        expect(result).toEqual(mockReturnAnyoneManualFromPriceEntryBreadcrumbs);
    });

    it.only('creates the correct array of Breadcrumbs if user is on csv zone upload page having selected period geozone and senior', () => {
        ctx = getMockContext({
            url: '/csvZoneUpload',
            cookies: { fareType: 'period', periodTypeName: 'period', passengerType: { passengerType: 'Senior' } },
        });
        console.log(util.inspect(ctx, false, null, true));
        const result = breadcrumb(ctx).generate();
        // console.log(util.inspect(result, false, null, true));
        // console.log(util.inspect(mockPeriodGeoZoneSeniorFromCsvZoneUploadBreadcrumbs, false, null, true));

        expect(result).toEqual(mockPeriodGeoZoneSeniorFromCsvZoneUploadBreadcrumbs);
    });

    it('creates the correct array of Breadcrumbs if user is on define passenger type page having selected flat fare and student', () => {
        ctx = getMockContext({ url: '/definePassengerType' });
        // console.log(util.inspect(ctx, false, null, true));
        const result = breadcrumb(ctx).generate();
        // console.log(util.inspect(result, false, null, true));
        // console.log(util.inspect(mockSingleBreadcrumbs, false, null, true));

        expect(result).toEqual();
    });
});
