# Automated Reporting for Dynatrace Dashboards
> Scheduled email reporting to export Dynatrace dashboards as PDF and PNG files.

#NOTE: This documentation is out of date and is in progress of being updated for the new K8S support.

In an effort to empower Dynatrace dashboards for reporting use cases, I want to introduce an automated reporting feature. This gives users the ability to receive dashboard reports via email on a configurable schedule (e.g. daily, weekly, monthly). Dashboard report emails will include a snapshot of the dashboard attached as a PDF and PNG.

This CLI tool is designed for Dynatrace administrators to configure automated reporting for their users.

## Installing / Getting started

Here is a quick introduction of the setup you need to get automated reporting up and running.

- Clone this repository onto a Linux VM or Linux ActiveGate.
```sh
git clone https://github.com/geoteo/dt-automated-reporting
```

- Inside the repo directory install all the required dependencies.
```sh
npm i
``` 

- Run the app.
```sh 
node index.js
```

**NOTE:** To run the script in the background on Linux use `nohup`, this allows us to the run node application in the background.
```sh
$ nohup node index.js > /dev/null 2>&1 &
```

Afterwards the following wizard will present itself where you will walkthrough the configuration setup.

<p align="center"><img src="/img/demo.gif?raw=true"/></p>

## Features

* Automated reporting of dashboards on a daily, weekly, or monthly basis.
* Persistent configuration settings for SMTP and Dashboards.
* Attaches a PDF and PNG of the dashboard to the email.

## Configuration Files

SMTP Configuration

```sh
~/.config/configstore/dt-automated-reporting.json
```

Dashboard Configuration

```sh
config.json
```

## Application Dependencies

- **chalk** &#8594; colorizes the output
- **clear** &#8594; clears the terminal screen
- **clui** &#8594; draws command-line tables, and spinners
- **figlet** &#8594; creates ASCII art from text
- **inquirer** &#8594; creates interactive command-line user interface
- **configstore** &#8594; easily loads and saves config
- **puppeteer** &#8594; provides a high-level API for headless Chrome
- **nodemailer** &#8594; sends emails
- **node-cron** &#8594; schedule tasks using full crontab syntax

## Files

- **index.js** &#8594; where the app initializes and listens for input in the terminal
- **dt-auto-report.js** &#8594; automated reporting functions
- **inquirer.js** &#8594; list of questions to prompt user for configuration

## Links

- My GitHub: https://github.com/geoteo
- This Repository: https://github.com/geoteo/dt-automated-reporting
- Issues: https://github.com/geoteo/dt-automated-reporting/issues
  - In case of sensitive bugs like security vulnerabilities, please contact
    george.teodorescu@dynatrace.com directly instead of using issue tracker. I value your effort
    to improve the security and privacy of this project!
- Dynatrace Anonymous Dashboard Documentation: https://dt-url.net/anon

## Licensing

The code in this project is licensed under MIT license.
