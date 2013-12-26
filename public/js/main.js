require.config({
    paths: {
        "underscore": "/assets/js/lib/underscore",
        "backbone": "/assets/js/lib/backbone",
        "backbone.queryparams": "/assets/js/lib/backbone.queryparams",
        "backbone.routefilter": "/assets/js/lib/backbone.routefilter",
        "jquery": "/assets/js/lib/jquery-2.0.3",
        "text": "/assets/js/lib/text",
        "moment": "/assets/js/lib/moment.min",
        "game-model": "/assets/js/models/game-model",
        "schedule-collection": "/assets/js/models/schedule-collection",
        "session-model": "/assets/js/models/session-model",
        "user-model": "/assets/js/models/user-model",
        "user-ui-data-model": "/assets/js/models/user-ui-data-model",
        "game-view": "/assets/js/views/game-view",
        "games-view": "/assets/js/views/games-view",
        "session-view": "/assets/js/views/session-view",
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
