import * as React from 'react';
import { shallow } from 'enzyme';

import StageNames, { renderInputFields, getServerSideProps } from '../../src/pages/stageNames';
import { getMockContext } from '../testData/mockData';
import { InputCheck } from '../../src/interfaces';

describe('pages', () => {
    describe('renderInputFields', () => {
        it('should return a list of html elements that matches the number of fare stages and inputCheck objects', () => {
            const mockNumberOfFareStages = 4;
            const mockInputCheck: InputCheck[] = [
                { error: '', inputValue: 'ab', id: 'fare-stage-name-1' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-2' },
                { error: '', inputValue: 'cd', id: 'fare-stage-name-3' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-4' },
            ];
            const renderElements = renderInputFields(mockNumberOfFareStages, mockInputCheck, []);
            expect(renderElements).toHaveLength(4);
        });

        it('should return a <div> element containing <label> and <input> elements with error tags and no default value when there is an inputCheck object containing errors', () => {
            const mockNumberOfFareStages = 2;
            const mockInputCheck: InputCheck[] = [];
            const renderElements = renderInputFields(mockNumberOfFareStages, mockInputCheck, []);
            expect(renderElements).toHaveLength(2);
        });
    });

    describe('stageNames', () => {
        it('should render correctly when a user first visits the page', () => {
            const mockNumberOfFareStages = 6;
            const mockInputChecks: InputCheck[] = [];
            const tree = shallow(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockInputChecks}
                    csrfToken=""
                    pageProps={[]}
                    errors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when a user is redirected to the page from itself when incorrect data is entered', () => {
            const mockNumberOfFareStages = 5;
            const mockInputChecks: InputCheck[] = [
                { error: '', inputValue: '', id: 'fare-stage-name-1' },
                { error: '', inputValue: '', id: 'fare-stage-name-2' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-3' },
                { error: '', inputValue: '', id: 'fare-stage-name-4' },
                { error: '', inputValue: '', id: 'fare-stage-name-5' },
            ];
            const tree = shallow(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockInputChecks}
                    csrfToken=""
                    pageProps={[]}
                    errors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly when a user is redirected to the page from itself when no data is entered', () => {
            const mockNumberOfFareStages = 4;
            const mockinputChecks: InputCheck[] = [
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-1' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-2' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-3' },
                { error: 'Enter a name for this fare stage', inputValue: '', id: 'fare-stage-name-4' },
            ];
            const tree = shallow(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockinputChecks}
                    csrfToken=""
                    pageProps={[]}
                    errors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('displays a number of input fields which matches the number of fare stages in the fareStagesCookie ', () => {
            const ctx = getMockContext();
            const result = getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    errors: [],
                    numberOfFareStages: 6,
                    inputChecks: [],
                },
            });
        });
    });
});
