# Alert System Gatherer

This project has been created by an EWU senior project team. The purpose of this project is to provide a a single web app that provides information and push notifications for local alerts in the Spokane area. Alerts include WSDOT traffic alerts such as road closures, traffic incidents, road conditions, and severe weather warnings through NWS. The future goal of the project is too include other alert services like fires, crime, and school closures.

## Getting Started

### Prerequisites
To get the web app running locally on your system you will first need to get the project files onto your system. Then you will need to install the following components:

* [Nodejs](https://nodejs.org/en/download/)
* [MongoDB](https://www.mongodb.com/download-center#community)
* [AngularJS](https://angular.io/)
* [Express](http://expressjs.com/)

These are the four key components of [MEAN stack](http://meanjs.org/)

### Running The Program

1. In your projects directory enter in the command: npm install. This will install all of the node [modules](https://www.w3schools.com/nodejs/nodejs_modules.asp) needed to run this project.
2. Activate MongoDB.
3. In the command line navigate to the CronUpdater folder in your project directory then run the command: node autoUpdater.js. This will fill the database with the current alerts. If you leave it running it will update the data every 5 minutes.
4. In the command line navigate to the projects main folder and run the command: npm start.

You can now access the site locally at [localhost:3000](http://localhost:3000/)

## Project Structure

The project structure is broken up into two parts, the CronUpdater, and the WebApp.

* The function of the CronUpdater is to check at regular intervals whether or not the WSDOT or NWS has new alerts, update the current alerts, and store this information on the database. The user never see's any part of the CronUpdater.

* The WebApp handles all user interactions like one might see in any other website.

NOTE: While CronUpdater refers to an actual directory in the project structure WebApp is a conceptual term that contains all of the other files and sub directories in the projects main directory.
### CronUpdater

The CronUpdater uses a CronJob at a 5 minute interval to regularly check for new alerts in the Spokane area.

The CronUpdater is made up of the following js files:

* CronUpdater/db.js
* CronUpdater/autoUpdater.js
* CronUpdater/emailFunction.js
* CronUpdater/trafficFunction.js
* CronUpdater/weatherFunction.js
* CronUpdater/wsdotSoapFunction.js

#### db.js

This file connects to the local MongoDB database. It also registers all the models that will be used from the database. Any file that saves data to the database must have this code at the top of the page:

var db = require('./db');

Any file that has that at the top of the page must first wait for db.js to finish before it can perform any functionality. This prevents a different js file from trying to access the database before it is connected. The two files that access the database in CronUpdater are trafficFunction.js and weatherFunction.js

#### autoUpdater.js

This file performs the [CronJob]https://github.com/kelektiv/node-cron that calls the WSDOT and NWS queries. Before it calls these files it first empties out all the active alert collections(see the data models section).

#### emailFunction.js

This file holds the function that performs email notifications. It exports this function:

//text is a single word string that describes the type of alert. Look in trafficFunction.js or weatherFunction.js for an example of this //function being used.
sendEmail(text);

The current settings send an email from alertSystem.do.not.reply@gmail.com to every user in the database. A messge is logged to the console when a succesful email is sent.

#### trafficFunction.js

This file exports a single function called trafficFunction(). This function queries the WSDOT for their current alerts and updates the database.

trafficFunction() calls two other methods. It first calls getAlertsForSpokaneAreaInCallback() from wsdotSoapFunction, which returns the current alerts for Spokane in an array. It then calls the recursive function addAlertArray(array, index, isNew, callback)

Parameters:
* array - TrafficAlert[] - the input array of alerts that will be parsed
* index - int - the current index in the array. This is used to determine when the recursion should end.
* isNew - boolean - true if the active alerts hold an alert that is new to our db, false if not.
* callback - function - This function is called at the end of the recursion. In our case it was used to send an email notification if
* isNew == true

addAlertArray(array, index, isNew, callback)

The function addAlertArray recursively iterates through the alerts returned by the the function getAlertsForSpokaneAreaInCallback. It adds each alert to the activeAlert collections which have been emptied in autoUpdater.js. For each alert it also checks to see if that alert already exists in our logged alerts collection TrafficAlerts. If an alert does not already exist in the TrafficAlert collection this means that the alert is new to our database and new to the users. If an alert is new then the boolean isNew is set to true. At the end of the recursion if isNew is true then the callback sendEmail is called notifying users that there is a new alert on the site.

For more information on any of the collections referenced here see the models file description lower down in the app_api/models

#### weatherFunction.js

### Alex put your stuff here

#### wsdotSoapFunction.js

This file exports one function called getAlertsForSpokaneAreaInCallback. This function does exactly as it is described. It gets all of the WSDOT traffic alerts for the Spokane area and passes those values to the call back function that you speicfy. The one example of this can be found in trafficFunction.js.

The function getAlertsForSpokaneAreaInCallback is performed primarily through the use of the node module [soap](https://github.com/vpulim/node-soap) which creates a soap client from the WSDOT soap api, which is located at [this](http://www.wsdot.wa.gov/traffic/api/HighwayAlerts/HighwayAlerts.svc) WSDL page. The particular method used from this page is GetAlertsForMapArea(areaCode) (remember this is not our function, this function comes from the WSDOT's api). This returns the alerts from the specified map area. We've hardcoded the map area to be the map area for Spokane.

If you are looking to explore more of the WSDOT's data The soap client has access to many more WSDOT functions and the [WSDOT traveler API](http://wsdot.wa.gov/traffic/api/) has more API's than just highway alerts.

Note: The WSDOT has a function that returns the map area codes if you want to change it to a different one. If you want to view them click this [link](http://wsdot.wa.gov/Traffic/api/HighwayAlerts/HighwayAlertsREST.svc/GetMapAreasAsXml?AccessCode={e0b86f9a-d27f-473e-9068-7c15c919df33}).

### The WebApp

The WebApp is term describing everything that is not in the CronUpdater directory. The WebApp is the actual website whereas CronUpdater is a standalone application.

#### app_api

### James do this part maybe

#### app_client

### Rob do this part

### Other files in the WebApp

#### Someone will do this part

## Down here we will have some more stuff. I've been [using](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2) this to guide me.

NOTE: This ain't done yet
