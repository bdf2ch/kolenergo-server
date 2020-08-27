import { Component } from '@nestjs/common';
import { IcalAttachment } from 'nodemailer/lib/mailer';

import { sendFeedback } from './mail.js';


@Component()
export class MailService {

    constructor() {}

    async send(from: string, to: string, subject: string, message, event?: IcalAttachment) {
        await sendFeedback(from, to, subject, message, event);
    }
}
