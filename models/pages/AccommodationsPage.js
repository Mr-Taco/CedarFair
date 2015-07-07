var keystone = require('keystone'),
    Types = keystone.Field.Types;


var AccommodationsPage = new keystone.List('AccommodationsPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Accommodations Page",
    plural:"Accommodations Pages",
    label:"Accommodations Page"

});


AccommodationsPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Header"
    ,{
        accommodationsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,accommodationsBody: {type:Types.Textarea,
            label: "Body"
        }
    }
   
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


AccommodationsPage.defaultColumns = 'name,state|10%,updatedAt|30%';
AccommodationsPage.register();
