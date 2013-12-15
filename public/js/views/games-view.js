/* global define:true */
define([
    "backbone",
    "underscore",
    "jquery",
    "schedule-collection",
    "game-view",
    "game-model",
    "text!/assets/templates/games.html"
], function(Backbone, _, $, ScheduleCollection, GameView, GameModel, gamesHtml) {
    "use strict";

    return Backbone.View.extend({

        el: "#main",

        template: _.template(gamesHtml),

        events: {
            "click #archived-games-header": "toggleArchivedGames"
        },

        initialize: function(args) {
            Backbone.on("game-marked-as-watched", this.markedGameAsWatched, this);
            Backbone.on("game-notes", this.setNoteForGame, this);

            // used to determine if all games have been loaded
            this.teamGamesLoaded = 0;
            this.gamesLoaded = [];
            this.totalTeams = 0;
        },

        close: function() {
            // release all event listeners
            this.stopListening();
            this.$el.off("click");
        },

        render: function() {
            var that;

            this.$el.html(this.template());

            that = this;
            // First, load the model. Then when done, call loadGames
            $.when(
                this.model.fetch()
            ).done(
                function() {
                    that.loadGames();
                }
            );

            return this;
        },

        loadGames: function() {
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                teams, i;

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            // clear the existing games
            archivedGamesSelector.empty();
            availableGamesSelector.empty();
            futureGamesSelector.empty();

            // reset the team games loaded
            this.teamGamesLoaded = 0;
            this.gamesLoaded = [];
            this.totalTeams = this.model.get("teams").length;

            // for each team in our user, load the team games
            teams = this.model.get("teams");
            for (i = 0; i < teams.length; i++) {
                this.loadTeamGames(teams[i].sport, teams[i].team);
            }
        },

        loadTeamGames: function(sport, team) {
            var options, games, sportsWatched, that;

            options = {};
            options.sport = sport;
            options.team = team;
            games = new ScheduleCollection([], options);
            sportsWatched = this.model.get("sportsWatched");

            that = this;
            // load the games for a team, and when done, call doneLoadedGames
            $.when(
                games.fetch()
            ).done(
                function() {
                    that.doneLoadedGames(games);
                }
            );
        },

        doneLoadedGames: function(loadedGames) {
            // we've loaded another team's games
            this.teamGamesLoaded++;

            // add these games to our existing games loaded
            this.gamesLoaded = this.gamesLoaded.concat(loadedGames.models);

            // if there's no more games to load, render the games
            if (this.teamGamesLoaded >= this.totalTeams) {
                this.renderGames();
            }
        },

        renderGames: function() {
            var archivedGamesSelector, availableGamesSelector, futureGamesSelector,
                currentTime, i, game, gameView, gameJSON, watchedGame, gameState;

            // first sort all games loaded
            this.gamesLoaded.sort(function(a, b) {
                var gameA, gameB;

                gameA = a.toJSON();
                gameB = b.toJSON();

                // sort them by the game time UTC
                if (gameA.gameTimeUTC > gameB.gameTimeUTC) {
                    return 1;
                } else if (gameB.gameTimeUTC > gameA.gameTimeUTC) {
                    return -1;
                } else {
                    return 0;
                }
            });

            currentTime = new Date();
            currentTime = currentTime.valueOf();

            archivedGamesSelector = $("#archived-games");
            availableGamesSelector = $("#available-games");
            futureGamesSelector = $("#future-games");

            // for each game that we've loaded
            for (i=0; i<this.gamesLoaded.length; i++) {
                game = this.gamesLoaded[i];

                gameJSON = game.toJSON();
                // check to see if the user has seen this game already
                watchedGame = this.findWatchedGame(gameJSON);
                if (watchedGame && watchedGame.completed) {
                    gameState = "archived";
                } else {
                    // if we haven't, is it available to watch?
                    if (currentTime > gameJSON.availableGameTimeUTC) {
                        gameState = "available";
                    } else {
                        gameState = "future";
                    }
                }

                // create a game view with the information we've collected so far
                gameView = new GameView({
                    model: game,
                    gameState: gameState,
                    notes: watchedGame ? watchedGame.notes : ""
                });

                // based on the game state, put the game in the correct section
                switch (gameState) {
                    case "archived":
                        archivedGamesSelector.append(gameView.render().el);
                        break;
                    case "available":
                        availableGamesSelector.append(gameView.render().el);
                        break;
                    case "future":
                        futureGamesSelector.append(gameView.render().el);
                        break;
                    default:
                        console.error("unknown gameState: " + gameState);
                }
            }
        },

        getGamesWatched: function(sport) {
            var gamesWatched, sportsWatched, i;

            // get the sports watched for this user
            sportsWatched = this.model.get("sportsWatched");
            if (sportsWatched && sportsWatched.length > 0) {
                // for each sport watched
                for (i = 0; i < sportsWatched.length; i++) {
                    // try and find the sport we're looking for
                    if (sportsWatched[i].sport === sport) {
                        // if found, get the games watched
                        gamesWatched = sportsWatched[i].games;
                        break;
                    }
                }
            }

            // if there are no games watched for this sport, create an
            // empty array of gamesWatched and use that
            if (!gamesWatched) {
                sportsWatched.push({
                    sport: sport,
                    games: []
                });
                gamesWatched = sportsWatched[sportsWatched.length - 1].games;
            }

            return gamesWatched;
        },

        findWatchedGame: function(game) {
            var gamesWatched, i;

            gamesWatched = this.getGamesWatched(game.sport);
            // look in all the games watched and see if our game exists
            for (i = 0; i < gamesWatched.length; i++) {
                if (gamesWatched[i].game === game._id) {
                    return gamesWatched[i];
                }
            }
            return null;
        },

        setNoteForGame: function(game, note) {
            var gamesWatched, watchedGame;

            gamesWatched = this.getGamesWatched(game.sport);

            // add or edit?
            watchedGame = this.findWatchedGame(game);
            if (watchedGame) {
                // edit the existing game
                watchedGame.notes = note;
                this.model.save();
            } else {
                // add the game
                gamesWatched.push({
                    game: game._id,
                    notes: note,
                    completed: false
                });
                this.model.save();
            }
        },

        markedGameAsWatched: function(game) {
            var gamesWatched, watchedGame;

            gamesWatched = this.getGamesWatched(game.sport);

            // add or edit?
            watchedGame = this.findWatchedGame(game);
            if (watchedGame) {
                // edit the existing game
                watchedGame.completed = true;
                this.model.save();
            } else {
                // add the game
                gamesWatched.push({
                    game: game._id,
                    notes: null,
                    completed: true
                });
                this.model.save();
            }
        },

        toggleArchivedGames: function(ev) {
            ev.preventDefault();

            $("#archived-games").toggle();
        }
    });

});
