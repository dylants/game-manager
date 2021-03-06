"use strict";

var moment = require("moment"),
    async = require("async"),
    mongoose = require("mongoose"),
    Game = mongoose.model("Game"),
    Team = mongoose.model("Team");

function GameBuilder(sport) {
    this.sport = sport;

    /**
     * Removes the scores from the teams string (if it exists)
     *
     * @param  {String} teams The teams with optional score
     * @return {String}       The teams without a game score
     */
    this.removeScoresFromTeams = function(teams) {
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
    this.determineIfGameIsOver = function(teams) {
        if (teams.indexOf(" - ") > -1) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Finds the logo href for the team sent in, searching for the Team
     *
     * @param  {String}   teamName The name of the team to search for
     * @param  {Function} callback Called when logo found, or error occurs
     */
    this.locateLogoHref = function(teamName, callback) {
        var gameBuilder;

        gameBuilder = this;
        // this team name could be the city, or a city/mascot mix
        // so first look for the city match, then mascot loose match
        Team.findOne({
            sport: gameBuilder.sport,
            city: teamName
        }, function(err, team) {
            var looseMascot;

            if (err) {
                callback(err);
                return;
            } else if (team) {
                callback(null, team.logoHref);
                return;
            } else {
                // look for a loose match on the mascot
                if (teamName.indexOf(".") > -1) {
                    looseMascot = teamName.slice(teamName.lastIndexOf(".") + 1);
                } else if (teamName.indexOf(" ") > -1) {
                    looseMascot = teamName.slice(teamName.lastIndexOf(" ") + 1);
                } else {
                    looseMascot = teamName;
                }
                Team.findOne({
                    sport: gameBuilder.sport,
                    mascot: new RegExp(looseMascot, "i")
                }, function(err, team) {
                    var looseCity;

                    if (err) {
                        callback(err);
                        return;
                    } else if (team) {
                        callback(null, team.logoHref);
                        return;
                    } else {
                        // look for a loose match on the city
                        if (teamName.indexOf(".") > -1) {
                            looseCity = teamName.slice(0, teamName.lastIndexOf("."));
                        } else if (teamName.indexOf(" ") > -1) {
                            looseCity = teamName.slice(0, teamName.lastIndexOf(" "));
                        } else {
                            looseCity = teamName;
                        }
                        Team.findOne({
                            sport: gameBuilder.sport,
                            city: new RegExp(looseCity, "i")
                        }, function(err, team) {
                            if (err) {
                                callback(err);
                                return;
                            } else if (team) {
                                callback(null, team.logoHref);
                                return;
                            } else {
                                // failed to find logo...
                                console.error("failed to find logo for teamName: " + teamName);
                                callback(null, "");
                                return;
                            }
                        });
                    }
                });
            }
        });
    };

    /**
     * Returns true if the game is blacked out
     *
     * @param  {String}  networks         The networks that aired the game (or will air)
     * @param  {Array}   blackoutNetworks The networks which will cause a blackout
     * @return {Boolean}                  true iff the game is blacked out
     */
    this.isGameBlackedOut = function(networks, blackoutNetworks) {
        var i;

        if (!networks) {
            return false;
        }

        for (i = 0; i < blackoutNetworks.length; i++) {
            if (networks.indexOf(blackoutNetworks[i]) > -1) {
                return true;
            }
        }
        return false;
    };

    /**
     * Returns the time when this game will be available to watch (because of
     * blackout)
     *
     * @param  {Date}   gameTime            The game time
     * @param  {Number} blackoutPeriodHours The number of hours the game will be blacked out
     * @return {Date}                       The time in when the game will be available
     */
    this.blackoutAvailableGameTime = function(gameTime, blackoutPeriodHours) {
        return moment(gameTime).add("hours", blackoutPeriodHours).toDate();
    };

    /**
     * This collects the remaining attributes necessary in creating a new Game. This also
     * searches to find if the Game that should be created already exists, and if so, returns
     * that Game in the callback. The Game attributes found are returned in the callback as
     * well, if needed to create a new Game.
     *
     * @param  {Date}     gameTime            The game time
     * @param  {String}   awayTeamName        The name of the away team
     * @param  {String}   homeTeamName        The name of the home team
     * @param  {String}   location            Location where the game is played
     * @param  {String}   networks            The networks that aired the game (or will air)
     * @param  {Array}    blackoutNetworks    Networks which will cause a blackout
     * @param  {Number}   blackoutPeriodHours The number of hours a game will be blacked out
     * @param  {Function} callback            Called when the game is done, with an optional error
     *                                        argument as the first parameter, existing Game
     *                                        found as the second, and Game attributes as the third.
     */
    this.findGame = function(gameTime, awayTeamName, homeTeamName, location, networks, blackoutNetworks, blackoutPeriodHours, callback) {
        var isBlackedOut, availableGameTime, gameBuilder;

        // populate the blacked out attributes
        isBlackedOut = this.isGameBlackedOut(networks, blackoutNetworks);
        if (isBlackedOut) {
            availableGameTime = this.blackoutAvailableGameTime(gameTime, blackoutPeriodHours);
        } else {
            availableGameTime = gameTime;
        }

        gameBuilder = this;
        async.parallel([
            // get the logos for each team
            function(parallelCallback) {
                gameBuilder.locateLogoHref(awayTeamName, parallelCallback);
            },
            function(parallelCallback) {
                gameBuilder.locateLogoHref(homeTeamName, parallelCallback);
            }
        ], function(err, results) {
            var awayTeamLogoHref, homeTeamLogoHref;

            awayTeamLogoHref = results[0];
            homeTeamLogoHref = results[1];

            // try to find the game if it already exists
            Game.findOne({
                sport: gameBuilder.sport,
                gameTime: gameTime,
                awayTeamName: awayTeamName,
                homeTeamName: homeTeamName,
                location: location
            }, function(err, game) {
                if (err) {
                    // if an error exists, exit here
                    callback(err);
                } else {
                    callback(null,
                        // send back the game, which may or may not exist
                        game,
                        // game attributes passed back to use when creating the game (if needed)
                        {
                            isBlackedOut: isBlackedOut,
                            availableGameTime: availableGameTime,
                            awayTeamLogoHref: awayTeamLogoHref,
                            homeTeamLogoHref: homeTeamLogoHref
                        }
                    );
                }
            });
        });
    };

}

module.exports = GameBuilder;
