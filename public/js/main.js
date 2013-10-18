require.config({
    paths: {
        "underscore": "/assets/js/lib/underscore-min",
        "backbone": "/assets/js/lib/backbone-min",
        "backbone.queryparams": "/assets/js/lib/backbone.queryparams",
        "jquery": "/assets/js/lib/jquery-2.0.3.min",
        "text": "/assets/js/lib/text",
        "moment": "/assets/js/lib/moment.min",
        "schedule-collection": "/assets/js/models/schedule-collection",
        "schedule-view": "/assets/js/views/schedule-view",
        "game-model": "/assets/js/models/game-model",
        "game-view": "/assets/js/views/game-view",
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
        }
    }
});

require(["app"]);
