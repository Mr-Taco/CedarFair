var keystone = require('keystone'),
    _ = require('underscore'),
    repositories = require('../../lib/util/repositories.js');

exports = module.exports = function(req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'groupsales';


    //Get Group Sales Page data
    view.on('init', function (next) {
        keystone.list('GroupsPage').model.findOne().where('state','published')
            .populate('groupsQuotes groupTypes metadata')
            .sort('-updatedAt')
            .exec(function (err,result) {
                
                console.log('groupsales.js   result:  ', result);
                
                if(err)
                    return next(err);
                

                if(result){
                    //We gotta extend the ._doc if we are not using .lean() in the query.
                    _.extendOwn(locals.content, result._doc);
                    repositories.populateTypes(result.groupTypes , null ,function (err, groupTypes) {
                        if(err)
                            return next(err);
                        
                        next();
                    });
                    
                    
                    
                }
                
            });
    });

    //Get Groups Data
    view.on('init', repositories.getGroups(locals));



    // Render the view
    view.render('groupsales');

};
