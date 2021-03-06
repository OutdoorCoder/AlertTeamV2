var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/userAuthentication';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});

//import MODELS
require('./loggedAlerts/post');
require('./loggedAlerts/wAlert');
require('./loggedAlerts/trafficAlert');
require('./activeAlerts/activePost');
require('./activeAlerts/activeWeatherPost');
require('./activeAlerts/activeTrafficPost');
require('./users');
