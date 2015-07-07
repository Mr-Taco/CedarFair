var keystone = require('keystone'),
    Types = keystone.Field.Types;


var LegalPage = new keystone.List('LegalPage', {
    defaultSort:'-updatedAt',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    singular:"Legal Page",
    plural:"Legal Pages",
    label:"Legal Page"

});


LegalPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"Legal Copy"
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


LegalPage.defaultColumns = 'name,state|10%,updatedAt|30%';
LegalPage.register();
