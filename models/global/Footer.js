var keystone = require('keystone'),
    Types = keystone.Field.Types;


var Footer = new keystone.List('Footer', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Footer",
    plural:"Footers",
    label:"Footer"

});


Footer.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
        ,title: {type:String}
    }
    ,"Who We Are"
    ,{
        whoTitle: {type:Types.Text,
            label: "Title"
        }
        ,whoBody: {type:Types.Textarea, wysiwyg:true, height:60,
            label: "Body"
        }
        ,whoLinkLabel: {type:Types.Text,
            label:"Link Label"
        }
        ,whoLink: {type:Types.Url,
            label:"Link"
        }

    }
    ,"Get In Touch"
    ,{
        contactTitle: {type:Types.Text,
            label: "Title"
        }
        ,contactBody: {type:Types.Textarea, wysiwyg:true, height:60,
            label: "Body"
        }
        ,contactLocation: {type:Types.Location,
            label:"Address"
        }
        ,contactPhone: {type:Types.Text,
            label:"Phone Number"
        }
        ,contactEmail: {type:Types.Email,
            label:"Email"
        }

    }
    ,"Free Updates"
    ,{
        updatesTitle: {type:Types.Text,
            label: "Title"
        }
        ,updatesBody: {type:Types.Textarea, wysiwyg:true, height:60,
            label: "Body"
        }
    }

);


Footer.defaultColumns = 'name,state|10%';
Footer.register();
