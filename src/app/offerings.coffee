DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
ParksList = require './com/plugins/ParksList.coffee'

HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
OfferingsPage = require './com/pages/OfferingsPage.coffee'


$(document).ready ->

    offerings = new OfferingsPage
        el: "body"
