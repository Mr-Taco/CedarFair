var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "groups";



var Group = new keystone.List('Group', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
    /*,sortable:true
    ,sortContext:"GroupList:parks"*/
});


Group.add(
    {
        name: {type:String, required:true, initial:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"Content"
    ,{
       title: {type:Types.Text}
       ,body: {type:Types.Html, wysiwyg:true,height:60}
       ,type: {type:Types.Relationship, ref:"GroupType" , many:false}
    }
    ,"Links"
    ,{
        sales: {type:Types.Url,
            label:"Group Sales Link"
        }
    }
    ,"Media"
    ,{
        imageThumb: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,s3path:uploadPath
            ,datePrefix: "X"

        }
        ,image: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,s3path:uploadPath
            ,datePrefix: "X"

        },
        video:{type:Types.Relationship , ref:"Media" , many:false}
    }
);


Group.defaultColumns = 'name|20%,state|20%,type|20%,updatedAt';
Group.register();