const chalk = require('chalk');
const inquirer = require('inquirer');

module.exports = {

    askSMTP: () => {
        const questions = [
            {
                name: 'host',
                type: 'input',
                message: 'Please enter in your SMTP hostname or IP address to connect to (defaults to ‘localhost’):',
                default: 'localhost',
            },
            {
                name: 'port',
                type: 'number',
                message: 'Please enter in your SMTP port to connect to (defaults to 587 if is secure is false or 465 if true):',
                default: 587,
            },
            {
                name: 'secure',
                type: 'boolean',
                message: 'Use TLS for the server connection?',
                default: false,
            },
            {
                name: 'user',
                type: 'input',
                message: 'Please enter in your SMTP username:',
            },
            {
                name: 'password',
                type: 'password',
                message: 'Please enter in your SMTP password:',
            },
        ];
        return inquirer.prompt(questions);
    },

    addAnother: () => {
        const repeat = [
            {
                name: 'answer',
                type: 'confirm',
                message: 'Do you want to add a dashboard?',
                default: false,
            },
        ]
        return inquirer.prompt(repeat);
    },

    askQuestions: () => {
        const questions = [
            {
                name: 'dashboard',
                type: 'input',
                message: chalk.green('Please enter in the anonymous dashboard link that you\'d like to subscribe to:'),
                validate: function (dashboard) {
			//valid = /(https:\/\/.*.com\/dashboards\/.*)/.test(dashboard)
			//work around valdiaiton for now
		    valid = true;
                    if (valid) {
                        return true;
                    } else {
                        return chalk.hex('#C41425').bold("Please enter a valid dashboard link.\n")
                    }
                }
            },
            {
                name: 'crontab',
                type: 'input',
                message: chalk.green('Enter a crontab style entry defining how often to run report (e.g. "0 8 * * *" will run the report at 8:00am everyday'),
            },
            {
                name: 'email',
                type: 'input',
                message: chalk.green('Please enter in the emails or mailing list to be notified. If multiple please use ; as a delimter.'),
                validate: function (email) {
                    valid = /(([a-zA-Z\-0-9\.]+@)([a-zA-Z\-0-9\.]+)[;]*)+/.test(email)
                    if (valid) {
                        return true;
                    } else {
                        return chalk.hex('#C41425').bold("Please enter a valid email.\n")
                    }
                }
	    },
	    {
		 name: 'subject',
		 type: 'input',
		 message: chalk.green('Please enter subject of the email to send:')
	    },
	    {
		 name: 'fileprefix',
		 type: 'input',
		 message: chalk.green('Please enter the prefix of the filename to save. Example: "APPX"')
	    }
        ];
        return inquirer.prompt(questions);
    },
};
