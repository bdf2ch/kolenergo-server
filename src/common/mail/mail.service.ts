import { Component } from '@nestjs/common';
import { sendFeedback } from './mail.js';

@Component()
export class MailService {

    constructor() {}

    async send(from: string, to: string, subject: string, message) {
        await sendFeedback(from, to, subject, message);
    }
}