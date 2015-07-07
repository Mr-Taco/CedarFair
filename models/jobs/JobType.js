var keystone = require('keystone'),
    Types = keystone.Field.Types;


var JobType = new keystone.List('JobType', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


JobType.add(
    {
        name: {type:String, required:true}
    }
    ,"Content"
    ,{
        headline: {type:Types.Text}
        ,body: {type:Types.Html , wysiwyg:true,  height:30}
    }
    ,"Media"
    ,{
        video:{type:Types.Relationship , ref:"Media" , many:false,
            label: "Showcase Video"
        }
    }

);





JobType.defaultColumns = 'title,updatedAt|30%';
JobType.register();