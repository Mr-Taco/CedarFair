globals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
WhoWeArePage = require './com/pages/WhoWeArePage.coffee'
InlineVideo = require './com/plugins/InlineVideo.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    jobs = new WhoWeArePage
        el: "body"
        
        
