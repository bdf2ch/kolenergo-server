"use strict";
const nodemailer = require('nodemailer');

export function sendFeedback(from, to, subject, message, event) {
    return new Promise(async (resolve, reject) => {
            try {
                    let transporter = nodemailer.createTransport({
                        host: 'kolu-mail.nw.mrsksevzap.ru',
                        port: 25,
                        secure: false,
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    let mailOptions = {
                        from: from,
                        to: to,
                        subject: subject,
                        html: message,
                        icalEvent: event ? event : null
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            //reject(error);
                            resolve(false);
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                    return resolve(true);
                });
            } catch (err) {
                reject(err);
            }
});
}
