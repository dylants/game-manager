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
            this.userModel.on("sync", this.renderGames, this);
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
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                sportsWatched, gamesWatched, currentTime, that;

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            // clear the existing games
            archivedGamesSelector.empty();
            availableGamesSelector.empty();
            futureGamesSelector.empty();

            sportsWatched = this.userModel.get("sportsWatched");
            currentTime = new Date();
            currentTime = currentTime.valueOf();

            that = this;
            this.collection.each(function(game) {
                var gameView, gameTimeUTC, gamesWatched;

                gameView = new GameView({
                    model: game,
                    userModel: that.userModel
                });

                gameTimeUTC = game.toJSON().gameTimeUTC;
                gamesWatched = getGamesWatched(that.userModel.get("sportsWatched"), "NHL");
                // check to see if the user has seen this game already
                if (hasGameBeenWatched(gameTimeUTC, gamesWatched)) {
                    archivedGamesSelector.append(gameView.render().el);
                } else {
                    if (currentTime > game.toJSON().availableGameTimeUTC) {
                        availableGamesSelector.append(gameView.render().el);
                    } else {
                        futureGamesSelector.append(gameView.render().el);
                    }
                }
            });

            return this;
        }
    });
});

var getGamesWatched = function(sportsWatched, sport) {
    var gamesWatched;

    gamesWatched = [];
    if (sportsWatched && sportsWatched.length > 0) {
        for (i = 0; i < sportsWatched.length; i++) {
            if (sportsWatched[i].sport === sport) {
                gamesWatched = sportsWatched[i].gamesWatched;
                break;
            }
        }
    }

    return gamesWatched;
};

var hasGameBeenWatched = function(gameTimeUTC, gamesWatched) {
    var i;

    for (i = 0; i < gamesWatched.length; i++) {
        if (gamesWatched[i] === gameTimeUTC) {
            return true;
        }
    }
    return false;
};
