var keystone = require('keystone'),
    Types = keystone.Field.Types;


var NewsArticle = new keystone.List('NewsArticle', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true },
    singular:"News Article",
    plural:"News Articles",
    label:"News Articles"

});


NewsArticle.add(
    {
        name: {type:String, index:true, initial:true, required:true}
        ,state: {type: Types.Select, options: 'draft,published', default:'published'}

    }
    ,"Article Information"
    ,{
        date: {type:Types.Date,
            label: "Publish Date"
        }
        ,caption: {type:Types.Text,
            label: "Caption"
        }
        ,link: {type:Types.Url, 
            label:"Article Link"
        }
    }
    ,"Content"
    ,{
        title: {type:Types.Text
            ,label:"Title"
        }
        ,body: {type:Types.Html, wysiwyg:true, height:500, collapse:true
            ,label:"Body"
        }
    }
 

);


NewsArticle.defaultColumns = 'name,date|20%,state|10%';
NewsArticle.register();
