import * as React from 'react';
import { shallow } from 'enzyme';

import DefineTimeRestrictions, { getServerSideProps, getFieldsets } from '../../src/pages/defineTimeRestrictions';
import {
    mockDefineTimeRestrictionsFieldsets,
    mockDefineTimeRestrictionsFieldsetsWithRadioErrors,
    mockDefineTimeRestrictionsFieldsetsWithInputErrors,
    mockDefineTimeRestrictionsFieldsetsWithRadioAndInputErrors,
    getMockContext,
} from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';
import { TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE } from '../../src/constants';
import { TimeRestrictionsDefinitionWithErrors } from '../../src/pages/api/defineTimeRestrictions';

describe('pages', () => {
    describe('defineTimeRestrictions', () => {
        const mockRadioErrors: ErrorInfo[] = [
            {
                id: 'define-time-restrictions',
                errorMessage: 'Choose one of the options below',
            },
            {
                id: 'define-valid-days',
                errorMessage: 'Choose one of the options below',
            },
        ];
        const mockInputErrors: ErrorInfo[] = [
            {
                id: 'start-time',
                errorMessage: 'Enter a start or end time in 24 hour format',
            },
            {
                id: 'end-time',
                errorMessage: 'Enter a start or end time in 24 hour format',
            },
            {
                id: 'valid-days-required',
                errorMessage: 'Select at least one day',
            },
        ];
        const mockRadioAndInputErrors: ErrorInfo[] = [
            {
                id: 'start-time',
                errorMessage: 'Enter a start or end time in 24 hour format',
            },
            {
                id: 'end-time',
                errorMessage: 'Enter a start or end time in 24 hour format',
            },
            {
                id: 'define-valid-days',
                errorMessage: 'Choose one of the options below',
            },
        ];

        it('should render correctly when no errors are passed', () => {
            const wrapper = shallow(
                <DefineTimeRestrictions
                    errors={[]}
                    fieldsets={mockDefineTimeRestrictionsFieldsets}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render errors correctly when radio errors are passed to the page', () => {
            const wrapper = shallow(
                <DefineTimeRestrictions
                    errors={mockRadioErrors}
                    fieldsets={mockDefineTimeRestrictionsFieldsetsWithRadioErrors}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render errors correctly when input errors are passed to the page', () => {
            const wrapper = shallow(
                <DefineTimeRestrictions
                    errors={mockInputErrors}
                    fieldsets={mockDefineTimeRestrictionsFieldsetsWithInputErrors}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render errors correctly when both radio and input errors are passed to the page', () => {
            const wrapper = shallow(
                <DefineTimeRestrictions
                    errors={mockRadioAndInputErrors}
                    fieldsets={mockDefineTimeRestrictionsFieldsetsWithRadioAndInputErrors}
                    csrfToken=""
                    pageProps={[]}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        describe('getFieldsets', () => {
            it('should return fieldsets with no errors when no errors are passed', () => {
                const emptyErrors: ErrorInfo[] = [];
                const fieldsets = getFieldsets(emptyErrors);
                expect(fieldsets).toEqual(mockDefineTimeRestrictionsFieldsets);
            });

            it('should return fieldsets with radio errors when radio errors are passed', () => {
                const fieldsets = getFieldsets(mockRadioErrors);
                expect(fieldsets).toEqual(mockDefineTimeRestrictionsFieldsetsWithRadioErrors);
            });

            it('should return fieldsets with input errors when input errors are passed', () => {
                const fieldsets = getFieldsets(mockInputErrors);
                expect(fieldsets).toEqual(mockDefineTimeRestrictionsFieldsetsWithInputErrors);
            });

            it('should return fieldsets with radio and input errors when both radio and input errors are passed', () => {
                const fieldsets = getFieldsets(mockRadioAndInputErrors);
                expect(fieldsets).toEqual(mockDefineTimeRestrictionsFieldsetsWithRadioAndInputErrors);
            });
        });

        describe('getServerSideProps', () => {
            afterEach(() => {
                jest.resetAllMocks();
            });

            it('should return props containing no errors and valid fieldsets when no errors are present', () => {
                const ctx = getMockContext();
                const result = getServerSideProps(ctx);
                expect(result.props.errors).toEqual([]);
                expect(result.props.fieldsets).toEqual(mockDefineTimeRestrictionsFieldsets);
            });
            it('should return props containing errors and valid fieldsets when errors are present', () => {
                const timeRestrictionsDefinition: TimeRestrictionsDefinitionWithErrors = {
                    validDays: ['monday', 'tuesday'],
                    errors: mockInputErrors,
                };
                const ctx = getMockContext({
                    session: {
                        [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: timeRestrictionsDefinition,
                    },
                });
                const result = getServerSideProps(ctx);
                expect(result.props.errors).toEqual(mockInputErrors);
                expect(result.props.fieldsets).toEqual(mockDefineTimeRestrictionsFieldsetsWithInputErrors);
            });
        });
    });
});
