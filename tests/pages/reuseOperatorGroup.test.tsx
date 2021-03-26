import * as React from 'react';
import { shallow } from 'enzyme';
import {
    mockFieldSetForReuseOperatorGroup,
    mockFieldSetForReuseOperatorGroupWithErrorsIfRadioNotSelected,
    mockFieldSetForReuseOperatorGroupWithErrorsIfOptionNotSelected,
} from '../testData/mockData';
import { ErrorInfo } from '../../src/interfaces';
import ReuseOperatorGroup, { getFieldsets } from '../../src/pages/reuseOperatorGroup';

describe('pages', () => {
    describe('reuseOperatorGroup', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <ReuseOperatorGroup errors={[]} csrfToken="" fieldset={mockFieldSetForReuseOperatorGroup} />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render errors when user does not select a radio button', () => {
            const tree = shallow(
                <ReuseOperatorGroup
                    errors={[{ errorMessage: 'Choose one of the options below', id: 'conditional-form-group' }]}
                    csrfToken=""
                    fieldset={mockFieldSetForReuseOperatorGroupWithErrorsIfRadioNotSelected}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render errors when user does not provide a group name', () => {
            const tree = shallow(
                <ReuseOperatorGroup
                    errors={[
                        {
                            errorMessage: 'Choose a premade operator group from the options below',
                            id: 'premadeOperatorGroup',
                        },
                    ]}
                    csrfToken=""
                    fieldset={mockFieldSetForReuseOperatorGroupWithErrorsIfNameMissing}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getFieldset', () => {
            it('should return fieldsets with no errors when no errors are passed', () => {
                const emptyErrors: ErrorInfo[] = [];
                const fieldsets = getFieldset(emptyErrors);
                expect(fieldsets).toEqual(mockFieldSetForReuseOperatorGroup);
            });

            it('should return fieldsets with radio errors when radio errors are passed', () => {
                const radioErrors: ErrorInfo[] = [
                    { errorMessage: 'Choose one of the options below', id: 'conditional-form-group' },
                ];
                const fieldsets = getFieldset(radioErrors);
                expect(fieldsets).toEqual(mockFieldSetForReuseOperatorGroupWithErrorsIfRadioNotSelected);
            });

            it('should return fieldsets with input errors when input errors are passed', () => {
                const inputErrors: ErrorInfo[] = [
                    {
                        errorMessage: 'Choose a premade operator group from the options below',
                        id: 'premadeOperatorGroup',
                    },
                ];
                const fieldsets = getFieldset(inputErrors);
                expect(fieldsets).toEqual(mockFieldSetForReuseOperatorGroupWithErrorsIfNameMissing);
            });
        });
    });
});
