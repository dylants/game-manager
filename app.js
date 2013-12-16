require("express-namespace");
require("js-yaml");
var express = require("express"),
    fs = require("fs"),
    cons = require("consolidate"),
    app = express(),
    passport = require("passport"),
    mongoose = require("mongoose"),
    config = require("./config.yaml");

// 30 days for session cookie lifetime
var SESSION_COOKIE_LIFETIME = 1000 * 60 * 60 * 24 * 30;

// Verifies the user is authenticated, else returns unauthorized
var requireAuthentication = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.send(401);
};

// configure the app (all environments)
app.configure(function() {
    // set the port
    app.set("port", 3000);

    // configure view rendering (underscore)
    app.engine("html", cons.underscore);
    app.set("view engine", "html");
    app.set("views", __dirname + "/views");

    // use express' cookie parser to access request cookies
    app.use(express.cookieParser());

    // use express' body parser to access body elements later
    app.use(express.bodyParser());

    // use express' cookie session
    app.use(express.cookieSession({
        secret: "gmecs",
        cookie: {
            maxAge: SESSION_COOKIE_LIFETIME
        }
    }));

    // read in the config and set it in the app to be accessed later
    app.set("config", config);

    /*
     * Connect to mongoDB at localhost using the database "game".
     * This connection will be used by the mongoose API throughout
     * our code base.
     */
    mongoose.connect("mongodb://localhost/game", function(error) {
        // handle the error case
        if (error) {
            console.error("Failed to connect to the Mongo server!!");
            console.error(error);
            throw error;
        }
    });

    // bring in all models into scope (these use mongoose)
    fs.readdirSync("models").forEach(function(modelName) {
        require("./models/" + modelName);
    });

    // include passport authentication (after mongo since it requires it)
    require("./passport-configuration");
    app.use(passport.initialize());
    app.use(passport.session());

    // configure that all routes under /api require authentication
    app.all("/api/*", requireAuthentication);

    // pull in all the controllers (these contain routes)
    fs.readdirSync("controllers").forEach(function(controllerName) {
        require("./controllers/" + controllerName)(app);
    });

    // lock the router to process routes up to this point
    app.use(app.router);

    // static assets processed after routes
    app.use("/assets", express.static(__dirname + "/public"));
});

// configuration for development environment
app.configure("development", function() {
    console.log("in development environment");
    app.use(express.errorHandler());
});

// configuration for production environment (NODE_ENV=production)
app.configure("production", function() {
    console.log("in production environment");
    // configure a generic 500 error message
    app.use(function(err, req, res, next) {
        res.send(500, "An error has occurred");
    });
});

// start the app
app.listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
