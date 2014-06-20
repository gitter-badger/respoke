"use strict";

module.exports = function(grunt) {
    var respokeFiles = [
        'util/socket.io.js',
        'util/q.js',
        'util/loglevel.js',
        'util/adapter.js',
        'respoke.js',
        'respoke/event.js',
        'respoke/client.js',
        'respoke/endpoints.js',
        'respoke/signalingChannel.js',
        'respoke/call.js',
        'respoke/directConnection.js',
        'respoke/peerConnection.js',
        'respoke/localMedia.js'
    ];

    var respokeMediaStatsFiles = [
        'respoke/mediaStats.js'
    ];

    grunt.initConfig({
        env: {
            test: {
                NODE_ENV: 'test',
                CLEAR_DB: 'true'
            }
        },
        uglify: {
            respoke: {
                options: {
                    compress: true,
                    sourceMap: true,
                    sourceMapIncludeSources: true
                },
                files: {
                    'respoke.min.js': respokeFiles
                }
            },
            'respoke-stats': {
                options: {
                    compress: true,
                    sourceMap: true,
                    sourceMapIncludeSources: true
                },
                files: {
                    'respoke-stats.min.js': respokeMediaStatsFiles
                }
            },
            'respoke-beautify': {
                options: {
                    compress: false,
                    sourceMap: false,
                    beautify: true,
                    mangle: false
                },
                files: {
                    'respoke.combine.js': respokeFiles
                }
            },
            'respoke-beautify-stats': {
                options: {
                    compress: false,
                    sourceMap: false,
                    beautify: true,
                    mangle: false
                },
                files: {
                    'respoke-stats.combine.js': respokeMediaStatsFiles
                }
            }
        },
        aws_s3: {
            options: {
                uploadConcurrency: 5,
                downloadConcurrency: 5
            },
            assets: {
                options: {
                    bucket: 'stratos-assets',
                    differential: true
                },
                files: [
                    {expand: true, cwd: '.', src: ['respoke*.min.js'], action: 'upload'},
                    {expand: true, cwd: '.', src: ['*.map'], action: 'upload'}
                ]
            }
        },

        pkg: grunt.file.readJSON('package.json'),

        stratos: {
            //startServer: false,
            //nodeServer: '../app.js',
            //nodeServerPort: 8081,
            liftSails: true,
            sailsDir: '../../../collective/',
            sailsPort: 2001
        },
        mochaTest: {
            unit: {
                options: {
                    reporter: 'mocha-bamboo-reporter'
                },
                src: [
                    './spec/functional/*.spec.js',
                ]
            }
        },
        karma: {
            options: {
                configFile: './karma-lib-orig.conf.js'
            },
            continuous: {
                configFile: './karma-lib-orig.conf.js',
                singleRun: true,
                reporters: ['junit']
            },
            devOrig: {
                singleRun: true,
                configFile: './karma-lib-orig.conf.js'
            },
            devMin: {
                singleRun: true,
                configFile: './karma-lib-min.conf.js'
            },
            functional: {
                singleRun: false,
                configFile: './karma-lib-functional.conf.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-stratos');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-env');

    grunt.task.registerTask('s3', ['aws_s3']);
    grunt.task.registerTask('dist', [
        'uglify:respoke',
        'uglify:respoke-stats'
    ]);
    grunt.task.registerTask('combine', [
        'uglify:respoke-beautify',
        'uglify:respoke-beautify-stats'
    ]);

    grunt.registerTask('default', 'karma:devOrig');
    grunt.registerTask('unit', 'Run unit specs', [
        'dist',
        'karma:devOrig',
        'karma:devMin'
    ]);

    grunt.registerTask('functional', 'Run client-side functional tests', [
        'env:test',
        'liftSails',
        'karma:functional',
        'lowerSails'
    ]);

    grunt.registerTask('ci', 'Run all tests', [
        'unit',
        'functional'
    ]);
};
