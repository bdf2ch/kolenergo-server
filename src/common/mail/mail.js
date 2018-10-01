"use strict";
const nodemailer = require('nodemailer');

export function sendFeedback(from, to, subject, message) {
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
                        html: message
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            //reject(error);
                            resolve(false);
                            return console.log(error);
                        }
                        console.log('Message sent: %s', info.messageId);
                    resolve(true);
                });
            } catch (err) {
                reject(err);
            }
});
}