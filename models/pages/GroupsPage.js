var keystone = require('keystone'),
    Types = keystone.Field.Types;


var GroupsPage = new keystone.List('GroupsPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Groups Page",
    plural:"Groups Pages",
    label:"Groups Page"

});


GroupsPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"About Group Sales"
    ,{
        groupsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,groupsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,groupsBody: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Groups"
    ,{
        selectHeadline: {type:Types.Text}
        ,contactLinkLabel: {type:Types.Text,
            label:"Contact Label"
        }
        ,contactLinkUrl: {type:Types.Url,
            label:"Contact Link"
        }
        ,groupTypes:{type:Types.Relationship , ref:"GroupType", many:true}

    }
    ,"Testimonials"
    ,{
        testimonialsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,testimonialsHeadlineFootnote: {type:Types.Text,
            label: "Headline Footnote"
        }
        ,testimonialsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,testimonialsSubHeadlineFootnote: {type:Types.Text,
            label: "Sub Headline Footnote"
        }
        ,groupsQuotes: {type:Types.Relationship, ref:'Text', many:true, filters:{type:"quote"},
            label:"Quotes"
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


GroupsPage.defaultColumns = 'name,state|10%,updatedAt|30%';
GroupsPage.register();
