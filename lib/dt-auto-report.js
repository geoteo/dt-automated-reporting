const CLI = require('clui');
const spinner = CLI.Spinner;
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');
const Configstore = require('configstore');
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);
const path = require('path');
const dirPath = path.resolve(__dirname, '../');
const filePath = path.resolve(dirPath, 'config.json');

var config = [];

module.exports = {

    getSMTP: () => {
        return conf.get('smtp');
    },

    configSMTP: (smtp) => {
        conf.set('smtp.host', smtp.host);
        conf.set('smtp.port', smtp.port);
        conf.set('smtp.user', smtp.user);
        conf.set('smtp.secure', smtp.secure);
        conf.set('smtp.password', smtp.password);
    },

    getStoredConfig: () => {
        try {
            fs.createFileSync(filePath);
            var jsonData = JSON.stringify(filePath);
            var jsonParsed = JSON.parse(jsonData);
            let existingData = fs.readFileSync(filePath);

            if (existingData != 0) {
                return (jsonParsed);
            } else {
                fs.writeFile(filePath, '[]');
                return (jsonParsed);
            }
        } catch (e) {
            return (console.log("An error occurred in getStoredConfig()."));
        }
    },

    createAutoReport: async (settings) => {


        // read config.json
        let existingData = fs.readFileSync(filePath);

        if (existingData != "") {
            config = JSON.parse(existingData);
        }

        // push new settings to config.json
        if (settings != null) {
            config.push(settings);
        }

        fs.writeFile(filePath, JSON.stringify(config));

        let host = conf.get('smtp.host');
        let port = conf.get('smtp.port');
        let secure = conf.get('smtp.secure');
        let user = conf.get('smtp.user');
        let password = conf.get('smtp.password');

        let transporter;
        switch (secure) {
            case true:
                console.log("inside true");
                transporter = nodemailer.createTransport({
                    host: host,
                    port: port,
                    secure: secure,
                    auth: {
                        user: user,
                        pass: password
                    }
                });
            case false:
                transporter = nodemailer.createTransport({
                    host: host,
                    port: port,
                });
        }

        const status = new spinner('Automated reporting is now running...');

        var schedule = [];
        var dashboard;
        var email;

        config.forEach(element => {
            status.start();
            schedule = element.schedule;
            dashboard = element.dashboard;
            email = element.email;

            console.log(element);
            if (schedule.includes('Daily')) {
                cron.schedule('0 0 * * *', function () { // Everyday At 00:00
                    genReport();
                });
            }

            if (schedule.includes("Weekly")) {
                cron.schedule('0 0 * * 0', function () { // At 00:00 on Sunday
                    genReport();
                });
            }

            if (schedule.includes('Monthly')) {
                cron.schedule('0 0 1 * *', function () { // At 00:00 on 1st day-of-month
                    genReport();
                });
            }
        });

        async function genReport() {

            let today = new Date();
            let mm = today.getMonth() + 1;
            let dd = today.getDate();
            let yyyy = today.getFullYear();
            today = `${mm}_${dd}_${yyyy}`;
            png = `Dynatrace_${schedule}_${today}.png`;
            pdf = `Dynatrace_${schedule}_${today}.pdf`;

            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(dashboard, {
                waitUntil: 'networkidle0',
            });
            await page.setViewport({
                width: 1920,
                height: 1080
            });
            await page.screenshot({
                path: png,
                fullPage: true
            });
            await page.pdf({
                path: pdf,
                height: 1080,
                width: 1920,
                printBackground: true
            }); await page.close();
            await browser.close();

            // Message object
            let message = {
                from: 'Dynatrace Reporting <donotreply@dynatrace.com>',
                to: email,
                subject: 'Dynatrace ' + schedule + ' Automated Reporting 🤖',
                html: '<p>Automated reporting for Dynatrace dashboards. This email has been configured by your Dynatrace administrator.\n\n<b>***DO NOT REPLY TO THIS EMAIL***</b>\n</p><img src="cid:dashboard">',
                attachments: [
                    {
                        filename: pdf,
                        path: pdf
                    },
                    {
                        filename: png,
                        path: png,
                        cid: 'dashboard'
                    }
                ]
            };

            transporter.sendMail(message, (err, info) => {
                if (err) {
                    console.log('Error occurred. ' + err.message);
                    return process.exit(1);
                }
                // delete file when successful sendmail
                fs.unlinkSync(filename);
            });
            status.stop();
        }
    }
}