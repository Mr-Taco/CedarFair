var keystone = require('keystone'),
    _ = require('underscore'),    
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'offerings';




    //Get Jobs Page data
    view.on('init', function (next) {
        keystone.list('OfferingsPage').model.findOne().where('state','published')
            .populate('media metadata')
            .sort('-updatedAt')
            .lean()
            .exec(function (err,result) {
                if(err)
                    return next(err);                
             
                if(result){
                    _.extendOwn(locals.content, result); 
                }
                
                next();
                
                
            });
    });


  


    // Render the view
    view.render('offerings');

};

