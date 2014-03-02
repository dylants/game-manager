var _ = require("underscore"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");


function sortTeams(teams) {
    teams.sort(function(teamA, teamB) {
        // sort by city
        if (teamA.city > teamB.city) {
            return 1;
        } else if (teamA.city < teamB.city) {
            return -1;
        } else {
            // same city, sort by mascot
            if (teamA.mascot > teamB.mascot) {
                return 1;
            } else if (teamA.mascot < teamB.mascot) {
                return -1;
            } else {
                return 0;
            }
        }
    });
}

module.exports = function(app) {
    app.namespace("/api", function() {
        app.get("/teams-ui", function(req, res) {
            Team.find(function(err, teams) {
                var returnTeams, count, team, sportKeys;

                if (err) {
                    console.error(err);
                    res.send(500);
                    return;
                }

                returnTeams = {};
                for (count = 0; count < teams.length; count++) {
                    // grab the team
                    team = teams[count].toJSON();

                    // remove the schedule
                    delete team.schedule;

                    // add based on the sport
                    if (!returnTeams[team.sport]) {
                        returnTeams[team.sport] = [];
                    }

                    returnTeams[team.sport].push(team);
                }

                // sort the teams
                sportKeys = _.keys(returnTeams);
                for (count = 0; count < sportKeys.length; count++) {
                    sortTeams(returnTeams[sportKeys[count]]);
                }

                res.send(returnTeams);
            });
        });
    });
};
