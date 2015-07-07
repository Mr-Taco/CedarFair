var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "parks";



var Park = new keystone.List('Park', {
    track:{createdAt:true, updatedAt:true},
    autokey: { path: 'slug', from: 'name', unique: true }
    ,sortable:true


});


Park.add(
    {
        name: {type:String, required:true, initial:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"Content"
    ,{
        head: {type:Types.Html, wysiwyg:true,height:60}
        ,body: {type:Types.Html, wysiwyg:true,height:120, collapse:true}
        ,topRides: {type:Types.Text}
        ,whatsNew: {type:Types.Text}
            
    }
    ,"Links"
    ,{
        learn: {type:Types.Url,
            label:"Learn More"
        }
        ,buy: {type:Types.Url,
            label:"Buy Tickets"
        }
        ,work: {type:Types.Url,
            label:"Apply Now (Job)"
        }
    }
    ,"Media"
    ,{
        logoFull: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
            ]
            ,s3path:uploadPath
            ,datePrefix: "X"

        },
        logoThumb: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
            ]
            ,s3path:uploadPath
            ,datePrefix: "X"

        },
        video: {type:Types.Relationship,  ref:"Media", many:false}
    }
    ,"Accommodations"
    ,{
        accommodations:{ type:Types.Relationship, ref:"ParkAccommodation", many:true}
    }
    ,"Location"
    ,{
        location: {type: Types.Location}
    }
);


Park.defaultColumns = 'name,state|20%,publishedAt|15%';
Park.register();
