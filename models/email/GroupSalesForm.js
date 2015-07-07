var keystone = require('keystone'),
    Types = keystone.Field.Types;

//Name it so it doesnt redefine Number
var GroupSalesForm = new keystone.List('GroupSalesForm', {
    defaultSort: '-createdAt'
    , label: "Group Sales E-Mails"
    , track: {createdAt: true}
    , nocreate: true
    , noedit: true

});


GroupSalesForm.add(
    {

        name: {type: Types.Text, required:true}
        , email: {type: Types.Email, required:true}
        , phone: {type: Types.Text, required:true}
        , groupSize: {type: Types.Text, required:true}
        , program: {type: Types.Text, required:true}
        , park: {type: Types.Text, required:true}
        , preferredContactMethod: {type: Types.Text}

    }
);


GroupSalesForm.schema.pre('save', function(next) {
    this.sendNotificationEmail(next);
});

GroupSalesForm.schema.methods.sendNotificationEmail = function(callback) {

    if ('function' !== typeof callback) {
        callback = function() {};
    }

    var form = this;

    keystone.list('FormSettings').model.findOne().where('form', 'groupsales').exec(function(err, formSetting) {

        if (err) return callback(err);

        var to = formSetting.to;
        var subject = formSetting.subject;

        new keystone.Email('groupsales-form').send({
            to: to,
            from: {
                name: "CedarFair.com Group Sales",
                email:"no-reply@cedarfair.com"
            },
            subject: subject,
            body: form
        }, callback);

    });

};

GroupSalesForm.defaultColumns = 'name,email,phone,groupSize,createdAt|15%';
GroupSalesForm.register();
