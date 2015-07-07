globals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
PartnershipPage = require './com/pages/PartnershipPage.coffee'


$(document).ready ->

    partnership = new PartnershipPage
        el: "body"

    $('.circle').on 'click', ->
        target = $(this)
        TweenMax.fromTo(target, .5, { rotationY: 720}, {rotationY: 0})
