var keystone = require('keystone'),
    Types = keystone.Field.Types;


var HomePage = new keystone.List('HomePage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Home Page",
    plural:"Home Pages",
    label:"Home Page"

});


HomePage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"About"
    ,{
        aboutHeadline1: {type:Types.Text,
            label: "Headline1"
        }
        ,aboutHeadline2: {type:Types.Text,
            label: "Headline2"
        }
        ,aboutSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
    }
    ,"Parks"
    ,{
        parksHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,parksSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
    }
    ,"Jobs"
    ,{
        applicantsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,applicantsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,applicantsGallery:{type:Types.Relationship, ref:'Gallery' , many:false }
        ,jobApplicationLinkLabel: {type:Types.Text,
            label: "Corporate Jobs Link Label"
        }
        ,jobApplicationLink: {type:Types.Url ,
            label: "Corporate Jobs Link Url"
        }
        ,parkJobApplicationLinkLabel: {type:Types.Text,
            label: "Park Jobs Link Label"
        }
        ,parkJobApplicationLink: {type:Types.Url ,
            label: "Park Jobs Link Url"
        }
        ,featuredJobList: {type:Types.Relationship, ref:'JobList', many:false}
    }
    ,"Group Sales"
    ,{

        groupsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,groupsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,groupQuotes: {type:Types.Relationship, ref:'Text' , many:true, filters: {type:"quote"},
            label:"Quotes"
        }
        ,groupsLinkLabel: {type:Types.Text,
            label: "Link Label"
        }
        ,groupsLink: {type:Types.Url ,
            label: "Link Url"
        }


    }
    ,"Accommodations"
    , {
        accommodationsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,accommodationsHeadline2: {type:Types.Text,
            label: "Headline 2"
        }
        ,accommodationsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,accommodatedParks: {
            type:Types.Relationship, ref:"Park" , many:true
            ,label:"Parks Gallery"
            ,note:"Choose parks with Accommodations"
        }
       
    }
    ,"Investors"
    , {
        investorsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,investorsHeadline2: {type:Types.Text,
            label: "Headline 2"
        }
        ,investorsSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,investorsSubHeadline2: {type:Types.Text,
            label: "Sub Headline 2"
        }
        ,tickerList: {type:Types.Relationship, ref:"TickerList" , many:false,
            label: "Stock Ticker"
        }
        ,investorsLinkLabel: {type:Types.Text ,
            label: "Link Label"
        }
        ,investorsLink: {type:Types.Url ,
            label: "Link Url"
        }
    }
    ,"Corporate Partners"
    , {
        partnersHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,partnersHeadline2: {type:Types.Text,
            label: "Headline 2"
        }
        ,partnersSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,partnersLinkLabel: {type:Types.Text ,
            label: "Link Label"
        }
        ,partnersLink: {type:Types.Url ,
            label: "Link Url"
        }
    }
    ,"Haunt"
    , {
        seasonalHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,seasonalSubHeadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,seasonalLinkLabel: {type:Types.Text ,
            label: "Link Label"
        }
        ,seasonalLink: {type:Types.Url ,
            label: "Link Url"
        }
        ,videos:{type:Types.Relationship,
            label:"Haunt Videos",
            ref:"Media",
            many:true}
        
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }
);


HomePage.defaultColumns = 'name,state|10%,updatedAt|30%';
HomePage.register();
