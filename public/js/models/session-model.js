/* global define:true */
define([
    "backbone"
], function(Backbone) {
    "use strict";

    return Backbone.Model.extend({
        url: "/api/session",

        initialize: function() {
        }
    });
});
