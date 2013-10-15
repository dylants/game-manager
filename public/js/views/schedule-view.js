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

        initialize: function() {
            this.collection.on("sync", this.renderGames, this);
        },

        close: function() {

        },

        render: function() {
            this.$el.html(this.template({ "team": this.collection.getTeamName() }));
            return this;
        },

        renderGames: function() {
            var gamesSelector = $("#games");

            // clear the existing games
            gamesSelector.empty();
            this.collection.each(function(game) {
                var gameView = new GameView({
                    model: game
                });
                gamesSelector.append(gameView.render().el);
            });

            return this;
        }
    });
});
