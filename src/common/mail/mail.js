"use strict";
const nodemailer = require('nodemailer');

export function sendFeedback(message) {
    return new Promise(async (resolve, reject) => {
        if (userId) {
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
                        from: '"Телефонный справочник" <phonebook@kolenergo.ru>',
                        to: 'savoronov@kolenergo.ru',
                        subject: `Отправлено сообщение (${theme}).`,
                        html: `<b>${user.name} ${user.fname} ${user.surname}</b> отправил сообщение.<br>
                                       Тема сообщения: ${theme}<br>
                                       Текст сообщения: ${message['message']}`
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
        } else {
            //resolve(false);
            reject({error: 'User id not specified', description: 'User id parameter not specified'});
}
});
}