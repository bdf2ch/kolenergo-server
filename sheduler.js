"use strict";
const cron = require('node-cron');
const http = require('http');

cron.schedule('* * * * *', () => {
// cron.schedule('*/59 * * * *', () => {
    console.log('running a task every minute');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/osr/weather',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const request = http.request(options, (response) => {
        response.setEncoding('utf8');
        let weatherData = '';
        response.on('data', (data) => {
            console.log(`data: ${data}`);
            weatherData += data;
        });
        response.on('end', () => {
            console.log('No more data in response.');
            console.log(weatherData);
        });
    });
    request.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    request.end();
});


cron.schedule('* * * * *', () => {
// cron.schedule('*/59 * * * *', () => {
    console.log('weather summary every minute');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/osr/weatherSummary',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const request = http.request(options, (response) => {
        response.setEncoding('utf8');
        let weatherData = '';
        response.on('weather summary data', (data) => {
            console.log(`data: ${data}`);
            weatherData += data;
        });
        response.on('end', () => {
            console.log('No more data in weather summary response.');
            console.log(weatherData);
        });
    });
    request.on('error', (e) => {
        console.error(`problem with weather summary request: ${e.message}`);
    });
    request.end();
});




