var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'ourparks';


    //Get Parks Page data
    view.on('init', function (next) {
        keystone.list('ParksPage').model.findOne().where('state','published')
            .lean()
            .populate('metadata')
            .sort('-updatedAt')
            .exec(function (err,result) {
    
                if(result){
                    _.extendOwn(locals.content, result);
                }
                next(err);
            });
    });




    // Render the view
    view.render('ourparks');

};
