const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('./lib/inquirer');
const dtAutoReport = require('./lib/dt-auto-report');

clear();

console.log(
    chalk.hex('#5EAD35')(
        figlet.textSync('dynatrace', { horizontalLayout: 'full' })
    )
);

console.log(chalk.hex('#E6BE00').bold(
    '\nGITHUB LINK: ' + chalk.hex('#526CFF').bold.underline('\thttps://github.com/geoteo/dt-automated-reporting\n') +
    'AUTHOR: ' + chalk.hex('#526CFF').bold.underline('\tgeorge.teodorescu@dynatrace.com')
));

console.log(chalk.hex('#C41425').bold(
    '\nREMINDER: ' + chalk.hex('#526CFF').bold('\tPlease only enter in anonymous dashboard links.\n') +
    'DOCUMENTATION: ' + chalk.hex('#526CFF').bold.underline('\thttps://dt-url.net/anon')
));

// Configure SMTP
const setupSMTP = async () => {

    let smtp = dtAutoReport.getSMTP();
    if (smtp) {
        console.log(chalk.hex('#C41425').bold(
            'SMTP CONFIG:\n'
        ));
        console.log(smtp);
        return smtp;
    }

    // No SMTP config found, ask for new credentials
    console.log(chalk.hex('#C41425').bold(
        'SMTP CONFIG: ' + chalk.hex('#526CFF').bold('\tRunning first time config...')
    ));
    smtp = await inquirer.askSMTP();

    return smtp;
};

// Fetch dashboard from config.json
const getSettings = async () => {
    let settings = dtAutoReport.getStoredConfig();
    if (settings) {
        console.log(chalk.hex('#C41425').bold(
            'DASHBOARD CONFIG: ' + chalk.hex('#526CFF').bold(settings) + '\n'
        ));
        let repeat = await inquirer.addAnother();
        if (repeat.answer) {
            settings = await inquirer.askQuestions();
            return (settings);
        }
        else {
            console.log("User inputted no for adding additional dashboards.");
        }
    }
};

const run = async () => {
    try {

        // Check for SMTP configuration
        const smtp = await setupSMTP();
        dtAutoReport.configSMTP(smtp);

        // Check for dashboard configuration
        const settings = await getSettings();

        // Send config settings received from inquirer to generate reports
        await dtAutoReport.createAutoReport(settings);

    } catch (err) {
        return (console.log("An error occurred in main run."));
    }
};

run()