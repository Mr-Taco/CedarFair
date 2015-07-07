DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
ParksList = require './com/plugins/ParksList.coffee'

HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
AccommodationsPage = require './com/pages/AccommodationsPage.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    accommodations = new AccommodationsPage
        el: "body"
