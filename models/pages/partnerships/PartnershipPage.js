var keystone = require('keystone'),
    Types = keystone.Field.Types;


var PartnershipPage = new keystone.List('PartnershipPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Partnership Page",
    plural:"Partnership Pages",
    label:"Partnership Page"

});


PartnershipPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Header"
    ,{
        sponsorHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,sponsorSubheadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,sponsorBody: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Numbers"
    ,{
        numbersHeadline: {type:Types.Text,
            label: "Headline"
        },
        numbersSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,numbersLinkLabel: {type:Types.Text,
            label:"Contact Sponsorship Link Label"
        }
        ,numbersLinkEmail: {type:Types.Email,
            label:"Contact Sponsorship Email"
        }
        ,numbers: {type:Types.Relationship, ref:'Text', many:true, filters:{type:"text"},
            label:"Slogans"}
        ,numbersLegal: {type:Types.Textarea , height:20,
            label:"Legal Blurb"
        }
    }
    ,"Partnership/Ad Type"
    ,{
        satHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,satSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,satGallery: {type:Types.Relationship, ref:'Gallery', many:false,
            label: "Partnership/Ad Type Gallery"
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }
    ,"Sponsorship Types"
    ,{
        sponsorshipTypes: {type:Types.Relationship, ref:"PartnershipType", many:true}
    }


);


PartnershipPage.defaultColumns = 'name,state|20%,updatedAt|30%';
PartnershipPage.register();
