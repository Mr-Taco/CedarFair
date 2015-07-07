/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var _ = require('underscore'),
    keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);


//Auth
if(process.env.USERNAME !== undefined && process.env.PASSWORD !== undefined) {
   
    keystone.pre('routes',middleware.basicAuth);
}

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('routes', middleware.initFooter);
keystone.pre('routes', middleware.initSocial);
keystone.pre('routes', middleware.initMobileDetect);
keystone.pre('routes', middleware.initView);
keystone.pre('render', middleware.flashMessages);
keystone.pre('routes', middleware.initErrorHandlers);



// Handle 404 errors
keystone.set('404', function(req, res, next) {
    res.notfound();
});

// Handle other errors
keystone.set('500', function(err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    res.err(err, title, message);
});

// Import Route Controllers
var routes = {
    views: importRoutes('./views')
    ,services:importRoutes('./services')
};

// Setup Route Bindings
exports = module.exports = function(app) {

    // Views
    app.get('/', routes.views.index);
    app.get('/who-we-are', routes.views.whoweare);
    app.get('/our-parks', routes.views.ourparks);
    app.get('/our-parks/special-events', routes.views.offerings);
    app.get('/our-parks/accommodations', routes.views.accommodations);
    app.get('/jobs', routes.views.jobs);
    app.get('/group-sales', routes.views.groupsales);
    app.get('/partnerships', routes.views.partnership);
    app.get('/partnerships/:detail', routes.views.partnershipDetails);
    app.get('/partnerships/:detail/sponsorship', routes.views.partnershipDetails);
    app.get('/partnerships/:detail/experiential', routes.views.partnershipDetails);
    app.get('/partnerships/:detail/in-park-media', routes.views.partnershipDetails);
    app.get('/news', routes.views.news);
    app.get('/news/article/:id', routes.views.news);
    app.get('/whoweare', routes.views.whoweare);
    app.get('/legal', routes.views.legal.legal);
    app.get('/privacy', routes.views.legal.privacy);
    
    app.post('/partnerships/mail', routes.services.partnershipsForm);
    app.post('/news/mail', routes.services.mediaForm);
    app.post('/group-sales/mail', routes.services.groupSalesForm);
  



    // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
    // app.get('/protected', middleware.requireUser, routes.views.protected);

};
