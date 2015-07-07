var keystone = require('keystone'),
    Types = keystone.Field.Types;


var OfferingsPage = new keystone.List('OfferingsPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Offerings Page",
    plural:"Offerings' Pages",
    label:"Offerings Page"

});


OfferingsPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Headline"
    ,{
        offeringsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,offeringsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,offeringsBody: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Media"
    ,{
        mediaHeadline: {type:Types.Text, 
            label:"Offerings Media Headline"
        },
        media: {type:Types.Relationship, ref:'Media', many:true}
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


OfferingsPage.defaultColumns = 'name,state|10%,updatedAt|30%';
OfferingsPage.register();
