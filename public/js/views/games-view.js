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

    return Backbone.View.extend({

        el: "#main",

        template: _.template(gamesHtml),

        events: {
            "click #archived-games-header": "toggleArchivedGames"
        },

        initialize: function(args) {
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-edit", this.editGame, this);

            // used to determine if all games have been loaded
            this.teamGamesLoaded = 0;
            this.gamesLoaded = [];
            this.totalTeams = 0;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var that;

            this.$el.html(this.template());

            that = this;
            $.when(
                this.model.fetch()
            ).done(
                function() {
                    that.loadGames();
                }
            );

            return this;
        },

        loadGames: function() {
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                teams, i;

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            // clear the existing games
            archivedGamesSelector.empty();
            availableGamesSelector.empty();
            futureGamesSelector.empty();

            // reset the team games loaded
            this.teamGamesLoaded = 0;
            this.gamesLoaded = [];
            this.totalTeams = this.model.get("teams").length;

            teams = this.model.get("teams");
            for (i = 0; i < teams.length; i++) {
                this.loadTeamGames(teams[i].sport, teams[i].team);
            }
        },

        loadTeamGames: function(sport, team) {
            var options, games, sportsWatched, that;

            options = {};
            options.sport = sport;
            options.team = team;
            games = new ScheduleCollection([], options);
            sportsWatched = this.model.get("sportsWatched");

            that = this;
            $.when(
                games.fetch()
            ).done(
                function() {
                    that.doneLoadedGames(games);
                }
            );
        },

        doneLoadedGames: function(loadedGames) {
            this.teamGamesLoaded++;
            this.gamesLoaded = this.gamesLoaded.concat(loadedGames.models);
            if (this.teamGamesLoaded >= this.totalTeams) {
                this.renderGames();
            }
        },

        renderGames: function() {
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                currentTime, i, game, gameView, gameJSON;

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            currentTime = new Date();
            currentTime = currentTime.valueOf();

            this.gamesLoaded.sort(function(a, b) {
                var gameA, gameB;

                gameA = a.toJSON();
                gameB = b.toJSON();

                if (gameA.availableGameTimeUTC > gameB.availableGameTimeUTC) {
                    return 1;
                } else if (gameB.availableGameTimeUTC > gameA.availableGameTimeUTC) {
                    return -1;
                } else {
                    return 0;
                }
            });

            for (i=0; i<this.gamesLoaded.length; i++) {
                game = this.gamesLoaded[i];

                gameView = new GameView({
                    model: game
                });

                gameJSON = game.toJSON();
                // check to see if the user has seen this game already
                if (this.findWatchedGame(gameJSON)) {
                    archivedGamesSelector.append(gameView.render().el);
                } else {
                    if (currentTime > gameJSON.availableGameTimeUTC) {
                        availableGamesSelector.append(gameView.render().el);
                    } else {
                        futureGamesSelector.append(gameView.render().el);
                    }
                }
            }
        },

        getGamesWatched: function(sport) {
            var gamesWatched, sportsWatched, i;

            gamesWatched = [];
            sportsWatched = this.model.get("sportsWatched");
            if (sportsWatched && sportsWatched.length > 0) {
                for (i = 0; i < sportsWatched.length; i++) {
                    if (sportsWatched[i].sport === sport) {
                        gamesWatched = sportsWatched[i].games;
                        break;
                    }
                }
            }

            return gamesWatched;
        },

        findWatchedGame: function(game) {
            var gamesWatched, i;

            gamesWatched = this.getGamesWatched(game.sport);
            for (i = 0; i < gamesWatched.length; i++) {
                if (gamesWatched[i].game === game._id) {
                    return gamesWatched[i];
                }
            }
            return null;
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
            watchedGame = this.findWatchedGame(game);
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
