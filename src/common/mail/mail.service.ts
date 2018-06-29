import { Component } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

@Component()
export class MailService {
    private transport;

    constructor() {}

    send() {
        nodemailer.createTestAccount((error, account) => {
            if (error) {
                console.log('account', error);
            }

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'kolu-mail.nw.mrsksevzap.ru',
                port: 25,
                secure: false,
                tls: {
                    rejectUnauthorized: false
                },
            });

            transporter.verify((err, success) => {
                if (err) {
                    console.log('verify', err);
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: 'Телефонный справочник', // sender address
                to: 'savoronov@kolenergo.ru', // list of receivers
                //subject: 'Абонент загрузил фото', // Subject line
                //text: 'Hello world?', // plain text body
                //html: '<b>Hello world?</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log('send', error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        });
    }
}