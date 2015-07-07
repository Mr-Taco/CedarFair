DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
ParksList = require './com/plugins/ParksList.coffee'

HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
NewsPage = require './com/pages/NewsPage.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    jobs = new NewsPage
        el: "body"
