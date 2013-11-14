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
            "click #archived-games-header" : "toggleArchivedGames"
        },

        initialize: function(args) {
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
            var options, teams, i, that;

            options = {};
            teams = this.model.get("teams");
            for (i=0; i<teams.length; i++) {
                // only support NHL teams as of now
                if (teams[i].sport === "NHL") {
                    options.team = teams[i].team;
                    break;
                }
            }
            this.teamGames = new ScheduleCollection([], options);

            that = this;
            $.when(
                this.teamGames.fetch()
            ).done(
                function() {
                    that.renderGames();
                }
            );
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

            sportsWatched = this.model.get("sportsWatched");
            currentTime = new Date();
            currentTime = currentTime.valueOf();

            that = this;
            this.teamGames.each(function(game) {
                var gameView, gameTimeUTC, gamesWatched;

                gameView = new GameView({
                    model: game,
                    userModel: that.model
                });

                gameTimeUTC = game.toJSON().gameTimeUTC;
                gamesWatched = getGamesWatched(that.model.get("sportsWatched"), "NHL");
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
        },

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            $("#archived-games").toggle();
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
