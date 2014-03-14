var mongoose = require("mongoose"),
    Team = mongoose.model("Team");

function getTeams(sport, res) {
    Team.find({
        sport: sport
    }, function(err, teams) {
        var returnTeams, count, team;

        if (err) {
            console.error(err);
            res.send(500);
            return;
        }

        returnTeams = [];
        for (count = 0; count < teams.length; count++) {
            team = teams[count].toJSON();
            // remove the schedule
            delete team.schedule;
            returnTeams.push(team);
        }
        res.send(returnTeams);
    });
}

function getTeam(sport, teamName, res) {
    Team.findOne({
        sport: sport,
        name: teamName
    }, function(err, team) {
        if (err) {
            console.error(err);
            res.send(500);
            return;
        }

        if (team) {
            res.send(team);
        } else {
            res.send(404, "Team not found");
        }
    });
}

module.exports = function(app) {
    app.namespace("/api", function() {

        /***********
         *** NHL ***
         ***********/

        app.get("/nhl/teams", function(req, res) {
            getTeams("NHL", res);
        });

        app.get("/nhl/teams/:team", function(req, res) {
            getTeam("NHL", req.params.team, res);
        });

        /***********
         *** NBA ***
         ***********/

        app.get("/nba/teams", function(req, res) {
            getTeams("NBA", res);
        });

        app.get("/nba/teams/:team", function(req, res) {
            getTeam("NBA", req.params.team, res);
        });

        /***********
         *** MLB ***
         ***********/

        app.get("/mlb/teams", function(req, res) {
            getTeams("MLB", res);
        });

        app.get("/mlb/teams/:team", function(req, res) {
            getTeam("MLB", req.params.team, res);
        });

    });
};
