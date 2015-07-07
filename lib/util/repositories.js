/**
 * Created by wildlife009 on 9/17/14.
 */
var keystone = require('keystone'),
    _ = require('underscore'),
    moment = require('moment'),
    async = require('async'),
    utils = require('./utils.js');




var populateTypes = module.exports.populateTypes = function (types,  relationships, next) {
    
    relationships = relationships || "video media";
    var typesLen = types.length;
    var populatedData = [];
    var onPopulationComplete = function (err, pResult) {
        if(err)
            return next(err);


        populatedData.push(pResult);

        if(populatedData.length === typesLen)
            next(null, populatedData);
    };


    for(var i = 0; i < typesLen; i++) {
        var gType = types[i];

        if(gType.populate === undefined) 
            return next("Improper Model Type. .populate() method not found. Are you using lean() in your query?");
        
        gType.populate(relationships,onPopulationComplete);

    }



};





/**
 * 
* @locals
* @listName {string} name of list object (default: parksList)
* @conditions {array} conditions to pass (  [['state','published']] or  [{$exists: 'someField '}] )
* 
* */


module.exports.getParks = function (locals , listName, conditions) {
    listName = listName || 'parks';
    conditions = conditions || [] ;
    
    
    var parallelTask = function (park) {        
        return function (done) {
            populateTypes(park.accommodations , null, function (err, accommodationsPopulated) {
                if(err)
                    return done(err);
                if(accommodationsPopulated) {
                    park.accommodations = accommodationsPopulated;
                }
                done();
            });
        };        
    };

    return function (next) {
        if(locals) {
            if(locals.content===undefined) locals.content = {};

            var q = keystone.list("Park").model.find().where('state', 'published');

            for(var i in conditions) {
                var cn = conditions[i];

                if(_.isArray(cn))
                    q.where(cn[0],cn[1]);

                if(_.isObject(cn))
                    q.where(cn);
            }

            q.populate('video accommodations')
                .sort('sortOrder')
                .exec(function(err, results){
                    if(err)
                        return next(err);
                    if(results){                        
                        var calls = [];
                        
                        
                        for(var i = 0; i < results.length; i++) {
                            var park = results[i];        
                            if(park.accommodations !== undefined && park.accommodations !== null)
                                if(park.accommodations.length > 0)
                                    calls.push(parallelTask(park));                            
                        }                        
                        
                        
                        async.parallel(calls,function (){
                            locals.content[listName] = results;
                            next();
                        });
                    }else{
                        return next("No Parks List Data");
                    }
                });
        }else{
            next("No locals object!");
        }

    };
};

module.exports.getMainParksList = function (locals , listName, conditions) {
    
    listName = listName || 'parksList';
    conditions = conditions || [] ;
    
    
    
    return function (next) {
        if(locals) {
            if(locals.content===undefined) locals.content = {};
            
            var q = keystone.list("ParkList").model.findOne().where('state', 'published');
                
            for(var i in conditions) {
                var cn = conditions[i];      
                
                if(_.isArray(cn))
                    q.where(cn[0],cn[1]);      
                
                if(_.isObject(cn))
                    q.where(cn);
            }
                
            
            q.populate('parks')
                .lean()
                .exec(function(err, result){
                    if(err)
                        return next(err);
                    if(result){
                        locals.content[listName] = {
                            parks:result.parks
                        };
    
                        next();
    
                    }else{
                        return next("No Parks List Data");
                    }

            });



        }else{
            next("No locals object!");
        }
        
    };
};


module.exports.getNewsArticles = function (locals) {
    
    
    
    return function (next) {
        if(locals) {
            if(locals.content===undefined) locals.content = {};

            keystone.list("NewsArticle").model
                .find()
                .where('state', 'published')
                .sort('-date')
                .lean()
                .exec(function(err, results){
                    if(err)
                        return next(err);
                    if(results){
                        var newsArticles = {};
                        for(var i = 0; i < results.length; i++) {
                            
                            
                            var article = results[i];                            
                            var year = parseInt(moment(article.date).year());
                            if(!newsArticles[year])
                                newsArticles[year] = [];
                            newsArticles[year].push(article);
                        }
                
                        locals.content.articles = newsArticles;
         
                        

                        next();

                    }else{
                        return next("No Parks List Data");
                    }

                });



        }else{
            next("No locals object!");
        }
    };
};


module.exports.populateParks = function (locals, listName) {

    listName = listName || 'parksList';

    return function (next) {
        if(locals.content.parksList) {
            keystone.list("Park").model
                .find({'_id': {$in : locals.content[listName].parks} })
                .populate('video accommodations')
                .lean()
                .exec(function (err,result){
                    locals.content.parks = result || [];
                    next(err);
                });
        }else{
            locals.content.parks = [];
            next();
        }
    };
};


module.exports.getTickers = function (locals) {

    return function (next) {
        if(locals.content.tickerList) {
            keystone.list("Ticker").model
                .find({'_id': {$in: locals.content.tickerList.tickers} })
                .lean()
                .exec(function (err, result) {
                    locals.content.tickers = result || [];
                    next(err);
                });
        }else{
            locals.content.tickers = [];
            next();
        }
    };
};

module.exports.getJobs = function (locals) {


    return function (next) {
        if(locals.content.featuredJobList) {
            keystone.list("Job").model                
                .find({'_id': {$in: locals.content.featuredJobList.jobs} })
                .populate('jobType')
                .lean()
                .exec(function (err, result) {
                    locals.content.jobs = result || [];
                    next(err);
                });
        }else{
            locals.content.jobs = [];
            next();
        }
    };
};


module.exports.getGroups = function (locals) {
    return function (next) {
        if(locals.content.groupsList) {
            keystone.list("Group").model
                .find({'_id': {$in: locals.content.groupsList.groups} })
                .lean()
                .exec(function (err, result) {
                    locals.content.groups = result || [];
                    next(err);
                });
        }else{
            locals.content.groups = [];
            next();
        }
    };

};


module.exports.getGalleries = function (locals, lists) {

    return function (next) {

        var allMedia = [];

        for(var l in lists) {
            var list = lists[l];
            locals.content[l] = [];
            allMedia = allMedia.concat(list);

        }


        keystone.list("Media").model
            .find({'_id': {$in : allMedia} })
            .lean()
            .exec(function (err,result){
                if(result) {
                    for(var m in result) {
                        var media = result[m];
                        for(var l in lists) {
                            var list = lists[l];
                            if(utils.containsEntry(media._id, list))
                                locals.content[l].push(media);
                        }
                    }
                }
                next(err);
            });


    };
};




