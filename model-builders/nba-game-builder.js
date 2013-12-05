var moment = require("moment"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game");

/**
 * Pulls the networks out of the game description
 *
 * @param  {String} gameDescription Description of the game
 * @return {String}                 The networks that show the game
 */
var parseNetworks = function(gameDescription) {
    // networks are stored in description after the "on" word
    return gameDescription.split(" on ")[1];
};

/**
 * Returns true if the game is blacked out
 *
 * @param  {String}  networks The networks that aired the game (or will air)
 * @return {Boolean}          true iff the game is blacked out
 */
var isGameBlackedOut = function(networks) {
    if ((networks.indexOf("ABC") !== -1) ||
        (networks.indexOf("ESPN") !== -1) ||
        (networks.indexOf("TNT") !== -1) ||
        (networks.indexOf("NBA TV") !== -1)) {
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
    // 3 hours after the end of the game... how bout 7 hours later?
    return moment(gameTimeUTC).add("hours", 7).valueOf();
};

function NBAGameBuilder() {}

/**
 * Creates an NBA Game, which has a date and time, teams, and a based on the networks,
 * if it's blacked out. This will either create and save a new Game (if it doesn't exist
 * yet) or find and return the existing Game (if it already exists).
 *
 * @param {String} date        The date the game was aired (or will air)
 * @param {String} time        The time the game will air
 * @param {String} teams       The teams that played
 * @param {String} location    The location of the game
 * @param {String} description A short description of the game
 * @param {String} callback Function called when game has been built with the signature:
 *                          callback(err, game)
 */
NBAGameBuilder.prototype.buildNBAGame = function(date, time, teams, location, description, callback) {
    var gameTimeUTC, teamsSplit, homeTeamName, awayTeamName, networks, isBlackedOut,
        availableGameTimeUTC;

    // calculate the UTC game time
    gameTimeUTC = moment(date + " " + time).valueOf();

    // get the home team and away team names
    // this is done based on if there's an "@" or "vs" in the teams
    if (teams.indexOf("@") > -1) {
        teamsSplit = teams.split(" @ ");
        homeTeamName = teamsSplit[1];
        awayTeamName = teamsSplit[0];
    } else {
        teamsSplit = teams.split(" vs. ");
        homeTeamName = teamsSplit[0];
        awayTeamName = teamsSplit[1];
    }

    // determine the networks that aired the game
    networks = parseNetworks(description);

    // populate the blacked out attributes
    isBlackedOut = isGameBlackedOut(networks);
    if (isBlackedOut) {
        availableGameTimeUTC = blackOutAvailableGameTimeUTC(gameTimeUTC);
    } else {
        availableGameTimeUTC = gameTimeUTC;
    }

    // try to find the game if it already exists
    Game.findOne({
        sport: "NBA",
        gameTimeUTC: gameTimeUTC,
        awayTeamName: awayTeamName,
        homeTeamName: homeTeamName,
        location: location
    }, function(err, game) {
        if (err) {
            // if an error exists, exit here
            callback(err);
        } else {
            if (game) {
                // if the game exists, return the existing game
                console.log("game already exists, returning game with time: " + game.gameTimeUTC);
                callback(null, game);
            } else {
                // create a new game
                console.log("game does not yet exist, creating game with time: " + gameTimeUTC);
                game = new Game({
                    sport: "NBA",
                    gameTimeUTC: gameTimeUTC,
                    awayTeamName: awayTeamName,
                    homeTeamName: homeTeamName,
                    location: location,
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

module.exports = NBAGameBuilder;