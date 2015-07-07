var keystone = require('keystone'),
    Types = keystone.Field.Types;


var WhoWeArePage = new keystone.List('WhoWeArePage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Who We Are Page",
    plural:"Who We Are Pages",
    label:"Who We Are Page"

});


WhoWeArePage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Page Header"
    ,{
        whoWeAreHeader: {type:Types.Text,
            label: "Headline"
        },
        whoWeAreSubheader: {type:Types.Text,
            label: "Sub Headline"
        }
        ,slogans: {type:Types.Relationship 
            ,ref:"Text" 
            ,many:true

        }
        ,manifestoButtonLabel: {type:Types.Text,
            label: "Manifesto Button Label"
        }
        ,manifesto: {type: Types.Html, 
            wysiwyg: true, 
            height: 500,
            collapse:true
        }
    }
    ,"Media"
    ,{
       
       video: {type:Types.Relationship, ref:'Media', many:false, 
           label:"Who We Are Video"
       }
    }
    ,"Team"
    , {

        teamHeadline: {type:Types.Text,
            label: "Team Headline" 
        }
        ,directorsLinkLabel: {type:Types.Text,
            label: "Directors Label"
            ,default: "Board of Directors"
        }
        ,directorsLink: {type:Types.Url,
            label: "Directors Link"
        }
        ,execsLinkLabel: {type:Types.Text,
            label: "Execs Label"
            ,default: "Executive Team"
        }
        ,execsLink: {type:Types.Url,
            label: "Execs Link"
            
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);
/* execsLinkLabel: 'Executive Team',
 execsLink: '',
 directorsLink: '',
 directorsLinkLabel: 'Board of Directors'*/

WhoWeArePage.defaultColumns = 'name,state|10%,updatedAt|30%';
WhoWeArePage.register();
