var keystone = require('keystone'),
    Types = keystone.Field.Types;


var MediaContact = new keystone.List('MediaContact', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Media Contact",
    plural:"Media Contacts",
    label:"Media Contacts"

});


MediaContact.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Media Contact"
    ,{
        
        organization: {type:Types.Text,
            label: "Organization"
        }
        ,title: {type:Types.Text,
            label: "Title"
        }
        ,phone: {type:Types.Text, 
            label:"Phone Number"
        }
        ,email: {type:Types.Email,
            label:"E-Mail"
        }
    }
 

);


MediaContact.defaultColumns = 'name,state|10%,updatedAt|30%';
MediaContact.register();
