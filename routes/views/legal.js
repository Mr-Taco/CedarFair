var keystone = require('keystone'),
    _ = require('underscore');



module.exports.legal = function (req, res) {

    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'legal';

    console.log('legal');

    view.on('init', function (next) {
        keystone.list('LegalPage').model.findOne().where('state','published')
            .populate('metadata')
            .sort('-updatedAt')
            .lean()
            .exec(function (err,result) {
                if(err) return next(err);
                if(result){
                    _.extendOwn(locals.content, result);
                }
                next();
            });
    });
    
    view.render('legal')
};


module.exports.privacy = function (req, res) {
    var view = res.view;
    var locals = res.locals;

    // locals.section is used to set the currently selected
    // item in the header navigation.
    locals.section = 'privacy';

    view.on('init', function (next) {
        keystone.list('PrivacyPage').model.findOne().where('state','published')
            .populate('metadata')
            .sort('-updatedAt')
            .lean()
            .exec(function (err,result) {
                if(err) return next(err);
                if(result){
                    _.extendOwn(locals.content, result);
                }
                next();
            });
    });

    view.render('legal')
};
