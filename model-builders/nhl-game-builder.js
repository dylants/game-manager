var moment = require("moment");

/**
 * Removes the scores from the teams string (if it exists)
 *
 * @param  {String} teams The teams with optional score
 * @return {String}       The teams without a game score
 */
var teamsWithoutScores = function(teams) {
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
var isGameOver = function(teams) {
    if (teams.indexOf("-") > 0) {
        return true;
    } else {
        return false;
    }
};

/**
 * Returns the team who won the game (or "tie" if tied)
 *
 * @param  {String} teams The teams string with score
 * @return {String}       The team who won or "tie" if tied
 */
var whoWon = function(teams) {
    var teamsWithScores, team1, team1Score, team2, team2Score;

    // first split the teams into individual team + score
    teamsWithScores = teams.split(" - ");
    // determine each team and score
    team1 = teamsWithScores[0].slice(0, teamsWithScores[0].lastIndexOf(" ")).trim();
    team1Score = teamsWithScores[0].slice(teamsWithScores[0].lastIndexOf(" ")).trim();
    team2 = teamsWithScores[1].slice(0, teamsWithScores[1].lastIndexOf(" ")).trim();
    team2Score = teamsWithScores[1].slice(teamsWithScores[1].lastIndexOf(" ")).trim();

    if (team1Score > team2Score) {
        return team1;
    } else if (team2Score > team1Score) {
        return team2;
    } else {
        return "tie";
    }
};

/**
 * Returns true if the game is blacked out
 *
 * @param  {String}  networks The networks that aired the game (or will air)
 * @return {Boolean}          true iff the game is blacked out
 */
var isGameBlackedOut = function(networks) {
    if ((networks.indexOf("NBC") !== -1) ||
        (networks.indexOf("NHLN-US") !== -1)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Returns the UTC time when this game will be available to watch (because of
 * black out)
 *
 * @param  {Number} gameTimeUTC The game time UTC
 * @return {Number}             The time in UTC when the game will be available
 */
var blackOutAvailableGameTimeUTC = function(gameTimeUTC) {
    return moment(gameTimeUTC).add("hours", 52).valueOf();
};

/**
 * Creates an NHLGame, which has a date and time, teams, and a based on the networks,
 * if it's blacked out
 *
 * @constructor
 *
 * @param {String} date     The date the game was aired (or will air)
 * @param {String} time     The time the game will air
 * @param {String} teams    The teams that played, along with a score (if game
 *                          is complete)
 * @param {String} location The location of the game
 * @param {String} networks The networks that aired the game (or will air)
 */
function NHLGameBuilder(date, time, teams, location, networks) {
    // store the passed in values
    this.date = date;
    this.time = time;
    this.teams = teams;
    this.location = location;
    this.networks = networks;

    // calculate the UTC game time
    this.gameTimeUTC = moment(this.date + " " + this.time).valueOf();

    // pull the scores out, figure out if the game is over, and who won
    this.teamsWithoutScores = teamsWithoutScores(this.teams);
    this.isGameOver = isGameOver(this.teams);
    if (this.isGameOver) {
        this.whoWon = whoWon(this.teams);
    }

    // populate the blacked out attributes
    this.isBlackedOut = isGameBlackedOut(this.networks);
    if (this.isBlackedOut) {
        this.availableGameTimeUTC = blackOutAvailableGameTimeUTC(this.gameTimeUTC);
    }
}

module.exports = NHLGameBuilder;
