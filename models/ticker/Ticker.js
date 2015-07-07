var keystone = require('keystone'),
    Types = keystone.Field.Types;


var Ticker = new keystone.List('Ticker', {
    defaultSort:'name'
    ,track:{createdAt:true, updatedAt:true}
    ,map: { name: 'name' }
    ,autokey: { path: 'slug', from: 'name', unique: true }
});


Ticker.add(
    {
        name: {type: String, required: true, initial: true}
    }
    ,"Content"
    ,{
        headline: {type:Types.Text}
        ,up: {type:Types.Boolean}
        ,amount:{type:Types.Number, format:'0,0.0'}

    }
);


Ticker.defaultColumns = 'name,state|20%,publishedAt|15%';
Ticker.register();