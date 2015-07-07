var keystone = require('keystone'),
    _ = require('underscore'),
    async = require('async'),
    repositories = require('../../lib/util/repositories.js');




var populateAccommodationsMedia = function (accommodation) {    
    
    return function (done) {        
        if(accommodation !== undefined && accommodation !== null){
            if(accommodation.length > 0) {
                repositories.populateTypes(accommodation, null, function (err, result) {
                    if(err) return done(err);
                    done();

                });
            }else{
                done();
            }
        }else{
            done();
        }
    };
};



exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;
    var galleries = {
        applicants: []
        ,partners: []
    };


    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'home';



    //Get Home data
    view.on('init', function (next) {
        keystone.list('HomePage').model.findOne().where('state','published')
        .populate('applicantsGallery partnersGallery groupQuotes tickerList accommodatedParks videos metadata featuredJobList')
        .sort('-updatedAt')
        .exec(function (err,result) {
            if(err) return next(err);
            if(result){
                
                repositories.populateTypes(result.accommodatedParks, 'video accommodations' , function (err,parks) {
                    if(err) return next(err);
                    
                    var tasks = [];
                    for(var i = 0; i < result.accommodatedParks.length; i++){
                        var park = result.accommodatedParks[i];
                        
                        tasks.push(populateAccommodationsMedia(park.accommodations));                       
                        
                    }
                    
                    async.parallel(tasks , function (errors) {
                        _.extendOwn(locals.content, result._doc);
   
                        galleries.applicants = (locals.content.applicantsGallery) ? locals.content.applicantsGallery.media : [];
                        next();
                    });
                });
                
                
            }
    
        });
    });



    //Get Ticker Data
    view.on('init', repositories.getTickers(locals));

    //Get Jobs Data
    view.on('init', repositories.getJobs(locals));

    //Get Galleries
    view.on('init', repositories.getGalleries(locals,galleries));



    // Render the view
    view.render('index');

};





