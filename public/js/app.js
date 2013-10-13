/*global define:true */
define([
    "jquery",
    "backbone",
    "router"
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
