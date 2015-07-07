var keystone = require('keystone'),
    Types = keystone.Field.Types;

var uploadPath = "icons";

var Social = new keystone.List('Social', {
    defaultSort:'label',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'label' },
    autokey: { path: 'slug', from: 'label', unique: true },
    singular:"Social Icon",
    plural:"Social Icons",
    label:"Social Icons"

});


Social.add(
    {
        label: {type:String, index:true, initial:true, required:true}
        ,iconClass:{type:Types.Text,
            note:"Should be a font-awesome class (e.g., fa-facebook)"
        }
        ,customIcon:{type: Types.S3File
            ,allowedTypes: [
                'image/png'
                ,'image/jpg'
                ,'image/jpeg'
                ,'image/gif'
                ,'image/svg+xml'
            ]
            ,note: "If no font-awesome class is defined you can upload your own icon (50x50)"
            ,s3path: uploadPath
            ,datePrefix: "X"}
        ,link:{type:Types.Url}

    }
);


Social.defaultColumns = 'name|10%,iconClass|20%,link|50%';
Social.register();