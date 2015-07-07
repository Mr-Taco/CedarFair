/**
 * Created by wildlife009 on 9/17/14.
 */

var pkg = require('../../package.json');


module.exports.containsEntry = function (item, list) {

    var result = false;

    for(var e in list) {
        var entry = list[e];

        if(entry.toString() == item.toString())
            result = true;

    }


    return result;

};


module.exports.cdnUrl = function(filename, path) {
    return pkg.deploy.cdn_root + path + filename;
};
