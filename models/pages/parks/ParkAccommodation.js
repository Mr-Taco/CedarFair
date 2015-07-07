var keystone = require('keystone'),
    Types = keystone.Field.Types;





var ParkAccommodation = new keystone.List('ParkAccommodation', {
    defaultSort:'name',
    track:{createdAt:true, updatedAt:true},
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }

});


ParkAccommodation.add(
    {
        
        state: {type: Types.Select, options: 'draft,published', default:'published'}
    }
    ,"Accommodation"
    ,{
        name: {type:String, required:true, initial:true}    
        ,caption: {type:Types.Text,
            label:"Caption"
            ,note:"Used for hotel info (i.e., Available rooms)"
        }
        ,media: {type:Types.Relationship, ref:"Media", many:false
            ,label:"Image or Video"
        }
            
    }
    ,"Links"
    ,{
        learn:{type:Types.Text
            ,label:"Learn More Label"
            ,default:"learn more"
        }
        ,learnLink:{type:Types.Url
            ,label:"Learn More Link"
        }
        ,book:{type:Types.Text
            ,label:"Book Now Label"
            ,default:"book now"
        }
        ,bookLink:{type:Types.Url
            ,label:"Book Now Link"
        }
    }
);

ParkAccommodation.defaultColumns = 'name,state|20%,publishedAt|15%';
ParkAccommodation.register();
