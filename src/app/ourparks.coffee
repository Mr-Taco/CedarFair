wglobals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
OurParksPage = require './com/pages/OurParksPage.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    ourparks = new OurParksPage
        el: "body"
        
   



 
