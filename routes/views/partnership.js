var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'partnership';

    var galleries = {
        sponsorships:[]
    };


    view.on('init', function (next) {
        keystone.list('PartnershipPage').model.findOne().where('state','published')
            .populate('satGallery numbers sponsorshipTypes metadata')
            .lean()
            .sort('-updatedAt')
            .exec(function (err,result) {

                if(result){
                    _.extendOwn(locals.content, result);
                    galleries.sponsorships = (locals.content.satGallery) ? locals.content.satGallery.media : [];
                }
                next(err);
            });
    });

    view.on('init' , repositories.getGalleries(locals, galleries));


    // Render the view
    view.render('partnership');

};
