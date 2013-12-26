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
            "click #future-games-header": "toggleFutureGames",
            "click #archived-games-header": "toggleArchivedGames"
        },

        initialize: function(args) {
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-notes", this.setNoteForGame, this);
            Backbone.on("render-non-available-games", this.renderNonAvailableGames, this);

            this.renderedNonAvailableGames = false;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var availableGamesSelector, currentTime, i, games, game, gameState, gameView;

            this.$el.html(this.template());

            currentTime = new Date();
            currentTime = currentTime.valueOf();

            availableGamesSelector = $("#available-games");

            // iterate over the user's games
            games = this.model.get("games");
            for (i = 0; i < games.length; i++) {
                game = games[i];

                // check to see if the user has seen this game already
                if (game.completed) {
                    gameState = "archived";
                } else {
                    // if we haven't, is it available to watch?
                    if (currentTime > game.availableGameTimeUTC) {
                        gameState = "available";
                    } else {
                        gameState = "future";
                    }
                }
                // store the game state
                game.gameState = gameState;

                // only render available games
                if (gameState === "available") {
                    // create a game view with the information we've collected so far
                    gameView = new GameView({
                        model: game,
                        gameState: gameState,
                        notes: game.notes || ""
                    });

                    // and append it to the available games
                    availableGamesSelector.append(gameView.render().el);
                }
            }

            return this;
        },

        renderNonAvailableGames: function() {
            var archivedGamesSelector, futureGamesSelector,
                currentTime, i, games, game, gameView;

            currentTime = new Date();
            currentTime = currentTime.valueOf();

            archivedGamesSelector = $("#archived-games");
            futureGamesSelector = $("#future-games");

            games = this.model.get("games");
            // iterate again, this time for archived and future games
            for (i = 0; i < games.length; i++) {
                game = games[i];

                if (game.gameState !== "available") {
                    // create a game view with the information we've collected so far
                    gameView = new GameView({
                        model: game,
                        gameState: game.gameState,
                        notes: game.notes || ""
                    });

                    // based on the game state, put the game in the correct section
                    switch (game.gameState) {
                        case "archived":
                            archivedGamesSelector.append(gameView.render().el);
                            break;
                        case "future":
                            futureGamesSelector.append(gameView.render().el);
                            break;
                        default:
                            console.error("unknown gameState: " + game.gameState);
                    }
                }
            }
        },

        setNoteForGame: function(game, note) {
            game.notes = note;
            this.model.save({
                game: game
            });
        },

        markedGameAsWatched: function(game) {
            game.completed = true;
            this.model.save({
                game: game
            });
        },

        toggleFutureGames: function(ev) {
            ev.preventDefault();

            if (!this.renderedNonAvailableGames) {
                this.renderedNonAvailableGames = true;
                Backbone.trigger("render-non-available-games");
            }

            $("#future-games").toggle();
        },

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            if (!this.renderedNonAvailableGames) {
                this.renderedNonAvailableGames = true;
                Backbone.trigger("render-non-available-games");
            }

            $("#archived-games").toggle();
        }
    });

});
