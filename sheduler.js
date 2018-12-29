"use strict";
const cron = require('node-cron');
const https = require('https');

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');
    https.get('https://api.openweathermap.org/data/2.5/weather?q=Murmansk&appid=7d76240ac937e51c8544c06d87e8be27&units=metric', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(JSON.parse(data));
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
});




