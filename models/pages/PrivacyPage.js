var keystone = require('keystone'),
    Types = keystone.Field.Types;


var PrivacyPage = new keystone.List('PrivacyPage', {
    defaultSort:'-updatedAt',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    singular:"Privacy Page",
    plural:"Privacy Pages",
    label:"Privacy Page"
});


PrivacyPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"Privacy Copy"
    ,{
        headline: {type:Types.Text,
            label: "Headline"
        }       
        ,body: {type:Types.Textarea, wysiwyg:true, height:350, collapse:true}
    }
    
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


PrivacyPage.defaultColumns = 'name,state|10%,updatedAt|30%';
PrivacyPage.register();
