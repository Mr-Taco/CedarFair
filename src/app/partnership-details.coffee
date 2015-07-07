globals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
PartnershipDetailPage = require './com/pages/PartnershipDetailPage.coffee'


$(document).ready ->

    partnershipDetails = new PartnershipDetailPage
        el: "body"
