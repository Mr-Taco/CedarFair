// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');


// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({

    'name': 'Cedar Fair',
    'brand': 'Cedar Fair',

    'less': 'public',
    'static': 'public',
    'favicon': 'public/favicon.ico',
    'views': 'templates/views',
    'view engine': 'jade',
    'logger' : 'short',
    'emails': 'templates/emails',
    'mongo' : process.env.MONGO_URI || "mongodb://localhost/cedar-fair"  ,


    'auto update': true,
    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': '2F=~:3wz3w+XVNsqTeF<lMihBhZ5OXn6::<7q)ZeE[[fQt3]QQ]_VU.64F%{Z<7d',
    'wysiwyg additional buttons': 'underline'

});
keystone.set('embedly api key', process.env.EMBEDLY_API_KEY);


//Maps
keystone.set('google api key', process.env.GOOGLE_CLIENT_KEY);
keystone.set('google server api key', process.env.GOOGLE_SERVER_API_KEY);
keystone.set('default region', 'us'); //

//Mandrill
keystone.set('mandrill api key', process.env.MANDRILL_API_KEY || 'no key');
keystone.set('mandrill username', process.env.MANDRILL_USER || 'no user');

//S3
keystone.set('s3 config', { bucket: process.env.AWS_BUCKET || 'cedar-fair', key: process.env.AWS_ACCESS_ID, secret: process.env.AWS_ACCESS_SECRET });

// Load your project's Models




keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
    _: require('underscore'),
    env: keystone.get('env'),
    utils: keystone.utils,
    cfUtils: require('./lib/util/utils'),
    editable: keystone.content.editable,
    cdn_root: require('./package.json').deploy.cdn_root
    
});

// Load your project's Routes

keystone.set('routes', require('./routes'));
keystone.set('emails forms', require('./routes/emails'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.






// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
    Home: [
        'home-pages'
        ,'tickers'
        ,'ticker-lists'
    ]
    ,'Who We Are':'who-we-are-pages'
    ,'Parks':[
        'parks-pages'
        ,'offerings-pages'
        ,'accommodations-pages'
        ,'parks'
        ,'park-lists'
        ,'park-accommodations'
    ]
    ,'Group Sales': [
        'groups-pages'
        ,'groups'
        ,'group-lists'
        ,'group-types'
    ]
    ,'Partnerships':[
        'partnership-pages'
        ,'partnership-detail-pages'
        ,'partnership-types'
    
    ]
    ,'Jobs' :[
        'jobs-pages'
        ,'jobs'
        ,'job-lists'
        ,'job-types'
    ]
    ,'News' : [
        'news-pages'
        ,'news-articles'
        ,'media-contacts'
    ]
    ,'Global' : [
        'texts'
        ,'galleries'
        ,'media'
        ,'socials'
        ,'footers'
        ,'metadata'
    ]
    ,'Legal' : [
        'legal-pages'
        ,'privacy-pages'
    ]
    ,'Email' : [
        'form-settings'
        ,'group-sales-forms'
        ,'partnerships-forms'
        ,'media-request-forms'
        
    ]
    
    ,'Users': 'users'


});

//Use Embedly


// Start Keystone to connect to your database and initialise the web server

keystone.start();
