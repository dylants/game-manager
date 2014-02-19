var moment = require("moment"),
    async = require("async"),
    GameBuilder = require("../lib/game-builder"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game"),
    Team = mongoose.model("Team");

/**
 * Pulls the networks out of the game description
 *
 * @param  {String} gameDescription Description of the game
 * @return {String}                 The networks that show the game
 */

function parseNetworks(gameDescription) {
    // networks are stored in description after the "on" word
    return gameDescription.split(" on ")[1];
}

function NBAGameBuilder() {
    // call the super's constructor, passing in the sport
    GameBuilder.call(this, "NBA");
}
// setup inheritance so that NBAGameBuilder extends GameBuilder
NBAGameBuilder.prototype = Object.create(GameBuilder.prototype);
NBAGameBuilder.prototype.constructor = NBAGameBuilder;

/**
 * Creates an NBA Game, which has a date and time, teams, and a based on the networks,
 * if it's blacked out. This will either create and save a new Game (if it doesn't exist
 * yet) or find and return the existing Game (if it already exists).
 *
 * @param {Object} app         The application context
 * @param {String} date        The date the game was aired (or will air)
 * @param {String} time        The time the game will air
 * @param {String} teams       The teams that played
 * @param {String} location    The location of the game
 * @param {String} description A short description of the game
 * @param {String} callback Function called when game has been built with the signature:
 *                          callback(err, game)
 */
NBAGameBuilder.prototype.buildNBAGame = function(app, date, time, teams, location, description, callback) {
    var gameTimeUTC, teamsSplit, homeTeamName, awayTeamName, networks;

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

    this.buildGame(gameTimeUTC, awayTeamName, homeTeamName, location, networks,
        // blackout networks for NBA games
        ["ABC", "ESPN", "TNT", "NBA TV"],
        // blacked out games are available 3 hours after the end of the game... how bout 7 hours later?
        7,
        function(err, game, gameAttributes) {
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
                        sportLogoHref: app.get("config").nba.logoHref,
                        gameTimeUTC: gameTimeUTC,
                        awayTeamName: awayTeamName,
                        awayTeamLogoHref: gameAttributes.awayTeamLogoHref,
                        homeTeamName: homeTeamName,
                        homeTeamLogoHref: gameAttributes.homeTeamLogoHref,
                        location: location,
                        networks: networks,
                        isBlackedOut: gameAttributes.isBlackedOut,
                        availableGameTimeUTC: gameAttributes.availableGameTimeUTC
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
        }
    );

};

module.exports = NBAGameBuilder;
