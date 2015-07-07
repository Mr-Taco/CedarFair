var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "jobs";
var pdfPath = uploadPath+"/pdf";

var Job = new keystone.List('Job', {
    defaultSort:"name"
    ,track:{createdAt:true, updatedAt:true}
    ,map: { name: 'name' }
    ,autokey: { path: 'slug', from: 'name', unique: true }
    ,plural:"Jobs"
    ,singular:"Job"

});


Job.add(
    {
        name: {type:String, required:true}
    }
    ,"Content"
    ,{
        jobTitle: {type:Types.Text}
        ,jobLocation: {type:Types.Text}
        ,description: {type:Types.Html, wysiwyg:true ,height:100}
        ,postedDate: {type:Types.Date, default:Date.now}
        ,descriptionLink : {type:Types.Url}
    }
    ,"Type"
    ,{
        jobType: {type:Types.Relationship, ref:"JobType" , many:false}
    }
    ,"Media"
    ,{

        pdf: {type:Types.S3File
            ,allowedTypes:[
            'application/pdf'
            ,'application/x-pdf'    
            ,'text/pdf'    
            ]
            ,s3path:pdfPath
            ,filename: function (item, filename) {
                return item.slug+'.pdf';
            }
            ,label:"Job PDF File"
        
        }
        ,jobThumb: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,note:"100x100"
            ,s3path:uploadPath
            ,datePrefix: "X"

        }
        ,jobFull: {type:Types.S3File
            ,allowedTypes:[
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,note:"300x300"
            ,s3path:uploadPath
            ,datePrefix: "X"

        }
     
    }
);




Job.defaultColumns = 'name|20%,postedDate|15%,updatedAt|15%';
Job.register();
