var keystone = require('keystone'),
    Types = keystone.Field.Types;


var GroupType = new keystone.List('GroupType', {
    track:{createdAt:true, updatedAt:true},
    defaultSort:'name',
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


GroupType.add(
    {
        name: {type:String, required:true}
    }
    ,"Content"
    ,{
        headline: {type:Types.Text}
        ,body: {type:Types.Html, wysiwyg:true, height:60}

    }
    ,"Media"
    ,{
        video:{type:Types.Relationship , ref:"Media" , many:false}
    }

);





GroupType.defaultColumns = 'title';
GroupType.register();