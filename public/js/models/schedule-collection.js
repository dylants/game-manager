/* global define:true */
define([
    "backbone",
    "game-model"
], function(Backbone, GameModel) {
    "use strict";

    return Backbone.Collection.extend({

        url: function() {
            return "/api/nhl/teams/" + this.team + "/schedule";
        },

        model: GameModel,

        initialize: function(models, options) {
            // default to the blackhawks if no team is specified
            this.team = "blackhawks";
            if (options && options.team) {
                this.team = options.team;
            }
        }

    });
});
