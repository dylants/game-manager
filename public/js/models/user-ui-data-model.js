"use strict";

define([
    "backbone"
], function(Backbone) {
    return Backbone.Model.extend({
        url: "/api/user-ui-data/"
    });
});
