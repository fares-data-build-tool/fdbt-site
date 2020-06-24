import { NextPageContext } from 'next';
import breadcrumb from '../../src/utils/breadcrumbs';
import {
    getMockContext,
    mockSingleAdultCsvUploadFromMatchingBreadcrumbs,
    mockReturnAnyoneManualFromPriceEntryBreadcrumbs,
    mockPeriodGeoZoneSeniorFromCsvZoneUploadBreadcrumbs,
    mockFlatFareStudentFromDefinePassengerTypeBreadcrumbs,
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

    it('creates the correct array of Breadcrumbs if user is on csv zone upload page having selected period geozone and senior', () => {
        ctx = getMockContext({
            url: '/csvZoneUpload',
            cookies: {
                fareType: 'period',
                periodTypeName: 'periodGeoZone',
                passengerType: { passengerType: 'Senior' },
            },
        });
        const result = breadcrumb(ctx).generate();

        expect(result).toEqual(mockPeriodGeoZoneSeniorFromCsvZoneUploadBreadcrumbs);
    });

    it('creates the correct array of Breadcrumbs if user is on define passenger type page having selected flat fare and student', () => {
        ctx = getMockContext({
            url: '/definePassengerType',
            cookies: { fareType: 'flatFare', passengerType: { passengerType: 'Student' } },
        });
        const result = breadcrumb(ctx).generate();

        expect(result).toEqual(mockFlatFareStudentFromDefinePassengerTypeBreadcrumbs);
    });
});
