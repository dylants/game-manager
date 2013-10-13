var teamsWithoutScores = function(teams) {
    var removeDigitsRegex;

    removeDigitsRegex = /[^\d\s]+/g;

    return teams.match(removeDigitsRegex).join(" ");
};

var isGameOver = function(teams) {
    if (teams.indexOf("-") > 0) {
        return true;
    } else {
        return false;
    }
};

var isGameBlackedOut = function(networks) {
    if ((networks.indexOf("NBC") !== -1) ||
        (networks.indexOf("NHLN-US") !== -1)) {
        return true;
    } else {
        return false;
    }
};

function Game(date, time, teams, location, networks) {
    this.date = date;
    this.time = time;
    this.teams = teams;
    this.teamsWithoutScores = teamsWithoutScores(teams);
    this.location = location;
    this.networks = networks;
    this.isGameOver = isGameOver(this.teamsWithoutScores);
    this.isBlackedOut = isGameBlackedOut(this.networks);
}

module.exports = Game;
