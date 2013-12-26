/* global define:true */
define([
    "backbone"
], function(Backbone) {
    "use strict";

    return Backbone.Model.extend({
        url: function() {
            return "/api/user-ui-data/" + this.id;
        },

        initialize: function(models, userId) {
            this.id = userId;
        }
    });
});
