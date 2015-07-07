DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
ParksList = require './com/plugins/ParksList.coffee'

HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
JobsPage = require './com/pages/JobsPage.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    jobs = new JobsPage
        el: "body"
