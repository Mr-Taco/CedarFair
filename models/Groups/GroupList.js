var keystone = require('keystone'),
    Types = keystone.Field.Types;


var GroupList = new keystone.List('GroupList', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


GroupList.add({
    name: {type:String, required:true, initial:true}
    ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    ,groups:{type:Types.Relationship, ref:"Group", many:true}
});




GroupList.defaultColumns = 'title,state|20%';
GroupList.register();