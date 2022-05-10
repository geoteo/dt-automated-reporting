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

        if (host == 'smtp.gmail.com') {
           transporter =  nodemailer.createTransport({
             service: 'Gmail',
             auth: {
                  user: user,
                  pass: password
                 }
            }); 
        } else if (secure) {
           transporter = nodemailer.createTransport({
           host: host,
           port: port,
           secure: secure,
           auth: {
                  user: user,
                  pass: password
                 }
               });
           //transporter.verify().then(console.log).catch(console.error);
        } else {
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
            try {
            status.start();
            dashboard = element.dashboard;
            email = element.email;
	    subject = element.subject;
	    fileprefix = element.fileprefix;	
            crontab = element.crontab;

            console.log(element);

            cron.schedule(crontab, function () {
		genReport();
	    }); 
            } catch (err) {
              console.log("Error configuring: " + element)
            }
        });

        async function genReport() {

            let today = new Date();
            let MM = today.getMonth() + 1;
            MM = MM.toLocaleString('en-US', {
                     minimumIntegerDigits: 2,
                     useGrouping: false
                     })
            let dd = today.getDate().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
                });
            let yyyy = today.getFullYear();
            let hh = today.getHours().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
                });
            let mm = today.getMinutes().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
                });
            today = `${yyyy}_${MM}_${dd}_${hh}${mm}`;
            png = `reports/${fileprefix}_${today}.png`;
            pdf = `reports/${fileprefix}_${today}.pdf`;

            //const browser = await puppeteer.launch();
            const browser = await puppeteer.launch({
	                          headless: true,
	                          args: [
	                                 '--disable-gpu',
	                                 '--disable-dev-shm-usage',
	                                 '--disable-setuid-sandbox',
	                                 '--no-first-run',
	                                 '--no-sandbox',
	                                 '--no-zygote',
	                                 '--single-process'
					 ]
	                     });
            const page = await browser.newPage();
            await page.goto(dashboard, {
                waitUntil: 'networkidle0',
            });


            // Calculate the PageHeight to work around issue in capturing full page screenshot and pdf
            var newHeight = await page.evaluate(async () => {
                var pageHeight = 0;

                function findHighestNode(nodesList) {
                   for (var i = nodesList.length - 1; i >= 0; i--) {
                     if (nodesList[i].scrollHeight && nodesList[i].clientHeight) {
                       var elHeight = Math.max(nodesList[i].scrollHeight, nodesList[i].clientHeight);
                       pageHeight = Math.max(elHeight, pageHeight);
                     }
                     if (nodesList[i].childNodes.length) findHighestNode(nodesList[i].childNodes);
                   }
                }

                findHighestNode(document.documentElement.childNodes);

                // The entire page height is found
                return pageHeight;
            });


            //console.log("PageHeight = " + newHeight);
            newHeight = newHeight + 200;
            await page.setViewport({
                width: 1920,
                height: newHeight
            });
            await page.screenshot({
                path: png,
                fullPage: true,
                captureBeyondViewPort: true
            });
            await page.pdf({
                path: pdf,
                height: newHeight,
                width: 1920,
                printBackground: true
            }); await page.close();
            await browser.close();

            // Message object
            let message = {
                from: user,
                to: email,
	        subject: subject,
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
	            // Don't exit on email error.
                    //return process.exit(1);
                }
                // delete file when successful sendmail
                //fs.unlinkSync(filename);
            });
            status.stop();
        }
    }
}
