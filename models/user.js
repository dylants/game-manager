var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    gamesWatched: [{
        sport: String,
        gameTimeUTC: Number
    }]
});

mongoose.model("User", UserSchema);
