/* global define:true */
define([
    "backbone",
    "game-model"
], function(Backbone, GameModel) {
    "use strict";

    return Backbone.Collection.extend({

        url: function() {
            return "/api/schedule?team=" + this.team;
        },

        model: GameModel,

        initialize: function(models, options) {
            // default to the blackhawks if no team is specified
            this.team = "blackhawks";
            if (options && options.team) {
                this.team = options.team;
            }

            // fetch the game schedule
            this.fetch();
        },

        getTeamName: function() {
            // capitalize the first letter of the team name
            return this.team.charAt(0).toUpperCase() + this.team.slice(1);
        }

    });
});
