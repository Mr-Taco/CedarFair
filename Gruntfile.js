'use strict()';

var config= {
    port: 3000
};

module.exports = function(grunt) {

    // Load grunt tasks automatically
    //require('load-grunt-tasks')(grunt);


    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),



        stylus: {
            devHome: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/home.css': 'src/stylus/home/index.styl'
                }
            },
            devGroup: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/group-sales.css': 'src/stylus/group-sales/index.styl'
                }
            },
            devParks: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/our-parks.css': 'src/stylus/our-parks/index.styl'
                }
            },
            devOfferings: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/offerings.css': 'src/stylus/offerings/index.styl'
                }
            },
            devAccommodations: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/accommodations.css': 'src/stylus/accommodations/index.styl'
                }
            },
            devJobs: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/jobs.css': 'src/stylus/jobs/index.styl'
                }
            },
            devPartnerships:{
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/partnership.css': 'src/stylus/partnership/index.styl'
                }
            },
            devPartnershipDetails:{
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/partnership-details.css': 'src/stylus/partnership-details/index.styl'
                }
            },
            devNews:{
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/news.css': 'src/stylus/news/index.styl'
                }
            },
            devWho:{
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files:{
                    'public/styles/whoweare.css': 'src/stylus/whoweare/index.styl'
                }
            },
            
            dev: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:false,
                    linenos:true
                },
                files: {
                    'public/styles/error.css': 'src/stylus/error/index.styl',
                    'public/styles/home.css': 'src/stylus/home/index.styl',
                    'public/styles/group-sales.css': 'src/stylus/group-sales/index.styl',
                    'public/styles/our-parks.css': 'src/stylus/our-parks/index.styl',
                    'public/styles/offerings.css': 'src/stylus/offerings/index.styl',
                    'public/styles/accommodations.css': 'src/stylus/accommodations/index.styl',
                    'public/styles/jobs.css': 'src/stylus/jobs/index.styl',
                    'public/styles/partnership.css': 'src/stylus/partnership/index.styl',
                    'public/styles/partnership-details.css': 'src/stylus/partnership-details/index.styl',
                    'public/styles/news.css': 'src/stylus/news/index.styl',
                    'public/styles/whoweare.css': 'src/stylus/whoweare/index.styl',
                    'public/styles/legal.css': 'src/stylus/legal/index.styl'

                }
            },
            dist: {
                options: {
                    paths: ['src/stylus'],
                    define: {"cdn_root" : "<%= pkg.deploy.cdn_root %>"},
                    compress:true

                },
                files: {
                    'public/styles/error.css': 'src/stylus/error/index.styl',
                    'public/styles/home.css': 'src/stylus/home/index.styl',
                    'public/styles/group-sales.css': 'src/stylus/group-sales/index.styl',
                    'public/styles/our-parks.css': 'src/stylus/our-parks/index.styl',
                    'public/styles/offerings.css': 'src/stylus/offerings/index.styl',
                    'public/styles/accommodations.css': 'src/stylus/accommodations/index.styl',
                    'public/styles/jobs.css': 'src/stylus/jobs/index.styl',
                    'public/styles/partnership.css': 'src/stylus/partnership/index.styl',
                    'public/styles/partnership-details.css': 'src/stylus/partnership-details/index.styl',
                    'public/styles/news.css': 'src/stylus/news/index.styl',
                    'public/styles/whoweare.css': 'src/stylus/whoweare/index.styl',
                    'public/styles/legal.css': 'src/stylus/legal/index.styl'

                }
            }
        },




        jshint: {
            options: {
                laxcomma:true,
                reporter: require('jshint-stylish'),
                force: true
            },
            all: [ 'routes/**/*.js'
                ,'models/**/*.js'
                ,'lib/**/*.js'
            ],
            server: [
                './keystone.js'
            ]
        },



        browserify: {
            
            
            dev: {
                files: {
                    "public/js/home.js" : ["src/app/home.coffee"],
                    "public/js/groupsales.js" : ["src/app/groupsales.coffee"],
                    "public/js/ourparks.js" : ["src/app/ourparks.coffee"],
                    "public/js/offerings.js" : ["src/app/offerings.coffee"],
                    "public/js/accommodations.js" : ["src/app/accommodations.coffee"],
                    "public/js/jobs.js" : ["src/app/jobs.coffee"],
                    "public/js/partnership.js" : ["src/app/partnership.coffee"],
                    "public/js/partnership-details.js" : ["src/app/partnership-details.coffee"],
                    "public/js/news.js" : ["src/app/news.coffee"],
                    "public/js/whoweare.js" : ["src/app/whoweare.coffee"],
                    "public/js/legal.js" : ["src/app/legal.coffee"]
                },
                options: {
                    browserifyOptions : {
                        debug : true
                    }
                }
            },
            dist: {
                files: {
                    "public/js/home.js" : ["src/app/home.coffee"],
                    "public/js/groupsales.js" : ["src/app/groupsales.coffee"],
                    "public/js/ourparks.js" : ["src/app/ourparks.coffee"],
                    "public/js/offerings.js" : ["src/app/offerings.coffee"],
                    "public/js/accommodations.js" : ["src/app/accommodations.coffee"],
                    "public/js/jobs.js" : ["src/app/jobs.coffee"],
                    "public/js/partnership.js" : ["src/app/partnership.coffee"],
                    "public/js/partnership-details.js" : ["src/app/partnership-details.coffee"],
                    "public/js/news.js" : ["src/app/news.coffee"],
                    "public/js/whoweare.js" : ["src/app/whoweare.coffee"],
                    "public/js/legal.js" : ["src/app/legal.coffee"]
                },
                options: {
                    browserifyOptions : {
                        debug : false
                    }
                }
            },
            options: {
                transform: ["coffeeify"]
            }
        },




        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ''
            },

            dev: {
                // the files to concatenate
                files: {
                    'public/js/vendors.js' : [
                        'src/vendor/js/jquery.js',
                        'src/vendor/js/underscore.js',
                        'src/vendor/js/**/*.js'
                    ],
                    'public/styles/vendors.css' : [
                        'src/vendor/css/font-awesome.css',
                        'src/vendor/css/**/*.css'
                    ]
                }
            },
            dist: {
                // the files to concatenate
                files: {
                    'public/js/vendors.js' : [
                        'src/vendor/js/jquery.js',
                        'src/vendor/js/underscore.js',
                        'src/vendor/js/**/*.js'
                    ],
                    'public/styles/vendors.css' : [
                        'src/vendor/css/font-awesome.css',
                        'src/vendor/css/**/*.css'
                    ]
                }
            }
        },


        copy: {
            dev: {
                files: [
                    {
                        expand:true,
                        cwd: "src/fonts/",
                        src: ["**"],
                        dest: "public/fonts/",
                        filter: 'isFile'
                    }

                ]
            }
        },
        
        uglify: {
            options: {
                // the banner is inserted at the top of the output
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'public/js/vendors.js': ['public/js/vendors.js']
                  
                }
            }
            
        },




        bower: {
            dev: {
                dest: 'src/vendor',
                js_dest: 'src/vendor/js',
                css_dest: 'src/vendor/css',
                eot_dest: 'src/fonts',
                ttf_dest: 'src/fonts',
                svg_dest: 'src/fonts',
                woff_dest: 'src/fonts',
                otf_dest: 'src/fonts',
                less_dest: 'src/vendor/less',
                map_dest:'src/vendors/css'

            }
        },


        watch: {
            grunt: {
                files: [
                    'Gruntfile.js'
                ],
                tasks: ['default']
            },
            js: {
                files: [
                    'model/**/*.js',
                    'routes/**/*.js'
                ],
                tasks: ['hint']
            },    
            css: {
                files: [
                    'src/stylus/**/*.styl'
                ],
                tasks: ['styles-dev']
            },
            /*cssHome: {
                files: [
                    'src/stylus/home/!**!/!*.styl'
                ],
                tasks: ['stylus:devHome']
            },
            cssGroup: {
                files: [
                    'src/stylus/group-sales/!**!/!*.styl'
                ],
                tasks: ['stylus:devGroup']
            },
            cssParks: {
                files: [
                    'src/stylus/our-parks/!**!/!*.styl'
                ],
                tasks: ['stylus:devParks']
            },
            cssOfferings: {
                files: [
                    'src/stylus/offerings/!**!/!*.styl'
                ],
                tasks: ['stylus:devOfferings']
            },
            cssAccommodations: {
                files: [
                    'src/stylus/accommodations/!**!/!*.styl'
                ],
                tasks: ['stylus:devAccommodations']
            },
            cssJobs: {
                files: [
                    'src/stylus/jobs/!**!/!*.styl'
                ],
                tasks: ['stylus:devJobs']
            },
            cssPartnership: {
                files: [
                    'src/stylus/partnership/!**!/!*.styl'
                ],
                tasks: ['stylus:devPartnerships']
            },
            cssPartnershipDetails: {
                files: [
                    'src/stylus/partnership-details/!**!/!*.styl'
                ],
                tasks: ['stylus:devPartnershipDetails']
            },
            cssNews: {
                files: [
                    'src/stylus/news/!**!/!*.styl'
                ],
                tasks: ['stylus:devNews']
            },
            cssWho: {
                files: [
                    'src/stylus/whoweare/!**!/!*.styl'
                ],
                tasks: ['stylus:devWho']
            },*/
            browserify: {
                files: [
                    'src/app/**/*.coffee' 
                ],
                tasks: ['frontend-dev']
            },
            vendors: {
                files: [
                    'src/vendor/**/*.{js,css}'
                ],
                tasks: ['concatfiles-dev']
            }
        }
    });

    
    
    
    
    
    
    
    
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('concatfiles-dev' , [], function () {
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.task.run('concat:dev');
    });

    grunt.registerTask('concatfiles-dist' , [], function () {
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.task.run('concat:dist');
    });
    grunt.registerTask('copyfiles' , [], function () {
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.task.run('copy');
    });

    grunt.registerTask('vendor' , [], function () {
        grunt.loadNpmTasks('grunt-bower');
        grunt.task.run('bower');
    });
    
    grunt.registerTask('frontend-dev' , [], function () {
        grunt.loadNpmTasks('grunt-browserify');
        grunt.task.run('browserify:dev');
    });

    grunt.registerTask('frontend-dist' , [], function () {
        grunt.loadNpmTasks('grunt-browserify');
        grunt.task.run('browserify:dist' , 'compress');
        
    });
    
    grunt.registerTask('styles-dev' , [], function () {
        grunt.loadNpmTasks('grunt-contrib-stylus');
        grunt.task.run('stylus:dev');
    });

    grunt.registerTask('styles-dist' , [], function () {
        grunt.loadNpmTasks('grunt-contrib-stylus');
        grunt.task.run('stylus:dist');
    });
    
    grunt.registerTask('compress', [] , function () {
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.task.run('uglify:dist');
    });
    
    grunt.registerTask('hint' , [], function() {
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.task.run('jshint')
    });
    


    grunt.registerTask('default', [ 'styles-dev', 'hint', 'frontend-dev', 'concatfiles-dev' ,'copyfiles', 'watch']);
    grunt.registerTask('dist', [ 'styles-dist', 'hint', 'frontend-dist', 'concatfiles-dist' , 'compress','copyfiles']);




};
