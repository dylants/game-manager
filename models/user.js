var mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Game = require("./game");

var UserSchema = new Schema({
    username: String,
    teams: [{
        sport: String,
        team: String
    }],
    sportsWatched: [{
        sport: String,
        games: [{
            game: {
                type: Schema.ObjectId,
                ref: "Game"
            },
            notes: String,
            completed: Boolean
        }]
    }]
});

mongoose.model("User", UserSchema);
