var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "galleries";
var Media = new keystone.List('Media', {
    defaultSort:"name"
    ,track:{createdAt:true, updatedAt:true}
    ,map: { name: 'name' }
    ,autokey: { path: 'slug', from: 'name', unique: true }
    /*,sortable:true
    ,sortContext:'Gallery:media'*/
    ,plural:"Media"
    ,singular:"Media"

});


Media.add(
    {
        name: {type:String, required:true}
    }
    ,"Meta Data"
    ,{
        title: {type:Types.Text}
        ,subTitle: {type:Types.Text, collapse:true}
        ,description: {type:Types.Html, wysiwyg:true, height:130,collapse:true}
        ,linkUrl: {type:Types.Url,collapse:true}
    }
    ,"Type"
    ,{
        type: {type: Types.Select, initial:true,
            options:[
                {value:"image" , label:'Image'},
                {value:"video" , label:'Video'}
            ],
            emptyOption:false
        }
    }
    ,{heading:"Image" , dependsOn:{type:'image'}}
    ,{
        imageFull: {type: Types.S3File
            ,allowedTypes: [
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,s3path: uploadPath
            ,datePrefix: "X"
            ,dependsOn:{type:'image'}
        }
        ,imageThumb: {type: Types.S3File
            ,allowedTypes: [
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,s3path: uploadPath
            ,datePrefix: "X"
            ,dependsOn:{type:'image'}
        }
    }
    ,{heading:"Video" , dependsOn:{type:'video'}}
    ,{

        videoThumb: {type: Types.S3File
            ,allowedTypes: [
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
            ]
            ,s3path: uploadPath
            ,datePrefix: "X"
            ,dependsOn:{type:'video'}
        },
        videoMp4: {type: Types.S3File
            ,allowedTypes: [
                'video/mp4'
            ]
            ,s3path: uploadPath
            ,datePrefix: "X"
            ,label: "H264 (.mp4)"
            ,dependsOn:{type:'video'}
        },
        videoWebm: {type: Types.S3File
            ,allowedTypes: [
                'video/webm'
            ]
            ,s3path: uploadPath
            ,datePrefix: "X"
            ,label: "WebM (.webm)"
            ,dependsOn:{type:'video'}
        }

    }

);


Media.defaultColumns = 'name|20%,publishedAt|15%';
Media.register();
