import describeSalesOfferPackage, {
    sopInfoSchema,
    checkUserInput,
    SalesOfferPackage,
    SalesOfferPackageWithErrors,
} from '../../../src/pages/api/describeSalesOfferPackage';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { SalesOfferPackageInfo } from '../../../src/pages/describeSalesOfferPackage';
import { ErrorInfo } from '../../../src/interfaces';
import * as sessionUtils from '../../../src/utils/sessions';
import { SOP_ATTRIBUTE, SOP_INFO_ATTRIBUTE } from '../../../src/constants';
// import { SalesOfferPackageInfoWithErrors } from '../../../src/pages/api/salesOfferPackages';

describe('describeSalesOfferPackage', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessionUtils, 'updateSessionAttribute');

    const mockError: ErrorInfo = expect.objectContaining({ errorMessage: expect.any(String), id: expect.any(String) });

    const mockSopInfoAttribute: SalesOfferPackageInfo = {
        purchaseLocation: ['OnBus', 'Shop', 'Mobile'],
        paymentMethod: ['Card', 'Cash'],
        ticketFormat: ['Paper', 'Mobile'],
    };
    // const mockSopInfoAttributeWithErrors: SalesOfferPackageInfoWithErrors = {
    //     purchaseLocation: [],
    //     paymentMethod: ['Card', 'Cash'],
    //     ticketFormat: [],
    //     errors: [mockError, mockError],
    // };
    const mockSopAttribute: SalesOfferPackage = {
        name: 'Sales Offer Package',
        description: 'This is a sales offer package',
        ...mockSopInfoAttribute,
    };
    const mockSopAttributeWithErrors: SalesOfferPackageWithErrors = {
        name: '',
        description: '',
        ...mockSopInfoAttribute,
        errors: [mockError, mockError],
    };

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('sopInfoSchema', () => {
        it.each([
            [{}, false],
            [{ name: 'Adult Weekly Rider' }, false],
            [{ description: 'This is a sales offer package' }, false],
            [{ name: 'Really long way of saying Adult Weekly Rider' }, false],
            [
                {
                    description:
                        'Exceptionally long description of a sales offer package which could have just been something smaller',
                },
                false,
            ],
            [
                {
                    name: 'Really long way of saying Adult Weekly Rider',
                    description: 'A description that is just ever so slightly a bit too long',
                },
                false,
            ],
            [{ name: 'Adult Weekly Rider', description: 'Available on bus, with cash and card' }, true],
        ])('should validate that %s is %s', (candidate, validity) => {
            const result = sopInfoSchema.isValidSync(candidate);
            expect(result).toEqual(validity);
        });
    });

    describe('checkUserInput', () => {
        it('should return a SOP object with no errors when user input is valid', async () => {
            const mockSOPWithUserInput: SalesOfferPackage = {
                name: 'Adult Weekly Rider',
                description: 'Available on bus, with cash and card',
                ...mockSopInfoAttribute,
            };
            const actualInputCheck = await checkUserInput(mockSOPWithUserInput);
            expect(actualInputCheck).toEqual(mockSOPWithUserInput);
        });

        it('should return a SOP object containing errors when user input is not valid', async () => {
            const mockSOPMissingUserInput: SalesOfferPackage = {
                name: '',
                description: '',
                ...mockSopInfoAttribute,
            };
            const actualInputCheck = await checkUserInput(mockSOPMissingUserInput);
            expect(actualInputCheck).toEqual(mockSopAttributeWithErrors);
        });
    });

    // it('should throw an error if SOP_INFO_ATTRIBUTE is missing', async () => {
    //     const { req, res } = getMockRequestAndResponse({
    //         body: {
    //             salesOfferPackageName: 'Sales Offer Package',
    //             salesOfferPackageDescription: 'This is a sales offer package',
    //         },
    //         mockWriteHeadFn: writeHeadMock,
    //     });
    //     await expect(() => describeSalesOfferPackage(req, res)).toThrow();
    //     expect(writeHeadMock).toBeCalledWith(302, {
    //         Location: '/error',
    //     });
    // });

    // it('should throw an error if SOP_INFO_ATTRIBUTE contains errors', async () => {
    //     const { req, res } = getMockRequestAndResponse({
    //         session: {
    //             [SOP_INFO_ATTRIBUTE]: mockSopInfoAttributeWithErrors,
    //         },
    //         body: {
    //             salesOfferPackageName: 'Sales Offer Package',
    //             salesOfferPackageDescription: 'This is a sales offer package',
    //         },
    //     });
    //     await expect(() => describeSalesOfferPackage(req, res)).toThrow();
    //     expect(writeHeadMock).toBeCalledWith(302, {
    //         Location: '/error',
    //     });
    // });

    it('should update the SOP_ATTRIBUTE and redirect to itself (i.e. /describeSalesOfferPackage) when validation results in errors', async () => {
        const { req, res } = getMockRequestAndResponse({
            session: {
                [SOP_INFO_ATTRIBUTE]: mockSopInfoAttribute,
            },
            body: { salesOfferPackageName: '', salesOfferPackageDescription: '' },
            mockWriteHeadFn: writeHeadMock,
        });
        await describeSalesOfferPackage(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_ATTRIBUTE, mockSopAttributeWithErrors);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
    it('should update the SOP_ATTRIBUTE and redirect to /describeSalesOfferPackage when there are no errors', async () => {
        const { req, res } = getMockRequestAndResponse({
            session: {
                [SOP_INFO_ATTRIBUTE]: mockSopInfoAttribute,
            },
            body: {
                salesOfferPackageName: 'Sales Offer Package',
                salesOfferPackageDescription: 'This is a sales offer package',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await describeSalesOfferPackage(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_ATTRIBUTE, mockSopAttribute);
        expect(writeHeadMock).toBeCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
});
