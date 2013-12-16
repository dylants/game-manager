var passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    mongoose = require("mongoose"),
    User = mongoose.model("User");

// Creates the data necessary to store in the session cookie
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Reads the session cookie to determine the user from a user ID
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// The strategy used when authenticating a user
passport.use(new LocalStrategy(function(username, password, done) {
    // find the user based off the username (case insensitive)
    User.findOne({
        username: new RegExp(username, "i")
    }, function(err, user) {
        // if any problems, error out
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {
                message: "Unknown user: " + username
            });
        }

        // no password verification, so if we've gotten here, we're good!
        return done(null, user);
    });
}));
