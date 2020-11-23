import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import AWS from 'aws-sdk';
import { Feedback } from '../../../interfaces';

export const buildFeedbackContent = (feedbackQuestions: Feedback[]): string => {
    let content = '';

    feedbackQuestions.forEach(question => {
        content = `${content} `
    })
};

export const setFeedbackMailOptions = (emailTo: string, nocCodeOfSender: string, feedback: Feedback): Mail.Options => {
    return {
        from: 'fdbt@transportforthenorth.com',
        to: emailTo,
        subject: `Feedback received from ${nocCodeOfSender}`,
        text: buildFeedbackContent(feedback),
    };
};

export const createMailTransporter = (): Mail => {
    return nodemailer.createTransport({
        SES: new AWS.SES({
            apiVersion: '2010-12-01',
            region: 'eu-west-1',
        }),
    });
};
