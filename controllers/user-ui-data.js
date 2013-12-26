var async = require("async"),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    Team = mongoose.model("Team");

module.exports = function(app) {
    app.namespace("/api", function() {

        app.get("/user-ui-data/:id", function(req, res) {
            // first find the user based on the ID
            User.findById(req.params.id, function(err, user) {
                var games, teams, count;

                // stores all the games for this user
                games = [];

                // iterate over each team to find the games
                teams = user.teams;
                count = 0;
                async.whilst(
                    function() {
                        return count < teams.length;
                    },
                    function(whilstCallback) {
                        var team;

                        team = teams[count];
                        count++;

                        // find the matching team object, populating it's schedule of games
                        Team.findOne({
                            sport: team.sport,
                            name: team.team
                        }).populate("schedule").exec(function(err, team) {
                            var teamGames, teamGamesCounter, teamGame, userGamesWatched, i;

                            if (err) {
                                whilstCallback(err);
                                return;
                            }

                            // get the games for the team
                            teamGames = team.schedule.toObject();

                            // loop over these games to optionally add watched information
                            for (teamGamesCounter = 0; teamGamesCounter < teamGames.length; teamGamesCounter++) {
                                teamGame = teamGames[teamGamesCounter].toObject();

                                // if the game has been viewed, update it
                                userGamesWatched = getGamesWatched(user, team.sport);
                                for (i = 0; i < userGamesWatched.length; i++) {
                                    if (userGamesWatched[i].game.toJSON() == teamGame._id.toJSON()) {
                                        teamGame.notes = userGamesWatched[i].notes;
                                        teamGame.completed = userGamesWatched[i].completed;
                                        break;
                                    }
                                }

                                // add the game to our user's game
                                games.push(teamGame);
                            }

                            whilstCallback();
                        });
                    },
                    function(err) {
                        if (err) {
                            console.error(err);
                            res.send(500, {
                                "error": err
                            });
                            return;
                        }

                        // now that we've got all the games, sort them
                        games.sort(function(gameA, gameB) {
                            // sort them by the game time UTC
                            if (gameA.gameTimeUTC > gameB.gameTimeUTC) {
                                return 1;
                            } else if (gameB.gameTimeUTC > gameA.gameTimeUTC) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });

                        res.send({
                            games: games
                        });
                    }
                );
            });
        });

    });
};

var getGamesWatched = function(user, sport) {
    var gamesWatched, sportsWatched, i;

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
};
