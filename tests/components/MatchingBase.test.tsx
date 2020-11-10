import {
    // mount,
    shallow,
    //   ShallowWrapper
} from 'enzyme';
// import React from 'react';
import {
    // MatchingBase,
    getDefaultStopItems,
    StopItem,
    renderResetAndAutoPopulateButtons,
} from '../../src/components/MatchingBase';
import {
    userFareStages,
    selectedFareStages,
    zoneStops,
    // service
} from '../testData/mockData';

// const mockStopItems = new Set([
//     {
//         index: expect.any(Number),
//         stopName: expect.any(String),
//         atcoCode: expect.any(String),
//         naptanCode: expect.any(String),
//         dropdownValue: expect.any(String),
//         stopData: expect.any(String),
//         dropdownOptions: expect.any(Array),
//     },
//     {
//         index: expect.any(Number),
//         stopName: expect.any(String),
//         atcoCode: expect.any(String),
//         naptanCode: expect.any(String),
//         dropdownValue: expect.any(String),
//         stopData: expect.any(String),
//         dropdownOptions: expect.any(Array),
//     },
//     {
//         index: expect.any(Number),
//         stopName: expect.any(String),
//         atcoCode: expect.any(String),
//         naptanCode: expect.any(String),
//         dropdownValue: expect.any(String),
//         stopData: expect.any(String),
//         dropdownOptions: expect.any(Array),
//     },
//     {
//         index: expect.any(Number),
//         stopName: expect.any(String),
//         atcoCode: expect.any(String),
//         naptanCode: expect.any(String),
//         dropdownValue: expect.any(String),
//         stopData: expect.any(String),
//         dropdownOptions: expect.any(Array),
//     },
//     {
//         index: expect.any(Number),
//         stopName: expect.any(String),
//         atcoCode: expect.any(String),
//         naptanCode: expect.any(String),
//         dropdownValue: expect.any(String),
//         stopData: expect.any(String),
//         dropdownOptions: expect.any(Array),
//     },
// ]);

describe('MatchingBase', () => {
    // const baseProps = {
    //     title: 'Matching - Create Fares Data Service',
    //     description: 'Matching page of the Create Fares Data Service',
    //     hintText: 'Select a fare stage for each stop.',
    //     travelineHintText: 'This data has been taken from the Traveline National Dataset and NaPTAN database.',
    //     heading: 'Match stops to fares stages',
    //     apiEndpoint: '/api/matching',
    // };

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

    // describe('javascript functionality', () => {
    //     let wrapper;
    //     const mockSetState = jest.fn();
    //     jest.mock('react', () => ({ useState: (initialState: unknown): unknown => [initialState, mockSetState] }));
    //     const mockEvent = { preventDefault: jest.fn() } as unknown;

    //     beforeEach(() => {
    //         wrapper = mount(
    //             <MatchingBase
    //                 userFareStages={userFareStages}
    //                 stops={zoneStops}
    //                 service={service}
    //                 error={false}
    //                 selectedFareStages={selectedFareStages}
    //                 csrfToken=""
    //                 // eslint-disable-next-line react/jsx-props-no-spreading
    //                 {...baseProps}
    //             />,
    //         ).instance();
    //         wrapper.setState({ stopItems: mockStopItems });
    //     });

    //     afterEach(() => {
    //         jest.clearAllMocks();
    //     });

    //     describe('resetButtonClick', () => {
    //         it('should update the stopItems, selections and javascriptButtonClick state variables when the reset button is clicked', () => {
    //             wrapper
    //                 .find('#reset-all-fare-stages-button')
    //                 .props()
    //                 .onClick(mockEvent);
    //             expect(mockSetState).toHaveBeenCalledTimes(3);
    //         });
    //     });
    // });
    // it('should render value of selected stage as default value if passed in selectedFareStages', () => {
    //     const wrapper = shallow(
    //         <MatchingBase
    //             userFareStages={userFareStages}
    //             stops={zoneStops}
    //             selectedFareStages={[
    //                 '{"stop":{"stopName":"Sophia Street","naptanCode":"durgapwp","atcoCode":"13003661E","localityCode":"E0045957","localityName":"Seaham","parentLocalityName":"IW Test","indicator":"S-bound","street":"Sophia Street"},"stage":"Acomb Green Lane"}',
    //             ]}
    //         />,
    //     );
    //     const selector = wrapper.find('#option-14');
    //     expect(selector.prop('defaultValue')).toEqual(
    //         '{"stop":{"stopName":"Sophia Street","naptanCode":"durgapwp","atcoCode":"13003661E","localityCode":"E0045957","localityName":"Seaham","parentLocalityName":"IW Test","indicator":"S-bound","street":"Sophia Street"},"stage":"Acomb Green Lane"}',
    //     );
    // });

    // it('should render no value as default value if empty array passed in selectedFareStages', () => {
    //     const wrapper = shallow(
    //         <MatchingBase userFareStages={userFareStages} stops={zoneStops} selectedFareStages={[]} />,
    //     );
    //     const selector = wrapper.find('#option-1');
    //     expect(selector.prop('defaultValue')).toEqual('');
    // });
});
