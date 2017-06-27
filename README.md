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

This file exports a function called weatherFunction(). This function queries the National Weather Service's CAP (Common Alert Protocol) message service to obtain a list of active weather alerts for a specified region within the United States. You can visit [alerts.weather.gov](alerts.weather.gov) to obtain the URL specific to the region you want alerts for. This breaks down by state, county, and more generalized geographical areas (i.e. Columbia Basin or Seattle Area). 

In this function is an array called "urlArray". This is an array of all regions we want alerts for. Currently there are two URLs (as strings) in the array, Washington and Idaho. This means those URLs will contain listings for all active weather alerts in each state. Essentially the array is a way to list each region you want to get weather alerts for. If in the future you want only Spokane county, you would put the URL from [NWS Spokane URL](https://alerts.weather.gov/cap/wwaatmget.php?x=WAC063&y=1) for Spokane County into the array and it would be the only URL in there. Then you would receive only Spokane specific weather alerts. Use Chrome's "View Page Source" (right-click menu) to view the XML the link the provides to any GET request. 

The basic logic of the function breaks down like this: The base URLs above provide an XML document that is essentially an index of all active alerts for that region. Each entry in this XML has it's own unique URL (which also serves as a unique ID for that specific alert) which, if followed, provides another XML document that contains the actual information of the weather alert from the title, severity, and description of alert to the saftey instructions issued by the National Weather Service. The function goes through the first XML document, the index of alerts, and then follows each URL and for each URL it creates a weatherAlert entry in the database after first ensuring, via the unique ID, that it has not already been placed into the database. There is conversion to JSON in this process which you can see in the code using the XML2JS module. 

A more visual representation:

  For Each Region in urlArray -> Active Alerts Index.
            For Each Alert in Index -> Detailed Description
                     For Each Detailed Description -> Create an alert if not a duplicate.
                     

Ideally, all that should need to be changed in the future is the list of regions/counties to be more specifc or more broad. 


#### wsdotSoapFunction.js

This file exports one function called getAlertsForSpokaneAreaInCallback. This function does exactly as it is described. It gets all of the WSDOT traffic alerts for the Spokane area and passes those values to the call back function that you speicfy. The one example of this can be found in trafficFunction.js.

The function getAlertsForSpokaneAreaInCallback is performed primarily through the use of the node module [soap](https://github.com/vpulim/node-soap) which creates a soap client from the WSDOT soap api, which is located at [this](http://www.wsdot.wa.gov/traffic/api/HighwayAlerts/HighwayAlerts.svc) WSDL page. The particular method used from this page is GetAlertsForMapArea(areaCode) (remember this is not our function, this function comes from the WSDOT's api). This returns the alerts from the specified map area. We've hardcoded the map area to be the map area for Spokane.

If you are looking to explore more of the WSDOT's data The soap client has access to many more WSDOT functions and the [WSDOT traveler API](http://wsdot.wa.gov/traffic/api/) has more API's than just highway alerts.

Note: The WSDOT has a function that returns the map area codes if you want to change it to a different one. If you want to view them click this [link](http://wsdot.wa.gov/Traffic/api/HighwayAlerts/HighwayAlertsREST.svc/GetMapAreasAsXml?AccessCode={e0b86f9a-d27f-473e-9068-7c15c919df33}).

### The WebApp

The WebApp is term describing everything that is not in the CronUpdater directory. The WebApp is the actual website whereas CronUpdater is a standalone application.

#### app_api

app_api is the folder where all of the backend functionality is contained. app_api is split into 4 different folders: config, controllers, models, and routes. The config folder holds any of the third party middleware that is necessary for the app to run. Currently we only have passport, which is a third party authentication middleware. The controllers folder holds all of backend javascript that is run on the server. This is where the post and authentication functionality is held. The models folder contains the models that our controllers need to be able to run on the backend. and the routes folder contains our index.js file which is the route driver for the web app itself.

In the controllers folder, the authentication portion of the web app uses a built in node module called crypto. Crypto allows us to use built in salt and hash functions, with node.js. The program creates a random 16 byte salt, which is then passed into the pbkdf2 hash method and run through 1000 iterations to create an encrytped password. It is then run through a valid user method to see if the user exists, if so, then a new json-web-token is created to pass the results of the valid password method. When the user enters in a password to sign in, it is ran through the same hash algorithm and then compared with the stored hash/salt combos, if they match, then the user is accepted and allowed to sign in.

The allpostsCtrl file is where all of the logic is held to make sure the posts are saved to the db correctly. The allpostCtrl goes through and everytime that the cron updater updates, it deletes the current post table in the db and then adds the new posts to make sure that we don't end up having duplicate posts from the same agency.

TrafficCtrl and WeatherCtrl are essentially the same file, just for different agencies. Both controllers contain the logic that connects to their respective agencies apis and pulls the data down to start saving to the database.

The profile.js file is the controller for the profile backend functionality. This file is responsible for posting an error if a user is not an authorized user.

#### app_client

App client consists of a MVW (Model-view-whatever) architecture as for the proper use of using AngularJS.
the folders are split up into 5 main folders(auth,register,common,home,profile,weather) with some sub folders. Each sub folder contains its own
sub-controller, html5/angularJS, as well as the Navigation bar.

The sub-controllers work using dependency injection with angular. The dependency inject comes from the Main Common folder within the services folder. AngularJS only instantiates a service when an application component depends on it.

The services that used in the app_client side are authentication.service, data.service, and post.service. Each service is used throughout the whole applications front-end including profile,home page, and weather.

The home folder contains a decent amount of angular to make it dynamic. First one on home.view.html is ng-if which is used to see if there's any users logged into the application. It's checking with the data binding to see if there's anything within the navvm string. naavm is a setting within main.js used as the Controlleras that'll talk about later.

home.view.html contains some bootstrap such as panels and collapses. These get initialized in the startup in the application from ng-repeat, which is equivalent as a for loop. Each panel is dynamically created using the $scope index counter functionality of angularjs. Within the Panels the following properties are within each post.

* agency
* title
* briefDescription
* clickMore
* description
* time

The properties above will always have something within them expect the clickMore. The clickMore works on the back-end from gather posts from the service and checks to see if the briefDescription exceeds 200 characters. If it does exceed a href on the bottom of the panel will show the "Click here for more" providing a way to access the collapse panel showing the full details of the post. Each Collapse panel has to the ability to stay opened until you click the href again. These properties are set within the home.controller.js and the controller calls the post.service.js dependecy injection.

Profile contains the same layout as home, and it's dependency injection goes off the authentication.services.js from the controller.

### is weather folder going to stay there? or are we going to remove it?

Api_Client also contains 4 other files: 

* app.min.js
* app.min.js.map
* index.html
* main.js

You ### DO NOT ### want to touch app.min.js or the .js.map files in this folder. These files are automatically generated by GULP. GULP is used for minification, and preps for production using this tool.

Index.html contains the basic style sheets, ng-view and scripting sources for bootstrap, angularjs, and app.js.

main.js contains the routing functionality of the application. The gist of it is that it controls what you're putting inside the url part of the web application in a "switch case". We have 4 different paths, and non-valid paths will redirect you back to the home page. Each case in the switch contains the following:

* templateUrl
* controller
* controllerAs

The templateUrl tells where the html will be displayed in the ng-view.

The controller tells where the controller for each templateUrl will be. (always the same place as the templateUrl)

The controllerAs is what your scope for that controller will be that directly relates to the html page.




### Other files in the WebApp

## Note: this is still in testing, V1
