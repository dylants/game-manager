var moment = require("moment"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game");

/**
 * Removes the scores from the teams string (if it exists)
 *
 * @param  {String} teams The teams with optional score
 * @return {String}       The teams without a game score
 */
var removeScoresFromTeams = function(teams) {
    var removeDigitsRegex;

    removeDigitsRegex = /[^\d\s]+/g;

    return teams.match(removeDigitsRegex).join(" ").replace(/-/g, "at");
};

/**
 * Returns true if the game is over
 *
 * @param  {String}  teams The teams with an optional score
 * @return {Boolean}       true iff the game is over (has a score)
 */
var determineIfGameIsOver = function(teams) {
    if (teams.indexOf("-") > 0) {
        return true;
    } else {
        return false;
    }
};

/**
 * Returns true if the game is blacked out
 *
 * @param  {String}  networks The networks that aired the game (or will air)
 * @return {Boolean}          true iff the game is blacked out
 */
var isGameBlackedOut = function(networks) {
    if ((networks.indexOf("NBC") !== -1) ||
        (networks.indexOf("NHLN-US") !== -1)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Returns the UTC time when this game will be available to watch (because of
 * black out)
 *
 * @param  {Number} gameTimeUTC The game time UTC
 * @return {Number}             The time in UTC when the game will be available
 */
var blackOutAvailableGameTimeUTC = function(gameTimeUTC) {
    return moment(gameTimeUTC).add("hours", 52).valueOf();
};

function NHLGameBuilder() {}

/**
 * Creates an NHLGame, which has a date and time, teams, and a based on the networks,
 * if it's blacked out. This will either create and save a new Game (if it doesn't exist
 * yet) or find and return the existing Game (if it already exists).
 *
 * @param {String} date     The date the game was aired (or will air)
 * @param {String} time     The time the game will air
 * @param {String} teams    The teams that played, along with a score (if game
 *                          is complete)
 * @param {String} location The location of the game
 * @param {String} networks The networks that aired the game (or will air)
 * @param {String} callback Function called when game has been built with the signature:
 *                          callback(err, game)
 */
NHLGameBuilder.prototype.buildNHLGame = function(date, time, teams, location, networks, callback) {
    var gameTimeUTC, teamsWithoutScores, isGameOver, whoWon, isBlackedOut,
        availableGameTimeUTC, teamsWithScores, team1, team1Score, team2, team2Score, game;

    // calculate the UTC game time
    gameTimeUTC = moment(date + " " + time).valueOf();

    // pull the scores out, figure out if the game is over, and who won
    teamsWithoutScores = removeScoresFromTeams(teams);
    isGameOver = determineIfGameIsOver(teams);
    // determine the game scores, and who won
    if (isGameOver) {
        // first split the teams into individual team + score
        teamsWithScores = teams.split(" - ");
        // determine each team and score
        team1 = teamsWithScores[0].slice(0, teamsWithScores[0].lastIndexOf(" ")).trim();
        team1Score = teamsWithScores[0].slice(teamsWithScores[0].lastIndexOf(" ")).trim();
        team2 = teamsWithScores[1].slice(0, teamsWithScores[1].lastIndexOf(" ")).trim();
        team2Score = teamsWithScores[1].slice(teamsWithScores[1].lastIndexOf(" ")).trim();

        if (team1Score > team2Score) {
            whoWon =  team1;
        } else if (team2Score > team1Score) {
            whoWon =  team2;
        } else {
            whoWon = "tie";
        }
    } else {
        // else just find out who the teams are
        teamsWithoutScores = teamsWithoutScores.split(" at ");
        team1 = teamsWithoutScores[0];
        team2 = teamsWithoutScores[1];
    }

    // populate the blacked out attributes
    isBlackedOut = isGameBlackedOut(networks);
    if (isBlackedOut) {
        availableGameTimeUTC = blackOutAvailableGameTimeUTC(gameTimeUTC);
    } else {
        availableGameTimeUTC = gameTimeUTC;
    }

    // try to find the game if it already exists
    Game.findOne({
        sport: "NHL",
        gameTimeUTC: gameTimeUTC,
        awayTeamName: team1,
        homeTeamName: team2,
        location: location
    }, function(err, game) {
        if (err) {
            // if an error exists, exit here
            callback(err);
        } else {
            if (game) {
                // if the game exists, check to see if it's now over (and wasn't before)
                if (game.toJSON().isGameOver !== isGameOver) {
                    console.log("updating game: " + game.gameTimeUTC);
                    // update the existing game
                    game.update({
                        awayTeamScore: team1Score,
                        homeTeamScore: team2Score,
                        isGameOver: isGameOver,
                        winningTeamName: whoWon
                    });
                }
                console.log("game already exists, returning game with time: " + game.gameTimeUTC);
                callback(null, game);
            } else {
                // create a new game
                console.log("game does not yet exist, creating game with time: " + gameTimeUTC);
                game = new Game({
                    sport: "NHL",
                    gameTimeUTC: gameTimeUTC,
                    awayTeamName: team1,
                    homeTeamName: team2,
                    location: location,
                    awayTeamScore: team1Score,
                    homeTeamScore: team2Score,
                    isGameOver: isGameOver,
                    winningTeamName: whoWon,
                    networks: networks,
                    isBlackedOut: isBlackedOut,
                    availableGameTimeUTC: availableGameTimeUTC
                });
                // save the newly created game
                game.save(function(err, game) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, game);
                    }
                });
            }
        }
    });

};

module.exports = NHLGameBuilder;
