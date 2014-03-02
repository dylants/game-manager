require.config({
    paths: {
        "underscore": "lib/underscore",
        "backbone": "lib/backbone",
        "backbone.queryparams": "lib/backbone.queryparams",
        "backbone.routefilter": "lib/backbone.routefilter",
        "jquery": "lib/jquery-2.0.3",
        "text": "lib/text",
        "moment": "lib/moment.min",
        "bootstrap": "lib/bootstrap",
        "game-model": "models/game-model",
        "session-model": "models/session-model",
        "teams-ui-model": "models/teams-ui-model",
        "user-model": "models/user-model",
        "user-ui-data-model": "models/user-ui-data-model",
        "game-view": "views/game-view",
        "games-view": "views/games-view",
        "header-view": "views/header-view",
        "session-view": "views/session-view",
        "team-view": "views/team-view",
        "teams-view": "views/teams-view",
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
        },
        "bootstrap": {
            deps: ["jquery"]
        }
    }
});

require(["app"]);
