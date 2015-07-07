/**
 * This file contains the common middleware used by your routes.
 * 
 * Extend or replace these functions as your application requires.
 * 
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

var _ = require('underscore'),
    querystring = require('querystring'),
    keystone = require('keystone'),
    MobileDetect = require('mobile-detect'),
    Footer = keystone.list('Footer'),
    moment = require('moment'),
    auth = require('basic-auth'),
    repositories = require('../lib/util/repositories');



/**
    Initialises the standard view locals

    The included layout depends on the navLinks array to generate
    the navigation in the header, you may wish to change this array
    or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {

    res.locals.debug = process.env.DEBUG_JADE === 'true';
    res.locals.show_errors = process.env.NODE_ENV === 'development';
    res.locals.moment = moment;
    res.locals.randRange = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    res.locals.content = {};

    next();


};

exports.initFooter = function (req,res,next) {

    var q = keystone.list("Footer").model.findOne().where('state','published').sort('-updatedAt');

    q.exec(function (err,result) {
        if (!result) {
            res.locals.footer = new Footer.model({name:"Footer"});
        }else{
            res.locals.footer = result;
        }


        next(err);
    });
};



exports.initSocial = function (req,res,next) {

    var q = keystone.list("Social").model.find().sort('-updatedAt');

    q.exec(function (err,result) {

        res.locals.socialLinks = result || [];

        next(err);
    });
};


/**
    Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = function(req, res, next) {

    var flashMessages = {
        info: req.flash('info'),
        success: req.flash('success'),
        warning: req.flash('warning'),
        error: req.flash('error')
    };

    res.locals.messages = _.any(flashMessages, function(msgs) { return msgs.length; }) ? flashMessages : false;

    next();

};


/**
    Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = function(req, res, next) {

    if (!req.user) {
        req.flash('error', 'Please sign in to access this page.');
        res.redirect('/keystone/signin');
    } else {
        next();
    }

};


/**
 Inits the error handler functions into `req`
 */
exports.initErrorHandlers = function(req, res, next) {

    res.err = function(err, title, message) {
        var view = res.view;
        res.status(500);
        
        view.render('errors/500', {
            err: err,
            errorTitle: title,
            errorMsg: message
        });
        
        
        
    };

    res.notfound = function(title, message) {
        var view = res.view;
        res.status(404);
        view.render('errors/404');
        
    };

    next();

};




exports.initMobileDetect = function (req, res, next) {

    var md = new MobileDetect(req.headers['user-agent']);


    var deviceInfo = "";

    if(md.is('ios'))
        deviceInfo += "ios ";
    if(md.is('androidos'))
        deviceInfo += "android ";
    if(md.tablet())
        deviceInfo += "tablet ";
    if(md.phone())
        deviceInfo += "phone ";




    res.locals.deviceInfo = deviceInfo;
    next();
};



exports.initView = function (req,res,next) {
    var view = new keystone.View(req, res);

    //Get Parks Data
    view.on('init' , repositories.getParks(res.locals));

    
    res.view = view;
    
    next();
    
};


exports.basicAuth = function (req,res,next) {


    var user = auth(req);

    if (user === undefined || user.name !== process.env.USERNAME || user.pass !== process.env.PASSWORD) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="CedarFair"');
        res.end('Unauthorized');
    } else {
        next();
    }
    
    
};
