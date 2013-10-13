require.config({
    paths: {
        "underscore": "/assets/js/lib/underscore-min",
        "backbone": "/assets/js/lib/backbone-min",
        "jquery": "/assets/js/lib/jquery-2.0.3.min",
        "text": "/assets/js/lib/text",
        "game-collection": "/assets/js/models/game-collection",
        "game-model": "/assets/js/models/game-model",
        "game-view": "/assets/js/views/game-view",
        "games-view": "/assets/js/views/games-view",
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
        }
    }
});

require(["app"]);
