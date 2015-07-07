var keystone = require('keystone'),
    Types = keystone.Field.Types;

//Name it so it doesnt redefine Number
var PartnershipsForm = new keystone.List('PartnershipsForm', {
    defaultSort: '-createdAt'
    , label: "Partnership E-Mails"
    , track: {createdAt: true}
    , nocreate: true
    , noedit: true

});


PartnershipsForm.add(
    {

        name: {type: Types.Text, required:true}
        , email: {type: Types.Email, required:true}
        , phone: {type: Types.Text, required:true}
        , company: {type: Types.Text, default:""}
        , parkInterest: {type: Types.Text, required:true}
        , sponsorshipType: {type: Types.Text, required:true}
        , lastVisit: {type: Types.Text, required:true}
        , preferredContactMethod: {type: Types.Select, options:'phone, email', required:true}

    }
);

PartnershipsForm.schema.pre('save', function(next) {
    this.sendNotificationEmail(next);    
});

PartnershipsForm.schema.methods.sendNotificationEmail = function(callback) {

    if ('function' !== typeof callback) {
        callback = function() {};
    }

    var form = this;

    keystone.list('FormSettings').model.findOne().where('form', 'partnership').exec(function(err, formSetting) {

        if (err) return callback(err);
        
        var to = formSetting.to;
        var subject = formSetting.subject;

        new keystone.Email('partnerships-form').send({
            to: to,
            from: {
                name: "CedarFair.com Partnerships",
                email: "no-reply@cedarfair.com"
            },
            subject: subject,
            body: form
        }, callback);

    });

};


PartnershipsForm.defaultColumns = 'name,email,phone,createdAt|15%';
PartnershipsForm.register();
