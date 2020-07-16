import * as React from 'react';
import { shallow } from 'enzyme';
import SalesOfferPackages, { getServerSideProps, SalesOfferPackagesProps } from '../../src/pages/salesOfferPackages';
import { getMockContext } from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';
import { SALES_OFFER_PACKAGES_ATTRIBUTE } from '../../src/constants';

describe('pages', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    const salesOfferPackagesNoError: SalesOfferPackagesProps = {
        ticketsPurchasedFrom: { selected: [] },
        ticketPayments: { selected: [] },
        ticketFormats: { selected: [] },
        errors: [],
    };

    const salesOfferPackageWithError: SalesOfferPackagesProps = {
        ticketsPurchasedFrom: { selected: [] },
        ticketPayments: { selected: [] },
        ticketFormats: { selected: [] },
        errors: [{ errorMessage: 'error', id: '' }],
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

            const result = getServerSideProps(ctx);

            expect(result.props.ticketsPurchasedFrom.selected.length).toBe(0);
            expect(result.props.ticketPayments.selected.length).toBe(0);
            expect(result.props.ticketPayments.selected.length).toBe(0);
            expect(result.props.errors.length).toBe(0);
        });

        it('should set the select ticketsPurchasedFrom if item has been selected and populate errors if two other sections not selected', () => {
            const errors: ErrorInfo[] = [];

            errors.push({ errorMessage: 'Select ticket Payments', id: 'ticketPayments' });
            errors.push({ errorMessage: 'Select ticket formats', id: 'ticketFormats' });

            const ctx = getMockContext({
                session: {
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: {
                        body: {
                            ticketsPurchasedFrom: ['OnBoard'],
                            ticketPayments: [],
                            ticketFormats: [],
                            errors,
                        },
                    },
                },
            });

            const result = getServerSideProps(ctx);

            expect(result.props.ticketsPurchasedFrom.selected.length).toBe(1);
            expect(result.props.ticketPayments.selected.length).toBe(0);
            expect(result.props.ticketFormats.selected.length).toBe(0);
            expect(result.props.errors.length).toBe(2);
        });
    });
});
