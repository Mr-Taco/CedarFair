var keystone = require('keystone'),
    PartnershipsForm = keystone.list("PartnershipsForm");

exports = module.exports = function (req, res) {
    
    var body = req.body;
    
    var form = new PartnershipsForm.model(body);
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
