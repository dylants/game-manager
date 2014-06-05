"use strict";

var async = require("async"),
    teamSchedule = require("../lib/team-schedule"),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    Team = mongoose.model("Team");

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/user-ui-data", function(req, res) {
            async.parallel([
                // find the user
                function(parallelCallback) {
                    findUser(req.user.id, parallelCallback);
                },
                // load all games for all teams
                function(parallelCallback) {
                    findAllTeamsGames(parallelCallback);
                }
            ], function(err, results) {
                var user, allGamesForAllTeams, userData, currentTime, teams,
                    teamsCounter, team, userGamesWatched, allGamesForTeam, gamesForTeam;

                if (err) {
                    console.error(err);
                    res.send(500, {
                        "error": err
                    });
                    return;
                }

                // grab the user and gamesForTeams
                user = results[0];
                allGamesForAllTeams = results[1];

                userData = {};
                userData.teams = user.teams;
                // stores all the games for this user
                userData.games = [];

                // current time is used to calculate the game state
                currentTime = new Date();

                // iterate over each team to find the games
                teams = user.teams;
                for (teamsCounter = 0; teamsCounter < teams.length; teamsCounter++) {
                    team = teams[teamsCounter];

                    // get the games watched for that team's sport
                    userGamesWatched = getGamesWatched(user, team.sport);

                    // grab all the games for this team
                    allGamesForTeam = allGamesForAllTeams[team.team + ":" + team.sport];

                    // get the games for the team
                    gamesForTeam = addGamesForTeam(allGamesForTeam, userGamesWatched, currentTime);

                    // add them to our games list
                    userData.games = userData.games.concat(gamesForTeam);
                }

                userData.games = organizeGames(userData.games);
                res.send(userData);
            });
        });

        // PATCH to update our User with the View Model data
        app.patch("/user-ui-data", function(req, res) {
            if (req.body.game) {
                updateWatchedGameForUser(req.user.id, req.body.game, function(err) {
                    if (err) {
                        console.error(err);
                        res.send(500, {
                            "error": err
                        });
                        return;
                    }

                    res.send(200);
                });
            } else if (req.body.teams) {
                updateTeamsForUser(req.user.id, req.body.teams, app, function(err) {
                    if (err) {
                        console.error(err);
                        res.send(500, {
                            "error": err
                        });
                        return;
                    }

                    res.send(200);
                });
            } else {
                res.send(400, {
                    "error": "Unable to determine operation from request body"
                });
                return;
            }
        });
    });
};

function findUser(userId, callback) {
    User.findById(userId, function(err, user) {
        callback(err, user);
    });
}

function findAllTeamsGames(callback) {
    Team.find().populate("schedule").exec(function(err, teams) {
        var gamesForTeams, i, team;

        if (err) {
            callback(err);
            return;
        }

        gamesForTeams = {};

        for (i = 0; i < teams.length; i++) {
            team = teams[i];
            gamesForTeams[team.name + ":" + team.sport] = team.schedule.toObject();
        }

        callback(null, gamesForTeams);
    });
}

function addGamesForTeam(teamGames, userGamesWatched, currentTime) {
    var games, teamGamesCounter, teamGame, ugwCounter;

    games = [];

    // loop over these games to add watched information
    for (teamGamesCounter = 0; teamGamesCounter < teamGames.length; teamGamesCounter++) {
        teamGame = teamGames[teamGamesCounter].toObject();

        for (ugwCounter = 0; ugwCounter < userGamesWatched.length; ugwCounter++) {
            if (userGamesWatched[ugwCounter].game.toJSON() == teamGame._id.toJSON()) {
                teamGame.notes = userGamesWatched[ugwCounter].notes;
                teamGame.completed = userGamesWatched[ugwCounter].completed;
                break;
            }
        }

        // set the game state based off if viewed or current time
        if (teamGame.completed) {
            teamGame.gameState = "archived";
        } else {
            // if we haven't, is it available to watch?
            if (currentTime > teamGame.availableGameTime) {
                teamGame.gameState = "available";
            } else {
                teamGame.gameState = "future";
            }
        }

        // add the game to our user's game
        games.push(teamGame);
    }

    return games;
}

function getGamesWatched(user, sport) {
    var gamesWatched, sportsWatched, i;

    // default to empty in case none exist
    gamesWatched = [];

    // get the sports watched for this user
    sportsWatched = user.sportsWatched.toObject();
    if (sportsWatched && sportsWatched.length > 0) {
        // for each sport watched
        for (i = 0; i < sportsWatched.length; i++) {
            // try and find the sport we're looking for
            if (sportsWatched[i].sport === sport) {
                // if found, get the games watched
                gamesWatched = sportsWatched[i].games;
                break;
            }
        }
    }

    return gamesWatched;
}

function organizeGames(games) {
    var availableGames, archivedGames, futureGames, i, game;

    // now that we've got all the games, sort them
    games.sort(function(gameA, gameB) {
        // sort them by the game time
        if (gameA.gameTime > gameB.gameTime) {
            return 1;
        } else if (gameB.gameTime > gameA.gameTime) {
            return -1;
        } else {
            return 0;
        }
    });

    // with the games sorted, place them in the correct collection
    availableGames = [];
    archivedGames = [];
    futureGames = [];
    for (i = 0; i < games.length; i++) {
        game = games[i];
        switch (game.gameState) {
            case "available":
                availableGames.push(game);
                break;
            case "archived":
                archivedGames.push(game);
                break;
            case "future":
                futureGames.push(game);
                break;
            default:
                console.error("unable to place game: " + game);
                break;
        }
    }

    // archived games should be last one first, so
    // that the user sees the latest archived.
    archivedGames.reverse();

    return {
        availableGames: availableGames,
        archivedGames: archivedGames,
        futureGames: futureGames
    };
}

function updateWatchedGameForUser(userId, watchedGame, callback) {
    // update the games watched with this watched game information
    User.findById(userId, function(err, user) {
        var i, gamesWatched, existingGameWatched, foundMatch;

        if (err) {
            callback(err);
            return;
        }
        if (user === null) {
            callback("User " + userId + " does not exist");
            return;
        }

        // find the watched games for this watched game sport
        for (i = 0; i < user.sportsWatched.length; i++) {
            if (watchedGame.sport === user.sportsWatched[i].sport) {
                gamesWatched = user.sportsWatched[i].games;
                break;
            }
        }

        // if no games watched yet for this sport, create one
        if (!gamesWatched) {
            gamesWatched = [];
            user.sportsWatched.push({
                sport: watchedGame.sport,
                games: gamesWatched
            });
            gamesWatched = user.sportsWatched[user.sportsWatched.length - 1].games;
        }

        // loop through the games watched looking for a matching game
        for (i = 0; i < gamesWatched.length; i++) {
            if (watchedGame._id === gamesWatched[i].game.toJSON()) {
                foundMatch = true;
                break;
            }
        }

        if (foundMatch) {
            // if one already exists, update the existing game
            gamesWatched[i].notes = watchedGame.notes;
            gamesWatched[i].completed = watchedGame.completed;
        } else {
            // else create a new one
            gamesWatched.push({
                game: watchedGame._id,
                notes: watchedGame.notes,
                completed: watchedGame.completed
            });
        }

        // save the updated user
        user.save(function(err, user) {
            callback(err);
        });
    });
}

function updateTeamsForUser(userId, teams, app, callback) {
    // update the teams for the user
    User.findById(userId, function(err, user) {
        var count;

        if (err) {
            callback(err);
            return;
        }
        if (user === null) {
            callback("User " + userId + " does not exist");
            return;
        }

        count = 0;
        // iterate over all the teams
        async.whilst(
            function() {
                return count < teams.length;
            },
            function(whilstCallback) {
                var team;

                team = teams[count];
                count++;

                // for each team, update it's schedule
                Team.findOne({
                    sport: team.sport,
                    name: team.team
                }, function(err, team) {
                    teamSchedule.update(team.sport, team.name, team.teamId, app,
                        function(err) {
                            whilstCallback(err);
                        }
                    );
                });
            },
            function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                // set the user's teams to these teams
                user.teams = teams;

                // save the updated user
                user.save(function(err, user) {
                    callback(err);
                });
            }
        );
    });
}
