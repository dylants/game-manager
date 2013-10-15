/*global define:true */
define([
    "jquery",
    "backbone",
    "router",
    // our app requires backbone query params
    "backbone.queryparams",
], function($, Backbone, Router) {
    "use-strict";

    $(function() {
        new Router();

        Backbone.history.start({
            silent: false,
            root: "/nhl-game-data",
            pushState: true
        });
    });
});
