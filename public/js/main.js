require.config({
    paths: {
        "underscore": "/assets/js/lib/underscore",
        "backbone": "/assets/js/lib/backbone",
        "backbone.queryparams": "/assets/js/lib/backbone.queryparams",
        "backbone.routefilter": "/assets/js/lib/backbone.routefilter",
        "jquery": "/assets/js/lib/jquery-2.0.3",
        "text": "/assets/js/lib/text",
        "moment": "/assets/js/lib/moment.min",
        "session-model": "/assets/js/models/session-model",
        "session-view": "/assets/js/views/session-view",
        "schedule-collection": "/assets/js/models/schedule-collection",
        "schedule-view": "/assets/js/views/schedule-view",
        "game-model": "/assets/js/models/game-model",
        "game-view": "/assets/js/views/game-view",
        "user-model": "/assets/js/models/user-model",
        "router": "/assets/js/router",
        "app": "/assets/js/app"
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        "backbone.queryparams": {
            deps: ["backbone"]
        },
        "backbone.routefilter": {
            deps: ["backbone"]
        }
    }
});

require(["app"]);
