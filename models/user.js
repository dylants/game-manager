var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    sportsWatched: [{
        sport: String,
        gamesWatched: Array
    }]
});

mongoose.model("User", UserSchema);
