var keystone = require('keystone'),
    Types = keystone.Field.Types;


var PartnershipDetailPage = new keystone.List('PartnershipDetailPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Partnership Detail Page",
    plural:"Partnership Detail Pages",
    label:"Partnership Detail Page"

});


PartnershipDetailPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Partnership Details"
    ,{
        headline: {type:Types.Text,
            label: "Headline"
        }
        ,subHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
      
    }
    ,"Form Button"
    ,{
        formButtonLabel: {type:Types.Text
            ,label:"Form Button Label"
            ,default:"contact sponsorship"
        }
    }
    ,"Sponsorship Types"
    ,{
        sponsorshipTypes: {type:Types.Relationship, ref:"PartnershipType", many:true}
    }
 


);


PartnershipDetailPage.defaultColumns = 'name,state|20%,updatedAt|30%';
PartnershipDetailPage.register();
