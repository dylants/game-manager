"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            files: [
                "**/*.js"
            ],
            options: {
                ignores: [
                    "node_modules/**",
                    "public/css/**",
                    "public/js/lib/**"
                ],
                jshintrc: true
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: "main",
                    baseUrl: "public/js",
                    include: "lib/almond",
                    mainConfigFile: "public/js/main.js",
                    out: "public/js/game-manager-min.js"
                }
            }
        },
        cssmin: {
            add_banner: {
                options: {
                    banner: "/* game-manager minified CSS */"
                },
                files: {
                    "public/css/style.min.css": ["public/css/**/*.css"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-requirejs");
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask("default", ["clean", "jshint", "requirejs", "cssmin"]);

    grunt.registerTask("clean", function() {
        grunt.file.delete("public/js/game-manager-min.js");
        grunt.file.delete("public/css/style.min.css");
    });
};
