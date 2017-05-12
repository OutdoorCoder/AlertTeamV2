var db = require('./db');//This makes sure the db registers the models

var mongoose = require('mongoose');
var wsdotSoapFunction = require("./wsdotSoapFunction");

var Post = mongoose.model('Post');
var ActivePost = mongoose.model('ActivePost');
var TrafficAlert = mongoose.model('TrafficAlert');
var ActiveTrafficPost = mongoose.model('ActiveTrafficPost');

module.exports.trafficAlerts = function(){
  wsdotSoapFunction.getAlertsForSpokaneAreaInCallback(function(result){
    addAlertArray(result, 0);
  });


}//end addArrayToDb

function addAlertArray(array, index){
  if(array.length == index){
    console.log("Ending recursion");
    return;
  }

  var alert;
  var activeAlert;
  alert = new TrafficAlert(array[index]);
  addActivePosts(alert);//add regardless of whether it exists
  //because the collection is emptied every time

  TrafficAlert.findOne({'AlertID': alert.AlertID}, function(err, result){
    if(!result){
      console.log("Alert added");
      alert.save();
      addPost(alert);
    }
    else{
      console.log("Alert already added");
    }
  }).then(addAlertArray(array, index + 1));//recursive call
}//end addAlertArray

function addActivePosts(alert){
  var activeTrafficPost;
  var activePost;

  if(alert.HeadlineDescription.length > 100){//if its too big
    var brief = alert.HeadlineDescription.substring(0, 99);
    activePost = new ActivePost({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: brief, description: alert.HeadlineDescription, time: alert.StartTime});
    activeTrafficPost = new ActiveTrafficPost({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: brief, description: alert.HeadlineDescription, time: alert.StartTime});
  }
  else{
    activePost = new ActivePost({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: alert.HeadlineDescription, time: alert.StartTime});
    activeTrafficPost = new ActiveTrafficPost({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: alert.HeadlineDescription, time: alert.StartTime});
  }
  activeTrafficPost.save();
  activePost.save();
}

function addPost(alert){
  var post;
  
  if(alert.HeadlineDescription.length > 100){
    var brief = alert.HeadlineDescription.substring(0, 99);
    post = new Post({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: brief, description: alert.HeadlineDescription, time: alert.StartTime});
  }
  else{
    post = new Post({agency: 'WSDOT', imageLink: 'http://4vector.com/i/free-vector-wsdot-0_075021_wsdot-0.png',title: alert.EventCategory, briefDescription: alert.HeadlineDescription, time: alert.StartTime});
  }

  post.save();
}//end addAlert
