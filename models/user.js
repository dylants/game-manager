var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    sportsWatched: [{
        sport: String,
        gamesWatched: [{
            gameTimeUTC: Number
        }]
    }]
});

mongoose.model("User", UserSchema);
