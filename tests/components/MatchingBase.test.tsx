import { shallow, ShallowWrapper } from 'enzyme';
import React from 'react';
import MatchingBase, {
    getDefaultStopItems,
    StopItem,
    renderResetAndAutoPopulateButtons,
} from '../../src/components/MatchingBase';
import { userFareStages, selectedFareStages, zoneStops, service } from '../testData/mockData';

describe('MatchingBase', () => {
    const baseProps = {
        title: 'Matching - Create Fares Data Service',
        description: 'Matching page of the Create Fares Data Service',
        hintText: 'Select a fare stage for each stop.',
        travelineHintText: 'This data has been taken from the Traveline National Dataset and NaPTAN database.',
        heading: 'Match stops to fares stages',
        apiEndpoint: '/api/matching',
    };

    describe('getDefaultStopItems', () => {
        it('should return an array of stop items each with a default dropdown value when there are no selectedFareStages', () => {
            const defaultStopItems = getDefaultStopItems(userFareStages, zoneStops, []);
            [...defaultStopItems].forEach(stopItem => {
                expect(stopItem.dropdownValue).toBe('');
            });
        });

        it('should return an array of stop items with dropdown values macthing those in selectedFareStages', () => {
            const expectedStopItems: StopItem = {
                index: expect.any(Number),
                stopName: expect.any(String),
                atcoCode: expect.any(String),
                naptanCode: expect.any(String),
                stopData: expect.any(String),
                dropdownValue: expect.stringContaining('' || 'Acomb Green Lane' || 'Holl Bank/Beech Ave'),
                dropdownOptions: expect.any(Array),
            };
            const defaultStopItems = getDefaultStopItems(userFareStages, zoneStops, selectedFareStages);
            expect([...defaultStopItems]).toContainEqual(expectedStopItems);
        });

        describe('renderResetAndAutoPopulateButtons', () => {
            it('should render the reset and auto populate buttons on the page', () => {
                const mockFn = jest.fn();
                const wrapper = shallow(renderResetAndAutoPopulateButtons(mockFn, mockFn));
                expect(wrapper).toMatchSnapshot();
            });
        });
    });

    describe('javascript functionality', () => {
        let wrapper: ShallowWrapper;
        const mockSetState = jest.fn();
        jest.mock('react', () => ({ useState: (initialState: unknown): unknown => [initialState, mockSetState] }));
        const mockMouseEvent = ({ preventDefault: jest.fn() } as unknown) as React.MouseEvent;

        beforeEach(() => {
            wrapper = shallow(
                <MatchingBase
                    userFareStages={userFareStages}
                    stops={zoneStops}
                    service={service}
                    error={false}
                    selectedFareStages={selectedFareStages}
                    csrfToken=""
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...baseProps}
                />,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should not render the reset or autopopulate buttons on initial render', () => {
            // NEED A TEST TO CHECK THAT THE BUTTONS ARE NOT RENDERED ON INITIAL STATE
        });

        describe('dropdownSelection', () => {
            it('should update the state such that the dropdown that has been clicked has its value updated to the selected value', () => {
                const mockDropdownInfo = {
                    index: 5,
                    value: 'Acomb Green Lane',
                };
                (wrapper.find(`#option-${mockDropdownInfo.index}`).prop('onChange') as Function)({
                    target: {
                        value: mockDropdownInfo.value,
                    },
                });
                expect(wrapper.find(`#option-${mockDropdownInfo.index}`).prop('value')).toEqual(mockDropdownInfo.value);
            });
        });

        describe('resetButtonClick', () => {
            it('should update the state such that each dropdown on the page has its value reset to an empty string', () => {
                // NEED TO MOCK THE stopItems STATE VARIABLE HERE
                // AND ADD AN EXPECT() ON THE VALUES OF EACH DROPDOWN BEFORE THE ONCLICK IS EXECUTED

                (wrapper.find('#reset-all-fare-stages-button').prop('onClick') as Function)(mockMouseEvent);
                wrapper.find('select').forEach(item => {
                    expect(item.prop('value')).toEqual('');
                });
            });
        });

        describe('autoPopulateButtonClick', () => {
            // NEED TO MOCK THE selections STATE VARIABLE HERE TO HAVE (i) ONE (ii) TWO (iii) TEN SELECTIONS MADE
            // AND AMEND THE EXPECT() TO CHECK THAT ALL VALUES WITHIN A RANGE OF THE INDEX HAVE CHANGED

            it('should update the state such that each dropdown below the one selected has its value updated to the selected value', () => {
                (wrapper.find('#auto-populate-fares-stages-button').prop('onClick') as Function)(mockMouseEvent);
                // wrapper.find('select').forEach(item => {
                //     expect(item.prop('value')).toEqual('');
                // });
            });

            it('should update the state such that the dropdowns below the selected values have their value updated correctly for 2 selections', () => {
                (wrapper.find('#auto-populate-fares-stages-button').prop('onClick') as Function)(mockMouseEvent);
                // wrapper.find('select').forEach(item => {
                //     expect(item.prop('value')).toEqual('');
                // });
            });

            it('should update the state such that the dropdowns below the selected values have their value updated correctly for 10 selections', () => {
                (wrapper.find('#auto-populate-fares-stages-button').prop('onClick') as Function)(mockMouseEvent);
                // wrapper.find('select').forEach(item => {
                //     expect(item.prop('value')).toEqual('');
                // });
            });
        });
    });
});
