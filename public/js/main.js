require.config({
    paths: {
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "backbone.queryparams": "lib/backbone.queryparams",
        "backbone.routefilter": "lib/backbone.routefilter",
        "jquery": "lib/jquery-2.0.3",
        "text": "lib/text",
        "moment": "lib/moment.min",
        "game-model": "models/game-model",
        "schedule-collection": "models/schedule-collection",
        "session-model": "models/session-model",
        "user-model": "models/user-model",
        "user-ui-data-model": "models/user-ui-data-model",
        "game-view": "views/game-view",
        "games-view": "views/games-view",
        "session-view": "views/session-view",
        "router": "router",
        "app": "app"
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
