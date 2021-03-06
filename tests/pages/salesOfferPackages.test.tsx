import * as React from 'react';
import { shallow } from 'enzyme';
import SalesOfferPackages, {
    getServerSideProps,
    SalesOfferPackagesProps,
    valuesMap,
} from '../../src/pages/salesOfferPackages';
import { getMockContext } from '../testData/mockData';
import { ErrorInfo, SalesOfferPackageInfo, SalesOfferPackageInfoWithErrors } from '../../src/interfaces';
import { SOP_INFO_ATTRIBUTE } from '../../src/constants/attributes';

describe('pages', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const salesOfferPackagesNoError: SalesOfferPackagesProps = {
        salesOfferPackage: {
            purchaseLocations: [],
            paymentMethods: [],
            ticketFormats: [],
        },
        csrfToken: '',
    };

    const salesOfferPackagesNoErrorWithMappedValues: SalesOfferPackagesProps = {
        salesOfferPackage: {
            purchaseLocations: ['agency'],
            paymentMethods: ['contactlessTravelCard'],
            ticketFormats: ['mobileApp'],
        },
        csrfToken: '',
    };

    const salesOfferPackageWithError: SalesOfferPackagesProps = {
        salesOfferPackage: {
            purchaseLocations: [],
            paymentMethods: [],
            ticketFormats: [],
            errors: [{ errorMessage: 'error', id: '' }],
        },
        csrfToken: '',
    };

    describe('salesOfferPackage', () => {
        it('should render correctly', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<SalesOfferPackages {...salesOfferPackagesNoError} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render mapped values correctly', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<SalesOfferPackages {...salesOfferPackagesNoErrorWithMappedValues} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render an error when errors are passed through', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<SalesOfferPackages {...salesOfferPackageWithError} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('should show the page correctly when there is no salesPackageOffer session', () => {
            const ctx = getMockContext();
            const expectedProps: SalesOfferPackageInfo = {
                purchaseLocations: [],
                paymentMethods: [],
                ticketFormats: [],
            };

            const result = getServerSideProps(ctx).props.salesOfferPackage;
            expect(result).toEqual(expectedProps);
        });

        it('should set the select purchaseLocations if item has been selected and populate errors if two other sections not selected', () => {
            const errors: ErrorInfo[] = [
                { errorMessage: 'Select ticket Payments', id: 'paymentMethods' },
                { errorMessage: 'Select ticket formats', id: 'ticketFormats' },
            ];

            const ctx = getMockContext({
                session: {
                    [SOP_INFO_ATTRIBUTE]: {
                        purchaseLocations: ['OnBoard'],
                        paymentMethods: [],
                        ticketFormats: [],
                        errors,
                    },
                },
            });

            const expectedProps: SalesOfferPackageInfoWithErrors = {
                purchaseLocations: ['OnBoard'],
                paymentMethods: [],
                ticketFormats: [],
                errors,
            };

            const result = getServerSideProps(ctx).props.salesOfferPackage;
            expect(result).toEqual(expectedProps);
        });
    });
    describe('valuesMap', () => {
        it('doesnt return a value for a non-mapped value', () => {
            expect(valuesMap.directDebit).toBeUndefined();
        });
        it('returns a value for agency', () => {
            expect(valuesMap.agency).toBe('Travel Shop');
        });
        it('returns a value for contactlessTravelCard', () => {
            expect(valuesMap.contactlessTravelCard).toBe('Contactless SmartCard (e.g Oyster)');
        });
    });
});
