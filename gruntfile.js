module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'mochaTest']);

    // Print a timestamp (useful for when watching)
    grunt.registerTask('timestamp', function() {
        grunt.log.subhead(Date());
    });

    grunt.initConfig({
        jshint: {
            files: ['./lib/*.js', './test/unit/*.js', './test/docscripts/*.js', 'gruntfile.js', 'package.json', 'index.js'],
            options: {
                browser: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: false,
                boss: true,
                eqnull: true,
                node: true,
                expr: true,
                globals: {
                    'xit': true,
                    'xdescribe': true,
                    'it': true,
                    'describe': true,
                    'before': true,
                    'after': true,
                    'done': true
                }
            }
        },
        watch: {
            all: {
                files: ['./lib/*.js', './test/*.js', 'gruntfile.js'],
                tasks: ['default']
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    timeout: '5000'
                },
                src: ['test/*.js']
            }
        }
    });
};
