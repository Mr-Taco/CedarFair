var keystone = require('keystone'),
    Types = keystone.Field.Types;

//Name it so it doesnt redefine Number
var FormSettings = new keystone.List('FormSettings', {
    defaultSort:'name'
    ,label: "Form Settings"
    ,track:{createdAt:true}
    ,nocreate:true
    
});


FormSettings.add(
    {
        name: {type: Types.Text, required: true, initial: true, index: true}
        ,form: {type: Types.Select, required:true, initial:true
            ,options:[
            {value:"media" , label:"Media Request Form"}
            ,{value:"partnership" , label:"Contact Partnerships"}
            ,{value:"groupsales" , label:"Contact Group Sales"}            
            ]
            ,label: "Form Type"        
            ,noedit:true
        }
        ,to: {type:Types.Email, required:true, initial:true
            ,label: "To Email"
        }
        ,subject: {type:Types.Text, required:true, initial:true
            ,label: "Subject Line"
        }
    }

);


FormSettings.defaultColumns = 'name,state|20%,publishedAt|15%';
FormSettings.register();
