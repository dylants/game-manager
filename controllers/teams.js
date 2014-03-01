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

function importTeams(sport, res) {
    var config, teams, team, i;

    if (sport === "NHL") {
        config = app.get("config").nhl;
    } else if (sport === "NBA") {
        config = app.get("config").nba;
    } else {
        console.error("Unrecognized sport: " + sport);
        res.send(500);
        return;
    }

    teams = config.teams;
    for (i = 0; i < teams.length; i++) {
        team = new Team({
            // name is the lowercase, trimmed mascot
            name: teams[i].mascot.toLowerCase().replace(/\s*/g, ""),
            city: teams[i].city,
            mascot: teams[i].mascot,
            sport: sport,
            conference: teams[i].conference,
            division: teams[i].division,
            logoHref: teams[i].logoHref
        });
        team.save();
    }
    res.send("done!");
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

        app.get("/nhl/import-teams", function(req, res) {
            importTeams("NHL", res);
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

        app.get("/nba/import-teams", function(req, res) {
            importTeams("NBA", res);
        });

    });
};
