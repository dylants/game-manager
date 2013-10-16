require("express-namespace");
var express = require("express"),
    fs = require("fs"),
    cons = require("consolidate"),
    app = express(),
    mongoose = require("mongoose");

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
