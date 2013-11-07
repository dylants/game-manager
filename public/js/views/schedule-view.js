/* global define:true */
define([
    "backbone",
    "underscore",
    "jquery",
    "game-view",
    "game-model",
    "text!/assets/templates/schedule.html"
], function(Backbone, _, $, GameView, GameModel, scheduleHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "#main",

        template: _.template(scheduleHtml),

        events: {},

        initialize: function(args) {
            this.collection.on("sync", this.renderGames, this);
            this.userModel = args.userModel;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            this.$el.html(this.template({
                "team": this.collection.getTeamName()
            }));

            $.when(
                this.collection.fetch(),
                this.userModel.fetch()
            ).done(
                this.renderGames()
            );

            return this;
        },

        renderGames: function() {
            var pastGamesSelector, futureGamesSelector, that;

            pastGamesSelector = $("#past-games");
            futureGamesSelector = $("#future-games");

            // clear the existing games
            pastGamesSelector.empty();
            futureGamesSelector.empty();
            that = this;
            this.collection.each(function(game) {
                var gameView = new GameView({
                    model: game,
                    userModel: that.userModel
                });
                if (game.toJSON().isGameOver) {
                    pastGamesSelector.append(gameView.render().el);
                } else {
                    futureGamesSelector.append(gameView.render().el);
                }
            });

            return this;
        },

        watchedGame: function(ev) {
            var gameTimeUTC;

            gameTimeUTC = $.data(ev.currentTarget, "gameTimeUTC");
            console.log("clicked!");
        }
    });
});
