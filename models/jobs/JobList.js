var keystone = require('keystone'),
    Types = keystone.Field.Types;


var JobList = new keystone.List('JobList', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


JobList.add(
    {
        name: {type:String, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
        ,jobs: {type:Types.Relationship, ref:"Job", many:true}

    }

);




JobList.defaultColumns = 'title,state|20%,publishedAt|15%';
JobList.register();