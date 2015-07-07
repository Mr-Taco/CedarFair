var keystone = require('keystone'),
    Types = keystone.Field.Types;


var JobsPage = new keystone.List('JobsPage', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Jobs Page",
    plural:"Jobs Pages",
    label:"Jobs Page"

});


JobsPage.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"About Jobs"
    ,{
        jobsHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,jobsSubheadline: {type:Types.Text,
            label: "Sub Headline"
        }
        ,jobsBody: {type:Types.Textarea, wysiwyg:true, height:150}
    }
    ,"Featured Jobs"
    ,{
        featuredHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,allJobsLinkLabel: {type:Types.Text,
            label:"All Jobs Link Label"
        }
        ,allJobsLinkUrl: {type:Types.Url,
            label:"All Job Link Url"
        }
        ,jobsLinkLabel: {type:Types.Text,
            label:"Featured Jobs Link Label"
        }
        ,jobsLinkUrl: {type:Types.Url,
            label:"Featured Jobs Link Url"
        }
        ,featuredJobList: {type:Types.Relationship, ref:'JobList', many:false}
    }
    ,"Learn"
    ,{
        learnHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,jobTypes: {type:Types.Relationship, ref:'JobType', many:true}
    }
    ,"Parks"
    ,{
        parksHeadline: {type:Types.Text,
            label: "Headline"
        }
        ,parkJobLinkLabel: {type:Types.Text,
            label:"Apply Link Label"
        }
    }
    ,"Metadata"
    , {
        metadata:{type:Types.Relationship,ref:"Metadata",many:false}
    }

);


JobsPage.defaultColumns = 'name,state|10%,updatedAt|30%';
JobsPage.register();
