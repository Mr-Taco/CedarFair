globals = require './com/global/index.coffee'
ParksList = require './com/plugins/ParksList.coffee'
DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
TickerList = require './com/plugins/TickerList.coffee'
HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
HomePage = require './com/pages/HomePage.coffee'

$(document).ready ->

    #$("#content").css("height" , $('#content').height())


    
    home = new HomePage
        el: "body"

    $('.circle').on 'click', ->
        target = $(this)
        TweenMax.fromTo(target, .5, { rotationY: 720}, {rotationY: 0})




