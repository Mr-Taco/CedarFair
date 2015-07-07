var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "meta";

var Metadata = new keystone.List('Metadata', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"Metadata",
    plural:"Metadata",
    label:"Metadata"

});


Metadata.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
        ,title: {type:String}
    }
    ,"Page Information"
    ,{
        metaDesc: {type:Types.Textarea, wysiwyg:true, height:60,
            label: "Description"
        }
        ,metaKeywords: {type:Types.Text,
            label:"Key Words"
        }
    }
    ,"Open Graph"
    ,{
        ogTitle: {type:Types.Text,
            label: "OG:Title"
        }
        ,ogURL: {type:Types.Text,
            label: "OG:URL"
        }
        ,ogDesc: {type:Types.Textarea, wysiwyg:true, height:60,
            label:"OG:Description"
        }
        ,ogImage:{type: Types.S3File
            ,allowedTypes: [
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,note: "If no font-awesome class is defined you can upload your own icon (50x50)"
            ,s3path: uploadPath
            ,datePrefix: "X"
        }
    }
);


Metadata.defaultColumns = 'name,state|10%';
Metadata.register();
