/* global define:true */
define([
    "backbone",
    "underscore",
    "jquery",
    "schedule-collection",
    "game-view",
    "game-model",
    "text!/assets/templates/games.html"
], function(Backbone, _, $, ScheduleCollection, GameView, GameModel, gamesHtml) {
    "use strict";

    var renderGames = function(games, sportsWatched, sport) {
        var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
            currentTime, gamesWatched, that;

        archivedGamesSelector = $("#archived-games");
        availableGamesSelector = $("#available-games");
        futureGamesSelector = $("#future-games");

        // clear the existing games
        archivedGamesSelector.empty();
        availableGamesSelector.empty();
        futureGamesSelector.empty();

        currentTime = new Date();
        currentTime = currentTime.valueOf();

        gamesWatched = getGamesWatched(sportsWatched, sport);
        games.each(function(game) {
            var gameView, gameJSON;

            gameView = new GameView({
                model: game
            });

            gameJSON = game.toJSON();
            // check to see if the user has seen this game already
            if (findWatchedGame(gameJSON._id, gamesWatched)) {
                archivedGamesSelector.append(gameView.render().el);
            } else {
                if (currentTime > gameJSON.availableGameTimeUTC) {
                    availableGamesSelector.append(gameView.render().el);
                } else {
                    futureGamesSelector.append(gameView.render().el);
                }
            }
        });
    };

    var getGamesWatched = function(sportsWatched, sport) {
        var gamesWatched, i;

        gamesWatched = [];
        if (sportsWatched && sportsWatched.length > 0) {
            for (i = 0; i < sportsWatched.length; i++) {
                if (sportsWatched[i].sport === sport) {
                    gamesWatched = sportsWatched[i].games;
                    break;
                }
            }
        }

        return gamesWatched;
    };

    var findWatchedGame = function(gameId, gamesWatched) {
        var i;

        for (i = 0; i < gamesWatched.length; i++) {
            if (gamesWatched[i].game === gameId) {
                return gamesWatched[i];
            }
        }
        return null;
    };


    return Backbone.View.extend({

        el: "#main",

        template: _.template(gamesHtml),

        events: {
            "click #archived-games-header": "toggleArchivedGames"
        },

        initialize: function(args) {
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-edit", this.editGame, this);
            this.model.on("sync", this.loadGames, this);
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template());

            this.model.fetch();

            return this;
        },

        loadGames: function() {
            var options, teams, i, games, sportsWatched;

            options = {};
            teams = this.model.get("teams");
            for (i = 0; i < teams.length; i++) {
                // only support NHL teams as of now
                if (teams[i].sport === "NHL") {
                    options.team = teams[i].team;
                    break;
                }
            }
            games = new ScheduleCollection([], options);
            sportsWatched = this.model.get("sportsWatched");

            $.when(
                games.fetch()
            ).done(
                function() {
                    renderGames(games, sportsWatched, "NHL");
                }
            );
        },

        editGame: function(game) {
            console.log("edit game!");
        },

        markedGameAsWatched: function(game) {
            var sportsWatched, i, games, watchedGame;

            console.log("watched game!");

            sportsWatched = this.model.get("sportsWatched");

            for (i = 0; i < sportsWatched.length; i++) {
                if (sportsWatched[i].sport === game.sport) {
                    games = sportsWatched[i].games;
                    break;
                }
            }
            if (!games) {
                sportsWatched.push({
                    sport: game.sport,
                    games: []
                });
                games = sportsWatched[sportsWatched.length - 1].games;
            }

            // add or edit?
            watchedGame = findWatchedGame(game._id, games);
            if (watchedGame) {
                // edit the existing game
                watchedGame.completed = true;
                this.model.save();
            } else {
                // add the game
                games.push({
                    game: game._id,
                    notes: null,
                    completed: true
                });
                this.model.save();
            }
        },

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            $("#archived-games").toggle();
        }
    });

});
