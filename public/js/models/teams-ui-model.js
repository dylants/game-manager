"use strict";

define([
    "backbone"
], function(Backbone) {
    return Backbone.Model.extend({
        url: "/api/teams-ui"
    });
});
