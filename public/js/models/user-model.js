/* global define:true */
define([
    "backbone"
], function(Backbone) {
    "use strict";

    return Backbone.Model.extend({
        url: function() {
            return "/api/users/" + this.id;
        },

        initialize: function(models, userId) {
            this.id = userId;
        }
    });
});
