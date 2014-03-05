var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var GameSchema = new Schema({
    sport: {
        type: String
    },
    sportLogoHref: {
        type: String
    },
    gameTime: {
        type: Date
    },
    awayTeamName: {
        type: String
    },
    awayTeamLogoHref: {
        type: String
    },
    homeTeamName: {
        type: String
    },
    homeTeamLogoHref: {
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
    availableGameTime: {
        type: Date
    }
});

mongoose.model("Game", GameSchema);

module.exports = GameSchema;
