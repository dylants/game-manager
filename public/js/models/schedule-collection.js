/* global define:true */
define([
    "backbone",
    "game-model"
], function(Backbone, GameModel) {
    "use strict";

    return Backbone.Collection.extend({

        url: function() {
            return "/api/" + this.sport + "/teams/" + this.team + "/schedule";
        },

        model: GameModel,

        initialize: function(models, options) {
            // default to the NHL and blackhawks if not specified
            this.sport = "nhl";
            this.team = "blackhawks";
            if (options) {
                if (options.sport) {
                    this.sport = options.sport.toLowerCase();
                }
                if (options.team) {
                    this.team = options.team;
                }
            }
        }

    });
});
