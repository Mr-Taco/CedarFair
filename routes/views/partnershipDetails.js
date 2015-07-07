var keystone = require('keystone'),
    _ = require('underscore'),
    async = require('async'),
    repositories = require('../../lib/util/repositories.js');





exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;
    var url = req.url;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'partnership-details';
    locals.url = url;

    view.on('init', function (next) {
        keystone.list('PartnershipDetailPage').model.findOne().where('state','published')
            .populate('sponsorshipTypes metadata')
            .sort('-updatedAt')
            .exec(function (err,result) {
                if(err)
                    return next(err);


                if(result){
                    
                    repositories.populateTypes(result.sponsorshipTypes, null ,function (err,data) {
                        if(err) return next(err);
                        
                        
                        
                        _.extendOwn(locals.content, result._doc);
                 
                        next();
                    });
                }else{
                    next("No Partnership Detail Pages. Maybe you should make one in the CMS");
                }
               
            });
    });
    

    // Render the view
    view.render('partnership-details');

};
