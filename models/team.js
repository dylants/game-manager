var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Game = require("./game");

var TeamSchema = new Schema({
    name: {
        type: String
    },
    city: {
        type: String
    },
    mascot: {
        type: String
    },
    sport: {
        type: String
    },
    conference: {
        type: String
    },
    division: {
        type: String
    },
    schedule: [Game],
    record: {
        type: String
    }
});

mongoose.model("Team", TeamSchema);
