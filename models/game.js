var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
    sport: {
        type: String
    },
    gameTimeUTC: {
        type: Number
    },
    awayTeamName: {
        type: String
    },
    homeTeamName: {
        type: String
    },
    location: {
        type: String
    },
    awayTeamScore: {
        type: Number
    },
    homeTeamScore: {
        type: Number
    },
    isGameOver: {
        type: Boolean
    },
    winningTeamName: {
        type: String
    },
    networks: {
        type: String
    },
    isBlackedOut: {
        type: Boolean
    },
    availableGameTimeUTC: {
        type: Number
    }
});

mongoose.model("Game", GameSchema);

module.exports = GameSchema;
