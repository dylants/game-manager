/* global define:true */
define([
    "backbone",
    "underscore",
    "jquery",
    "schedule-collection",
    "game-view",
    "game-model",
    "text!../templates/games.html"
], function(Backbone, _, $, ScheduleCollection, GameView, GameModel, gamesHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "#main",

        template: _.template(gamesHtml),

        events: {
            "click #available-games-header": "toggleAvailableGames",
            "click #future-games-header": "toggleFutureGames",
            "click #archived-games-header": "toggleArchivedGames"
        },

        initialize: function(args) {
            // setup for game interaction
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-notes", this.setNoteForGame, this);

            // setup for rendering of archived and future games
            this.renderedArchivedGames = false;
            this.renderedFutureGames = false;
            Backbone.on("render-archived-games", this.renderArchivedGames, this);
            Backbone.on("render-future-games", this.renderFutureGames, this);
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var availableGamesSelector, i, games, game, gameView;

            this.$el.html(this.template());

            availableGamesSelector = $("#available-games");

            // iterate over the user's games
            games = this.model.get("games");
            for (i = 0; i < games.length; i++) {
                game = games[i];

                // only render available games
                if (game.gameState === "available") {
                    // create a game view with the information we've collected so far
                    gameView = new GameView({
                        model: game,
                        gameState: game.gameState,
                        notes: game.notes || ""
                    });

                    // and append it to the available games
                    availableGamesSelector.append(gameView.render().el);
                }
            }

            return this;
        },

        renderArchivedGames: function() {
            var archivedGamesSelector, i, games, game, gameView;

            archivedGamesSelector = $("#archived-games");

            games = this.model.get("games");
            for (i = 0; i < games.length; i++) {
                game = games[i];

                // if the game state is archived...
                if (game.gameState === "archived") {
                    gameView = new GameView({
                        model: game,
                        gameState: game.gameState,
                        notes: game.notes || ""
                    });

                    // render the view in the archived section
                    archivedGamesSelector.append(gameView.render().el);
                }
            }
        },

        renderFutureGames: function() {
            var futureGamesSelector, i, games, game, gameView;

            futureGamesSelector = $("#future-games");

            games = this.model.get("games");
            for (i = 0; i < games.length; i++) {
                game = games[i];

                if (game.gameState === "future") {
                    gameView = new GameView({
                        model: game,
                        gameState: game.gameState,
                        notes: game.notes || ""
                    });

                    futureGamesSelector.append(gameView.render().el);
                }
            }
        },

        setNoteForGame: function(game, note) {
            game.notes = note;
            this.model.save({
                game: game
            }, {
                patch: true
            });
        },

        markedGameAsWatched: function(game) {
            game.completed = true;
            this.model.save({
                game: game
            }, {
                patch: true
            });
        },

        toggleAvailableGames: function(ev) {
            ev.preventDefault();

            $("#available-games").toggle();
        },

        toggleFutureGames: function(ev) {
            ev.preventDefault();

            if (!this.renderedFutureGames) {
                this.renderedFutureGames = true;
                Backbone.trigger("render-future-games");
            }

            $("#future-games").toggle();
        },

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            if (!this.renderedArchivedGames) {
                this.renderedArchivedGames = true;
                Backbone.trigger("render-archived-games");
            }

            $("#archived-games").toggle();
        }
    });

});
