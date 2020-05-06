export interface ProductInfo {
    uuid: string;
    productName: string;
    productPrice: string;
    productNameError: string;
    productPriceError: string;
}

export interface ServicesInfo {
    lineName: string;
    startDate: string;
    serviceDescription?: string;
    checked?: boolean;
}

export interface ServiceLists {
    selectedServices: ServicesInfo[];
    error: boolean;
}

export interface BasicService {
    lineName: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
}
