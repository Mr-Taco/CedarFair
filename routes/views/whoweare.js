var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'whoweare';


    view.on('init', function (next) {
        keystone.list('WhoWeArePage').model
            .findOne()
            .where('state','published')
            .populate('slogans metadata video')
            .sort('-updatedAt')
            .lean()
            .exec(function (err,result) {
                if(err)
                    return next(err);
                
             
                if(result){
                    _.extendOwn(locals.content, result); 
                    next();
                }
                
            });
    });




    // Render the view

    view.render('whoweare');

};

