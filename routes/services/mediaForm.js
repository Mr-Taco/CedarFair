var keystone = require('keystone'),
    MediaRequestForm = keystone.list("MediaRequestForm");

exports = module.exports = function (req, res) {
    
    var body = req.body;
    
    var form = new MediaRequestForm.model(body);
    form.save(function(err) {
        if(err) {
            res.status(500).json({
                    status:500,
                    message:"failure",
                    error:err
                }
            );
        }else{
            res.status(200).json({
                    status:200,
                    message:"success"
                }
            );
        }
    });
    

    

};
