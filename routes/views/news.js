var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {
    console.log('news?');
    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'news';


    //Get News Page data
    view.on('init', function (next) {
        keystone.list('NewsPage').model.findOne().where('state','published')
            .populate('metadata mediaContacts')
            .sort('-updatedAt')
            .exec(function (err,result) {
                if(err)
                    return next(err);

                if(result){
                    _.extendOwn(locals.content, result._doc); 
                    
                }
                next();
            });
    });
    
    
    view.on('init',repositories.getNewsArticles(locals));


    // Render the view
    view.render('news');

};

