globals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
GroupSalesPage = require './com/pages/GroupSalesPage.coffee'


$(document).ready ->

    groupsales = new GroupSalesPage
        el: "body"
