"use strict";

var passport = require("passport"),
    bcrypt = require("bcrypt"),
    mongoose = require("mongoose"),
    Schema = mongoose.Schema,
    Game = require("./game");

var SALT_ROUNDS = 15;

// Hide the password by default
var UserSchema = new Schema({
    username: String,
    password: {
        type: String,
        select: false
    },
    teams: [{
        sport: String,
        team: String
    }],
    sportsWatched: [{
        sport: String,
        games: [{
            game: {
                type: Schema.ObjectId,
                ref: "Game"
            },
            notes: String,
            completed: Boolean
        }]
    }]
});

// never save the password in plaintext, always a hash of it
UserSchema.pre("save", function(next) {
    var user = this;

    if (!user.isModified("password")) {
        return next();
    }

    // use bcrypt to generate a salt
    bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
        if (err) {
            return next(err);
        }

        // using the generated salt, use bcrypt to generate a hash of the password
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) {
                return next(err);
            }

            // store the password hash as the password
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.isPasswordValid = function(rawPassword, callback) {
    bcrypt.compare(rawPassword, this.password, function(err, same) {
        if (err) {
            callback(err);
        }
        callback(null, same);
    });
};

mongoose.model("User", UserSchema);
