var keystone = require('keystone'),
    Types = keystone.Field.Types;


var Gallery = new keystone.List('Gallery', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


Gallery.add({
    name: {type:String, required:true}
    ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    ,media: {type:Types.Relationship, ref:"Media", many:true,
        label:"Media Items"
    }


});





Gallery.defaultColumns = 'title,state|20%,publishedAt|15%';
Gallery.register();