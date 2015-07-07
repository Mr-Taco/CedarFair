var keystone = require('keystone'),
    Types = keystone.Field.Types;

//Name it so it doesnt redefine Number
var MediaRequestForm = new keystone.List('MediaRequestForm', {
    defaultSort: '-createdAt'
    , label: "Media Request E-Mails"
    , track: {createdAt: true}
    , nocreate: true
    , noedit: true

});


MediaRequestForm.add(
    {

        name: {type: Types.Text, required:true}
        , email: {type: Types.Email, required:true}
        , phone: {type: Types.Text, required:true}
        , comment: {type: Types.Textarea, required:true}

    }
);

MediaRequestForm.schema.pre('save', function(next) {
    this.sendNotificationEmail(next);
});

MediaRequestForm.schema.methods.sendNotificationEmail = function(callback) {

    if ('function' !== typeof callback) {
        callback = function() {};
    }

    var form = this;

    keystone.list('FormSettings').model.findOne().where('form', 'media').exec(function(err, formSetting) {

        if (err) return callback(err);

        var to = formSetting.to;
        var subject = formSetting.subject;

        new keystone.Email('media-form').send({
            to: to,
            from: {
                name: "CedarFair.com Media Request",
                email:"no-reply@cedarfair.com"
            },
            subject: subject,
            body: form
        }, callback);

    });

};


MediaRequestForm.defaultColumns = 'name,email,phone,createdAt|15%';
MediaRequestForm.register();
