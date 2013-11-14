var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    teams: [{
        sport: String,
        team: String
    }],
    sportsWatched: [{
        sport: String,
        gamesWatched: Array
    }]
});

mongoose.model("User", UserSchema);
