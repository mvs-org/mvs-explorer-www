module.exports = function(grunt) {
    var package = require('./package.json');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['dist/*', 'min', 'min-safe'],
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: { // if not work add rest of css
                    './min/app.css': [
                        './node_modules/bootstrap/dist/css/bootstrap.min.css',
                        './css/nga.css',
                        './node_modules/angular-toastr/dist/angular-toastr.min.css',
                        './node_modules/nprogress/nprogress.css',
                        './node_modules/nvd3/build/nv.d3.css',
                        './node_modules/angular-swagger-ui/dist/css/swagger-ui.css',
                        './css/font.css',
                        './node_modules/leaflet/dist/leaflet.css',
                        './node_modules/leaflet.markercluster/example/screen.css',
                        './node_modules/leaflet.markercluster/dist/MarkerCluster.css',
                        './node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css',
                        './node_modules/angular-material/angular-material.css',
                        './css/style.css'
                    ]
                }
            }
        },
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: { //"app" target if not work add /js files
                files: {
                    './min-safe/js/flash.service.js': ['./app-services/flash.service.js'],
                    './min-safe/js/metaverse.service.js': ['./app-services/metaverse.service.js'],
                    './min-safe/js/assets.service.js': ['./app-services/assets.service.js'],
                    './min-safe/js/explorer.controller.js': ['./controllers/explorer.controller.js'],
                    './min-safe/js/blocks.controller.js': ['./controllers/blocks.controller.js'],
                    './min-safe/js/startpage.controller.js': ['./controllers/startpage.controller.js'],
                    './min-safe/js/avatars.controller.js': ['./controllers/avatars.controller.js'],
                    './min-safe/js/asset.controller.js': ['./controllers/asset.controller.js'],
                    './min-safe/js/address.controller.js': ['./controllers/address.controller.js'],
                    './min-safe/js/mining.controller.js': ['./controllers/mining.controller.js'],
                    './min-safe/app.js': ['./app.js']
                }
            }
        },
        concat: {
            libs: {
                src: [
                    './node_modules/jquery/dist/jquery.min.js',
                    './node_modules/qrcode/build/qrcode.min.js',
                    './node_modules/d3/d3.min.js',
                    './node_modules/nvd3/build/nv.d3.min.js',
                    './node_modules/nprogress/nprogress.js',
                    './node_modules/leaflet/dist/leaflet.js',
                    './node_modules/leaflet.markercluster/dist/leaflet.markercluster.js',
                    './node_modules/leaflet-ajax/dist/leaflet.ajax.min.js',
                    './node_modules/autobahn-js-built/autobahn.min.js',
                    './js/fontawesome-all.min.js'
                ],
                dest: './min/libs.min.js'
            },
            angular: {
                src: [
                    './node_modules/angular/angular.min.js',
                    './node_modules/angular-ui-router/release/angular-ui-router.min.js',
                    './node_modules/angular-cookies/angular-cookies.min.js',
                    './node_modules/angular-local-storage/dist/angular-local-storage.min.js',
                    './node_modules/angular-animate/angular-animate.min.js',
                    './node_modules/angular-aria/angular-aria.min.js',
                    './node_modules/angular-messages/angular-messages.min.js',
                    './node_modules/angular-material/angular-material.min.js',
                    './node_modules/angular-translate/dist/angular-translate.min.js',
                    './node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
                    './node_modules/angular-utils-pagination/dirPagination.js',
                    './node_modules/angular-wamp/release/angular-wamp.js',
                    'node_modules/angular-nvd3/dist/angular-nvd3.js',
                    'node_modules/angular-sanitize/angular-sanitize.js',
                    'node_modules/angular-swagger-ui/dist/scripts/swagger-ui.js'
                ],
                dest: './min/framework.js'
            },
            app: { //target
                src: [
                    './min-safe/app.js',
                    './min-safe/js/*.js'
                ],
                dest: './min/app.js'
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: {
                    './min/app.js': './min/app.js'
                }
            }
        },
        uglify: {
            js: { //target
                src: ['./min/app.js'],
                dest: './min/app.min.js'
            },
            framework: { //target
                src: ['./min/framework.js'],
                dest: './min/framework.min.js'
            }
        },
        copy: {
            nodemapMarkers:{
                expand: true,
                cwd: './node_modules/leaflet/dist/images/',
                src: '*',
                dest: 'dist/min/images/'
            },
            img: {
                expand: true,
                src: 'img/**',
                dest: 'dist'
            },
            images: {
                expand: true,
                src: 'images/**',
                dest: 'dist'
            },
            views: {
                expand: true,
                src: 'views/**/*.html',
                dest: 'dist'
            },
            lang: {
                expand: true,
                src: 'lang/*.json',
                dest: 'dist'
            },
            js: {
                expand: true,
                src: 'min/*.js',
                dest: 'dist'
            },
            css: {
                expand: true,
                src: 'min/*.css',
                dest: 'dist'
            },
            fonts: {
                expand: true,
                src: 'fonts/**',
                dest: 'dist'
            },
            index: {
                src: 'production_index.html',
                dest: 'dist/index.html'
            }
        },
        revPackage: {
            files: ['dist/*/**/*.{js,css,json}','dist/views/*.html']
        },
        'string-replace': {
            dist: {
                files: {
                    'dist/': ['dist/min/app.min.*.js', 'dist/**/*.css', 'dist/*.html', 'dist/views/*.view.html']
                },
                options: {
                    saveUnchanged: false,
                    replacements: [{
                        pattern: /\.view.html/g,
                        replacement: '.view.' + package.version + '.html'
                    }, {
                        pattern: /(\.css|\.js(?!on)|\.json)/g,
                        replacement: '\.' + package.version + '$1'
                    }, {
                        pattern: '<<<version>>>',
                        replacement: package.version
                    }]
                }
            }
        }
    });

    //load grunt tasks
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-babel');
    grunt.loadNpmTasks('grunt-ng-annotate');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-rev-package');
    grunt.loadNpmTasks('grunt-string-replace');


    //register grunt default task
    grunt.registerTask('default', ['ngAnnotate', 'concat', 'babel', 'uglify', 'cssmin', 'copy', 'revPackage', 'string-replace']);
};
