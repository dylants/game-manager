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
            Backbone.on("game-notes", this.setNoteForGame, this);
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
            // First, load the model. Then when done, call renderGames
            $.when(
                this.model.fetch()
            ).done(
                function() {
                    that.renderGames();
                }
            );

            return this;
        },

        renderGames: function() {
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                currentTime, i, games, game, gameState, gameView;

            currentTime = new Date();
            currentTime = currentTime.valueOf();

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            // iterate over the user's games
            games = this.model.get("games");
            for (i=0; i<games.length; i++) {
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

                // create a game view with the information we've collected so far
                gameView = new GameView({
                    model: game,
                    gameState: gameState,
                    notes: game.notes || ""
                });

                // based on the game state, put the game in the correct section
                switch (gameState) {
                    case "archived":
                        archivedGamesSelector.append(gameView.render().el);
                        break;
                    case "available":
                        availableGamesSelector.append(gameView.render().el);
                        break;
                    case "future":
                        futureGamesSelector.append(gameView.render().el);
                        break;
                    default:
                        console.error("unknown gameState: " + gameState);
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

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            $("#archived-games").toggle();
        }
    });

});
