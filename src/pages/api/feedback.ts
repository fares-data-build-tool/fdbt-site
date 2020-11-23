import { NextApiResponse } from 'next';
import { removeExcessWhiteSpace } from './apiUtils/validator';
import { redirectToError, redirectTo } from './apiUtils/index';
import { NextApiRequestWithSession } from '../../interfaces';

export const requestIsEmpty = (req: NextApiRequestWithSession): boolean => {
    const { body } = req;
    const refinedHearAboutServiceInput = removeExcessWhiteSpace(body.hearAboutService);
    const refinedGeneralFeedbackInput = removeExcessWhiteSpace(body.generalFeedback);
    if (
        !body.contactQuestion &&
        !body.problemQuestion &&
        refinedHearAboutServiceInput === '' &&
        refinedGeneralFeedbackInput === ''
    ) {
        return true;
    }

    return false;
};

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        if (requestIsEmpty(req)) {
            redirectTo(res, '/feedback?feedbackSubmitted=false');
            return;
        }

        const mailOptions = setMailOptions(s3ObjectParams, pathToSavedNetex, matchingData);

        if (process.env.NODE_ENV === 'development') {
            console.info('mailOptions', mailOptions);
        }

        if (process.env.NODE_ENV !== 'development') {
            const mailTransporter = createMailTransporter();
            await mailTransporter.sendMail(mailOptions);

            console.info(`Email sent.`);
        }

        redirectTo(res, '/feedback?feedbackSubmitted=true');
        return;
    } catch (error) {
        const message = 'There was a problem receiving the user feedback.';
        redirectToError(res, message, 'api.feedback', error);
    }
};
