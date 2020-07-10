export const OPERATOR_COOKIE = 'fdbt-operator';

export const FARE_TYPE_ATTRIBUTE = 'fdbt-fare-type';

export const PASSENGER_TYPE_ATTRIBUTE = 'fdbt-passenger-type';

export const SERVICE_ATTRIBUTE = 'fdbt-service';

export const JOURNEY_ATTRIBUTE = 'fdbt-journey';

export const GOVUK_LINK = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/';

export const FARE_STAGES_ATTRIBUTE = 'fdbt-fare-stages';

export const STAGE_NAME_VALIDATION_ATTRIBUTE = 'fdbt-stage-names-validation';

export const FEEDBACK_LINK = 'mailto:fdbt@transportforthenorth.com?bcc=tfn-feedback@infinityworks.com';

export const STAGE_NAMES_ATTRIBUTE = 'fdbt-stage-names';

export const DAYS_VALID_ATTRIBUTE = 'fdbt-days-valid';

export const PRODUCT_DETAILS_ATTRIBUTE = 'fdbt-product-details';

export const PERIOD_TYPE_ATTRIBUTE = 'fdbt-period-type';

export const CSV_UPLOAD_ATTRIBUTE = 'fdbt-csv-upload';

export const CSV_ZONE_UPLOAD_ATTRIBUTE = 'fdbt-csv-zone-upload';

export const PERIOD_EXPIRY_ATTRIBUTE = 'fdbt-period-expiry';

export const SERVICE_LIST_ATTRIBUTE = 'fdbt-services';

export const INPUT_METHOD_ATTRIBUTE = 'fdbt-input-method';

export const NUMBER_OF_STAGES_ATTRIBUTE = 'fdbt-number-stages';

export const MATCHING_ATTRIBUTE = 'fdbt-matching';

export const NUMBER_OF_PRODUCTS_ATTRIBUTE = 'fdbt-number-of-products';

export const MULTIPLE_PRODUCT_ATTRIBUTE = 'fdbt-multiple-product';

export const USER_ATTRIBUTE = 'fdbt-user';

export const FORGOT_PASSWORD_ATTRIBUTE = 'fdbt-reset-password';

export const ID_TOKEN_COOKIE = 'fdbt-id-token';

export const REFRESH_TOKEN_COOKIE = 'fdbt-refresh-token';

export const DISABLE_AUTH_COOKIE = 'fdbt-disable-auth';

export const PRICE_ENTRY_INPUTS_ATTRIBUTE = 'fdbt-price-entry-inputs';

export const PRICE_ENTRY_ERRORS_ATTRIBUTE = 'fdbt-price-entry-errors';

export const ALLOWED_CSV_FILE_TYPES = [
    'text/plain',
    'text/x-csv',
    'application/vnd.ms-excel',
    'application/csv',
    'application/x-csv',
    'application/octet-stream',
    'text/csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'text/tab-separated-values',
];

export const STAGE = process.env.STAGE || 'dev';

export const RAW_USER_DATA_BUCKET_NAME = `fdbt-raw-user-data-${STAGE}`;
export const USER_DATA_BUCKET_NAME = `fdbt-user-data-${STAGE}`;
export const MATCHING_DATA_BUCKET_NAME = `fdbt-matching-data-${STAGE}`;
