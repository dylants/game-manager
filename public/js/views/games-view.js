"use strict";

define([
    "backbone",
    "underscore",
    "jquery",
    "game-view",
    "game-model",
    "text!../templates/games.html"
], function(Backbone, _, $, GameView, GameModel, gamesHtml) {
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
            Backbone.on("game-undo-archived", this.undoArchivedGame, this);

            // setup for rendering more games
            this.availableGamesOffset = 0;
            this.archivedGamesOffset = 0;
            this.futureGamesOffset = 0;
            // amount of games to load each button press
            this.amountOfGamesToLoad = 10;

            // keep track of child views
            this.childViews = [];

            this.model.on("sync", this.renderGames, this);
        },

        close: function() {
            var i;

            // close all child views
            for (i = 0; i < this.childViews.length; i++) {
                this.childViews[i].close();
            }

            // stop listening to the events
            Backbone.off("game-marked-as-watched");
            Backbone.off("game-notes");
            Backbone.off("game-undo-archived");

            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            // render nothing, just fetch the model
            this.model.fetch();

            return this;
        },

        renderGames: function() {
            var model, availableGamesSelector, availableGames, futureGamesSelector,
                futureGames, archivedGames;

            this.$el.html(this.template());

            model = this.model.toJSON();
            availableGamesSelector = $("#available-games");
            availableGames = model.games.availableGames;
            futureGamesSelector = $("#future-games");
            futureGames = model.games.futureGames;
            archivedGames = model.games.archivedGames;

            // load (up to) 5 available games
            this.availableGamesOffset = this.renderMoreGames(availableGamesSelector,
                availableGames, this.availableGamesOffset, 5);
            // load (up to) 2 future games
            this.futureGamesOffset = this.renderMoreGames(futureGamesSelector,
                futureGames, this.futureGamesOffset, 3);

            // determine if we should hide the load more button
            if (this.availableGamesOffset >= availableGames.length) {
                $("#more-available-games-button").hide();
            }
            // determine if we should hide the load more button
            if (this.futureGamesOffset >= futureGames.length) {
                $("#more-future-games-button").hide();
            }
            // determine if we should hide the load more button
            if (archivedGames.length < 1) {
                $("#more-archived-games-button").hide();
            }

            return this;
        },

        renderMoreGames: function(gamesSelector, games, gamesOffset, gamesToLoad) {
            var i, count, game, gameView;

            if (gamesOffset >= games.length) {
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

                // add this view to our list of child views
                this.childViews.push(gameView);
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

        undoArchivedGame: function(game) {
            game.completed = false;
            this.model.save({
                game: game
            }, {
                patch: true
            });
        },

        renderMoreAvailableGames: function(ev) {
            var model, availableGames, availableGamesSelector;

            ev.preventDefault();

            // deselect the button
            ev.currentTarget.blur();

            model = this.model.toJSON();
            availableGames = model.games.availableGames;

            // check to see if we need to do anything
            if (this.availableGamesOffset >= availableGames.length) {
                // no more games to load, do nothing
                return;
            }

            availableGamesSelector = $("#available-games");

            // load (up to) amountOfGamesToLoad more available games
            this.availableGamesOffset = this.renderMoreGames(availableGamesSelector,
                availableGames, this.availableGamesOffset, this.amountOfGamesToLoad);

            // determine if we should hide the load more button
            if (this.availableGamesOffset >= availableGames.length) {
                $("#more-available-games-button").hide();
            }
        },

        renderMoreFutureGames: function(ev) {
            var model, futureGames, futureGamesSelector;

            ev.preventDefault();

            // deselect the button
            ev.currentTarget.blur();

            model = this.model.toJSON();
            futureGames = model.games.futureGames;

            // check to see if we need to do anything
            if (this.futureGamesOffset >= futureGames.length) {
                // no more games to load, do nothing
                return;
            }

            futureGamesSelector = $("#future-games");

            // load (up to) amountOfGamesToLoad more future games
            this.futureGamesOffset = this.renderMoreGames(futureGamesSelector,
                futureGames, this.futureGamesOffset, this.amountOfGamesToLoad);

            // determine if we should hide the load more button
            if (this.futureGamesOffset >= futureGames.length) {
                $("#more-future-games-button").hide();
            }
        },

        renderMoreArchivedGames: function(ev) {
            var model, archivedGames, archivedGamesSelector;

            ev.preventDefault();

            // deselect the button
            ev.currentTarget.blur();

            model = this.model.toJSON();
            archivedGames = model.games.archivedGames;

            // check to see if we need to do anything
            if (this.archivedGamesOffset >= archivedGames.length) {
                // no more games to load, do nothing
                return;
            }

            archivedGamesSelector = $("#archived-games");

            // load (up to) amountOfGamesToLoad more archived games
            this.archivedGamesOffset = this.renderMoreGames(archivedGamesSelector,
                archivedGames, this.archivedGamesOffset, this.amountOfGamesToLoad);

            // determine if we should hide the load more button
            if (this.archivedGamesOffset >= archivedGames.length) {
                $("#more-archived-games-button").hide();
            }
        }
    });

});
