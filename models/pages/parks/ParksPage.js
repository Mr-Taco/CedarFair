var keystone = require('keystone'),
    Types = keystone.Field.Types;


var ParksPage = new keystone.List('ParksPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Parks Page",
    plural:"Parks Pages",
    label:"Parks Page"

});


ParksPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"About Parks"
    ,{
        parksHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,parksSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,parksBody: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Parks"
    ,{
        selectPark: {type:Types.Text,
            label:"Select Park Headline"
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


ParksPage.defaultColumns = 'name,state|10%,updatedAt|30%';
ParksPage.register();
