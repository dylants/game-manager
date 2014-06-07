"use strict";

define([
    "backbone"
], function(Backbone) {
    return Backbone.Model.extend({
        url: "/api/user-ui-data",

        isNew: function() {
            // the data in this model is never new,
            // we're always performing a PATCH instead of POST
            return false;
        }
    });
});
