import { formatStopPoint } from '../../src/utils/dataTransform';
import { Stop, StopPoint } from '../../src/interfaces';

describe('dataTransform', () => {
    describe('formatStopPoint', () => {
        const stopPoint: StopPoint = {
            stopPointRef: '13003921A',
            commonName: 'Estate (Hail and Ride) N/B',
        };

        it('should format stop point with locality name and common name', () => {
            const expected = 'Test Town (Estate (Hail and Ride) N/B)';
            const allFieldsStop: Stop = {
                stopName: 'Test Stop',
                naptanCode: '12345',
                atcoCode: 'gvgvxgasvx',
                localityCode: 'GHS167',
                localityName: 'Test Town',
                indicator: 'SE',
                street: 'Test Street',
                parentLocalityName: 'Another town',
            };
            const stopPointDisplay: string = formatStopPoint(stopPoint, allFieldsStop);
            expect(stopPointDisplay).toEqual(expected);
        });

        it('should format stop point with common name but no locality name', () => {
            const expected = 'Estate (Hail and Ride) N/B';
            const noLocalityNameStop: Stop = {
                stopName: 'Test Stop',
                naptanCode: '12345',
                atcoCode: 'gvgvxgasvx',
                localityCode: 'GHS167',
                localityName: '',
                indicator: 'SE',
                street: 'Test Street',
                parentLocalityName: 'Another town',
            };
            const stopPointDisplay: string = formatStopPoint(stopPoint, noLocalityNameStop);
            expect(stopPointDisplay).toEqual(expected);
        });
    });
});
