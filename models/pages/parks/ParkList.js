var keystone = require('keystone'),
    Types = keystone.Field.Types;


var ParkList = new keystone.List('ParkList', {
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }

});


ParkList.add({
    name: {type:String, required:true, initial:true}
    ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    ,parks:{type:Types.Relationship, ref:"Park", many:true}
});

//ParkList.relationship({path:'parks' , ref: 'Park' , refPath:'parkList'});



ParkList.defaultColumns = 'title,state|20%';
ParkList.register();
