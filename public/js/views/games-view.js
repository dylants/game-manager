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
            "click #more-available-games-button": "renderMoreAvailableGames",
            "click #more-future-games-button": "renderMoreFutureGames",
            "click #more-archived-games-button": "renderMoreArchivedGames"
        },

        initialize: function(args) {
            // setup for game interaction
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-notes", this.setNoteForGame, this);

            // setup for rendering more games
            this.availableGamesOffset = 0;
            this.archivedGamesOffset = 0;
            this.futureGamesOffset = 0;
            // amount of games to load each button press
            this.amountOfGamesToLoad = 10;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var availableGamesSelector, availableGames, futureGamesSelector,
                futureGames;

            this.$el.html(this.template());

            availableGamesSelector = $("#available-games");
            availableGames = this.model.get("availableGames");
            futureGamesSelector = $("#future-games");
            futureGames = this.model.get("futureGames");

            // load (up to) 5 available games
            this.availableGamesOffset = this.renderMoreGames(availableGamesSelector,
                availableGames, this.availableGamesOffset, 5);
            // load (up to) 2 future games
            this.futureGamesOffset = this.renderMoreGames(futureGamesSelector,
                futureGames, this.futureGamesOffset, 3);

            return this;
        },

        renderMoreGames: function(gamesSelector, games, gamesOffset, gamesToLoad) {
            var i, count, game, gameView;

            if (gamesOffset > games.length) {
                // no more to load, return
                return;
            }

            // keep track of the amount we've loaded
            count = 0;
            // load more games until we've loaded all games or gamesToLoad
            for (i = gamesOffset; i < games.length && count < gamesToLoad; i++) {
                count++;
                game = games[i];

                gameView = new GameView({
                    model: game,
                    gameState: game.gameState,
                    notes: game.notes || ""
                });

                gamesSelector.append(gameView.render().el);
            }

            // return the amount of games loaded + offset
            return count + gamesOffset;
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

        renderMoreAvailableGames: function(ev) {
            var availableGamesSelector, availableGames;

            ev.preventDefault();

            availableGamesSelector = $("#available-games");
            availableGames = this.model.get("availableGames");

            // load (up to) amountOfGamesToLoad more available games
            this.availableGamesOffset = this.renderMoreGames(availableGamesSelector,
                availableGames, this.availableGamesOffset, this.amountOfGamesToLoad);
        },

        renderMoreFutureGames: function(ev) {
            var futureGamesSelector, futureGames;

            ev.preventDefault();

            futureGamesSelector = $("#future-games");
            futureGames = this.model.get("futureGames");

            // load (up to) amountOfGamesToLoad more future games
            this.futureGamesOffset = this.renderMoreGames(futureGamesSelector,
                futureGames, this.futureGamesOffset, this.amountOfGamesToLoad);
        },

        renderMoreArchivedGames: function(ev) {
            var archivedGamesSelector, archivedGames;

            ev.preventDefault();

            archivedGamesSelector = $("#archived-games");
            archivedGames = this.model.get("archivedGames");

            // load (up to) amountOfGamesToLoad more archived games
            this.archivedGamesOffset = this.renderMoreGames(archivedGamesSelector,
                archivedGames, this.archivedGamesOffset, this.amountOfGamesToLoad);
        }
    });

});
