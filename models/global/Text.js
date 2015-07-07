var keystone = require('keystone'),
    Types = keystone.Field.Types;

//Name it so it doesnt redefine Number
var Text = new keystone.List('Text', {
    defaultSort:'name'
    ,label: "Text Item"
    ,track:{createdAt:true, updatedAt:true}
    ,map: { name: 'name' }
    ,autokey: { path: 'slug', from: 'name', unique: true }
});


Text.add(
    {
        name: {type: String, required: true, initial: true},
        type: {type: Types.Select, initial:true, 
            options:[
                {value:"quote" , label:'Quote'},
                {value:"text" , label:'Text'}
            ],
            emptyOption:false    
        }
    }
    ,{heading:"Quote" , dependsOn:{type:'quote'}}
    ,{
        quote: {type:Types.Text, 
            label:"Quote",
            dependsOn:{type:'quote'}
        },        
        source: {type:Types.Text,
            label:"Source",
            dependsOn:{type:'quote'}
        },
        link: {
            type:Types.Url,
            label:"Link",
            note:"Will be displayed as \"Read this in its full glory here\".",
            dependsOn:{type:'quote'}
        }
       
    }
    ,{heading:"Text" , dependsOn:{type:'text'}}
    ,{
        body: {
            type:Types.Textarea,
            height:40,
            dependsOn:{type:'text'}
            
        }
    }
   
);


Text.defaultColumns = 'name,state|20%,publishedAt|15%';
Text.register();
