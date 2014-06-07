"use strict";

var moment = require("moment"),
    async = require("async"),
    GameBuilder = require("./game-builder"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game"),
    Team = mongoose.model("Team");

function NHLGameBuilder() {
    // call the super's constructor, passing in the sport
    GameBuilder.call(this, "NHL");
}
// setup inheritance so that NHLGameBuilder extends GameBuilder
NHLGameBuilder.prototype = Object.create(GameBuilder.prototype);
NHLGameBuilder.prototype.constructor = NHLGameBuilder;

/**
 * Creates an NHLGame, which has a date, teams, and a based on the networks,
 * if it's blacked out. This will either create and save a new Game (if it doesn't exist
 * yet) or find and return the existing Game (if it already exists).
 *
 * @param {Object} app      The application context
 * @param {String} date     The date the game was aired (or will air)
 * @param {String} teams    The teams that played, along with a score (if game
 *                          is complete)
 * @param {String} location The location of the game
 * @param {String} networks The networks that aired the game (or will air)
 * @param {String} callback Function called when game has been built with the signature:
 *                          callback(err, game)
 */
NHLGameBuilder.prototype.buildGame = function(app, date, teams, location, networks, callback) {
    var gameTime, teamsWithoutScores, isGameOver, teamsWithScores, team1, team1Score,
        team2, team2Score, whoWon;

    // calculate the game time in the local time zone
    gameTime = moment(date).toDate();

    // pull the scores out, figure out if the game is over, and who won
    teamsWithoutScores = this.removeScoresFromTeams(teams);
    isGameOver = this.determineIfGameIsOver(teams);
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
            whoWon = team1;
        } else if (team2Score > team1Score) {
            whoWon = team2;
        } else {
            whoWon = "tie";
        }
    } else {
        // else just find out who the teams are
        teamsWithoutScores = teamsWithoutScores.split(" at ");
        team1 = teamsWithoutScores[0];
        team2 = teamsWithoutScores[1];
    }

    this.findGame(gameTime, team1, team2, location, networks,
        // blackout networks for NHL games
        ["NBC", "NHLN-US"],
        // blacked out games are available 48 hours after game end, so 52 hours later
        52,
        function(err, game, gameAttributes) {
            if (err) {
                // if an error exists, exit here
                callback(err);
            } else {
                if (game) {
                    // if the game exists, check to see if it's now over (and wasn't before)
                    if (game.isGameOver !== isGameOver) {
                        console.log("updating game: " + game.gameTime);
                        // update the existing game
                        game.awayTeamScore = team1Score;
                        game.homeTeamScore = team2Score;
                        game.isGameOver = isGameOver;
                        game.winningTeamName = whoWon;
                        game.save(function(err, game) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, game);
                            }
                        });
                    } else {
                        console.log("game already exists, returning game with time: " + game.gameTime);
                        callback(null, game);
                    }
                } else {
                    // create a new game
                    console.log("game does not yet exist, creating game with time: " + gameTime);
                    game = new Game({
                        sport: "NHL",
                        sportLogoHref: app.get("config").nhl.logoHref,
                        gameTime: gameTime,
                        awayTeamName: team1,
                        awayTeamLogoHref: gameAttributes.awayTeamLogoHref,
                        homeTeamName: team2,
                        homeTeamLogoHref: gameAttributes.homeTeamLogoHref,
                        location: location,
                        awayTeamScore: team1Score,
                        homeTeamScore: team2Score,
                        isGameOver: isGameOver,
                        winningTeamName: whoWon,
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

module.exports = NHLGameBuilder;
