var keystone = require('keystone'),
    Types = keystone.Field.Types;


var NewsPage = new keystone.List('NewsPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"News Page",
    plural:"News Pages",
    label:"News Pages"

});


NewsPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
        ,newsHeadline: {type:Types.Text,
            label: "Headline"
        }

    }
    ,"Press Releases"
    ,{        
        pressReleaseLabel:{type:Types.Text,
            label:"Press Release Tab Label",
            default:"Press Release"
        }
       
    }
    ,"Media Contacts"
    ,{
        mediaContactLabel:{type:Types.Text,
            label:"Media Contact Tab Label",
            default:"Media Contact"
        }
        ,mediaContacts:{type:Types.Relationship,
            ref:"MediaContact",
            many:true,
            label:"Media Contacts"
        }
    }
    ,"Media Request Form"
    ,{
        mediaRequestLabel:{type:Types.Text,
            label:"Media Request Tab Label",
            default:"Media Request Form"
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


NewsPage.defaultColumns = 'name,state|10%,updatedAt|30%';
NewsPage.register();
