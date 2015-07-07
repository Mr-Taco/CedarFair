var keystone = require('keystone'),
    Types = keystone.Field.Types;


var TickerList = new keystone.List('TickerList', {
    track:{createdAt:true, updatedAt:true},
    defaultSort:'name',
    map: { name: 'name' },
    autokey: { path: 'slug', from: 'name', unique: true }
});


TickerList.add({
    name: {type:String, required:true, initial:true}
    ,state: {type: Types.Select, options: 'draft,published', default:'published'}
    ,tickers: {type:Types.Relationship, ref:"Ticker", many:true}
});




TickerList.defaultColumns = 'title,state|20%';
TickerList.register();