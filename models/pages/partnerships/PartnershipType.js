var keystone = require('keystone'),
    Types = keystone.Field.Types;


var PartnershipType = new keystone.List('PartnershipType', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Partnership Type",
    plural:"Partnership Types",
    label:"Partnership Type"

});


PartnershipType.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Info"
    ,{
        headline: {type:Types.Text,
            label: "Headline"
        }       
        ,body: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Media"
    ,{
        media: {type:Types.Relationship, ref:"Media",many:true
            ,label:"Images & Videos"
            ,note:"Only the first 4 are shown"
        }
    }
   


);


PartnershipType.defaultColumns = 'name,state|20%,updatedAt|30%';
PartnershipType.register();
