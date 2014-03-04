var teamSchedule = require("../lib/team-schedule"),
    mongoose = require("mongoose"),
    Team = mongoose.model("Team");

function getTeamSchedule(sport, teamName, res) {
    Team.findOne({
        sport: sport,
        name: teamName
    }).populate("schedule").exec(function(err, team) {
        if (err) {
            console.error(err);
            res.send(500);
            return;
        }

        if (team) {
            res.send(team.schedule);
        } else {
            res.send(404, "Team not found");
        }
    });
}

function updateSchedule(sport, teamName, app, res) {
    Team.findOne({
        sport: sport,
        name: teamName
    }, function(err, team) {
        teamSchedule.update(sport, teamName, team.teamId, app,
            function(err) {
                if (err) {
                    console.log(err);
                    res.send(500);
                    return;
                }

                res.send("done!");
            }
        );
    });
}

module.exports = function(app) {
    app.namespace("/api", function() {

        /***********
         *** NHL ***
         ***********/

        app.get("/nhl/teams/:team/schedule", function(req, res) {
            getTeamSchedule("NHL", req.params.team, res);
        });

        app.get("/nhl/teams/:team/update-schedule", function(req, res) {
            updateSchedule("NHL", req.params.team, app, res);
        });

        /***********
         *** NBA ***
         ***********/

        app.get("/nba/teams/:team/schedule", function(req, res) {
            getTeamSchedule("NBA", req.params.team, res);
        });

        app.get("/nba/teams/:team/update-schedule", function(req, res) {
            updateSchedule("NBA", req.params.team, app, res);
        });

        /***********
         *** MLB ***
         ***********/

        app.get("/mlb/teams/:team/schedule", function(req, res) {
            getTeamSchedule("MLB", req.params.team, res);
        });

        app.get("/mlb/teams/:team/update-schedule", function(req, res) {
            updateSchedule("MLB", req.params.team, app, res);
        });

    });
};
