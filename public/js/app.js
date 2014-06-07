"use strict";

/*global define:true */
define([
    "jquery",
    "backbone",
    "router",
    // our app requires backbone query params
    "backbone.queryparams",
    // and backbone route filter,
    "backbone.routefilter",
    // our app requires moment
    "moment",
    // our app requires bootstrap
    "bootstrap"
], function($, Backbone, Router) {
    $(function() {
        new Router();

        Backbone.history.start({
            silent: false,
            root: "/game-manager",
            pushState: true
        });
    });
});
