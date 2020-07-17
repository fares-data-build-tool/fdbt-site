import * as React from 'react';
import { shallow } from 'enzyme';
import SalesOfferPackages, { getServerSideProps, SalesOfferPackagesProps } from '../../src/pages/salesOfferPackages';
import { getMockContext } from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';
import { SOP_INFO_ATTRIBUTE } from '../../src/constants';
import { SalesOfferPackageInfoWithErrors } from '../../src/pages/api/salesOfferPackages';
import { SalesOfferPackageInfo } from '../../src/pages/describeSalesOfferPackage';

describe('pages', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const salesOfferPackagesNoError: SalesOfferPackagesProps = {
        salesOfferPackage: {
            purchaseLocation: [],
            paymentMethod: [],
            ticketFormat: [],
        },
    };

    const salesOfferPackageWithError: SalesOfferPackagesProps = {
        salesOfferPackage: {
            purchaseLocation: [],
            paymentMethod: [],
            ticketFormat: [],
            errors: [{ errorMessage: 'error', id: '' }],
        },
    };

    describe('salesOfferPackage', () => {
        it('should render correctly', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<SalesOfferPackages {...salesOfferPackagesNoError} csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render an error when errors are passed through', () => {
            // eslint-disable-next-line react/jsx-props-no-spreading
            const tree = shallow(<SalesOfferPackages {...salesOfferPackageWithError} csrfToken="" pageProps={[]} />);
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('should show the page correctly when there is no salesPackageOffer session', () => {
            const ctx = getMockContext();
            const expectedProps: SalesOfferPackageInfo = {
                purchaseLocation: [],
                paymentMethod: [],
                ticketFormat: [],
            };

            const result = getServerSideProps(ctx).props.salesOfferPackage;
            expect(result).toEqual(expectedProps);
        });

        it('should set the select purchaseLocation if item has been selected and populate errors if two other sections not selected', () => {
            const errors: ErrorInfo[] = [
                { errorMessage: 'Select ticket Payments', id: 'paymentMethod' },
                { errorMessage: 'Select ticket formats', id: 'ticketFormat' },
            ];

            const ctx = getMockContext({
                session: {
                    [SOP_INFO_ATTRIBUTE]: {
                        purchaseLocation: ['OnBoard'],
                        paymentMethod: [],
                        ticketFormat: [],
                        errors,
                    },
                },
            });

            const expectedProps: SalesOfferPackageInfoWithErrors = {
                purchaseLocation: ['OnBoard'],
                paymentMethod: [],
                ticketFormat: [],
                errors,
            };

            const result = getServerSideProps(ctx).props.salesOfferPackage;
            expect(result).toEqual(expectedProps);
        });
    });
});
