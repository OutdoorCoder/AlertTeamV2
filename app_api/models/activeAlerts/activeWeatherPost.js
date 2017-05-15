var mongoose = require('mongoose');

var activeWeatherPostSchema = mongoose.Schema({
    agency: String,
    imageLink: String,
    title: String,
    briefDescription: String,
    description: String,
    clickMore: String,
    time: Date
});

mongoose.model('ActiveWeatherPost', activeWeatherPostSchema);
