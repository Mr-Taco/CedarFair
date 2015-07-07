var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'jobs';


    //Get Jobs Page data
    view.on('init', function (next) {
        keystone.list('JobsPage').model.findOne().where('state','published')
            .populate('featuredJobList jobTypes metadata')
            .sort('-updatedAt')
            .exec(function (err,result) {
                if(err)
                    return next(err);

                if(result){
                    //We gotta extend the ._doc if we are not using .lean() in the query.
                    
                    repositories.populateTypes(result.jobTypes , null, function (err, types) {
                        if(err)
                            return next(err);
                        
                        
                        
                        _.extendOwn(locals.content, result._doc);
                       
                        next();
                    });
                }
                
            });
    });

    //Get Featured Jobs Data
    view.on('init', repositories.getJobs(locals));




    // Render the view
    view.render('jobs');

};

