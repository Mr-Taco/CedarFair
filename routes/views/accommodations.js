var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'accommodations';




   
    view.on('init', function (next) {
        keystone.list('AccommodationsPage').model.findOne().where('state','published')
            .populate('metadata')
            .sort('-updatedAt')
            .exec(function (err,result) {
                if(err)
                    return next(err);
                

                if(result){
                    _.extendOwn(locals.content, result._doc); 
                    next();
                }
                
            });
    });



    //Get Accommodations Parks Data
    view.on('init', repositories.getParks(locals, 'parksAccommodated' , [{accommodations:{$exists:true}},{accommodations:{$ne:[]}}] ));

    


    // Render the view
    view.render('accommodations');

};

