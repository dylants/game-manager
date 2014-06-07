"use strict";

var moment = require("moment"),
    async = require("async"),
    GameBuilder = require("./game-builder"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game"),
    Team = mongoose.model("Team");

/**
 * Some teams have special abbreviated team names in the schedule, this
 * function checks for those and returns the true name of the team.
 *
 * @param  {String} teamName The name of the team in the CSV schedule
 * @return {String}          The correct team name
 */
function handleSpecialTeamNames(teamName) {
    if (teamName === "D-backs") {
        return "Diamondbacks";
    } else {
        return teamName;
    }
}

function MLBGameBuilder() {
    // call the super's constructor, passing in the sport
    GameBuilder.call(this, "MLB");
}
// setup inheritance so that MLBGameBuilder extends GameBuilder
MLBGameBuilder.prototype = Object.create(GameBuilder.prototype);
MLBGameBuilder.prototype.constructor = MLBGameBuilder;

/**
 * Creates an MLB Game, which has a date, teams, and a based on the networks,
 * if it's blacked out. This will either create and save a new Game (if it doesn't exist
 * yet) or find and return the existing Game (if it already exists).
 *
 * @param {Object} app         The application context
 * @param {String} date        The date the game was aired (or will air)
 * @param {String} teams       The teams that played
 * @param {String} location    The location of the game
 * @param {String} description A short description of the game
 * @param {String} callback Function called when game has been built with the signature:
 *                          callback(err, game)
 */
MLBGameBuilder.prototype.buildGame = function(app, date, teams, location, description, callback) {
    var gameTime, teamsWithoutScores, isGameOver, teamsWithScores, awayTeamName, awayTeamScore,
        homeTeamName, homeTeamScore, whoWon, networks;

    // ignore all star games (for some reason these are baked into the team schedule)
    if (teams.indexOf("All-Stars") > -1) {
        callback(null, null);
        return;
    }

    // calculate the game time in the local time zone
    gameTime = moment(date).toDate();

    // Remove "Spring: " from spring training games
    if (teams.indexOf("Spring: ") > -1) {
        teams = teams.slice("Spring: ".length);
    }

    // pull the scores out, figure out if the game is over, and who won
    teamsWithoutScores = this.removeScoresFromTeams(teams);
    isGameOver = this.determineIfGameIsOver(teams);
    // determine the game scores, and who won
    if (isGameOver) {
        // first split the teams into individual team + score
        teamsWithScores = teams.split(" - ");
        // determine each team and score
        awayTeamName = teamsWithScores[0].slice(0, teamsWithScores[0].lastIndexOf(" ")).trim();
        awayTeamScore = teamsWithScores[0].slice(teamsWithScores[0].lastIndexOf(" ")).trim();
        homeTeamName = teamsWithScores[1].slice(0, teamsWithScores[1].lastIndexOf(" ")).trim();
        homeTeamScore = teamsWithScores[1].slice(teamsWithScores[1].lastIndexOf(" ")).trim();

        if (awayTeamScore > homeTeamScore) {
            whoWon = awayTeamName;
        } else if (homeTeamScore > awayTeamScore) {
            whoWon = homeTeamName;
        } else {
            whoWon = "tie";
        }
    } else {
        // else just find out who the teams are
        teamsWithoutScores = teamsWithoutScores.split(" at ");
        awayTeamName = teamsWithoutScores[0];
        homeTeamName = teamsWithoutScores[1];
    }

    // make sure we have the correct team names
    homeTeamName = handleSpecialTeamNames(homeTeamName);
    awayTeamName = handleSpecialTeamNames(awayTeamName);

    // as of now, the networks are contained within the description, and there's
    // not really enough of a pattern to warrant parsing out the networks from
    // the remaining information. So for now, the networks is just the description
    networks = description;

    this.findGame(gameTime, awayTeamName, homeTeamName, location, networks,
        // blackout networks for MLB games
        ["ESPN", "FOX", "ESPN2", "FS1"],
        // blacked out games are available 90 minutes after the end of the game... how bout 5 hours later?
        5,
        function(err, game, gameAttributes) {
            if (err) {
                // if an error exists, exit here
                callback(err);
            } else {
                if (game) {
                    // if the game exists, return the existing game
                    console.log("game already exists, updating information");
                    game.networks = networks;
                    game.isBlackedOut = gameAttributes.isBlackedOut;
                    game.availableGameTime = gameAttributes.availableGameTime;
                    game.save(function(err, game) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, game);
                        }
                    });
                } else {
                    // create a new game
                    console.log("game does not yet exist, creating game with time: " + gameTime);
                    game = new Game({
                        sport: "MLB",
                        sportLogoHref: app.get("config").mlb.logoHref,
                        gameTime: gameTime,
                        awayTeamName: awayTeamName,
                        awayTeamLogoHref: gameAttributes.awayTeamLogoHref,
                        homeTeamName: homeTeamName,
                        homeTeamLogoHref: gameAttributes.homeTeamLogoHref,
                        location: location,
                        networks: networks,
                        isBlackedOut: gameAttributes.isBlackedOut,
                        availableGameTime: gameAttributes.availableGameTime
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

module.exports = MLBGameBuilder;
