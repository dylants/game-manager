/* global define:true */
define([
    "backbone",
    "game-model"
], function(Backbone, GameModel) {
    "use strict";

    return Backbone.Collection.extend({

        url: "/api/schedule",

        model: GameModel,

        initialize: function() {
            this.fetch();
        }

    });
});
