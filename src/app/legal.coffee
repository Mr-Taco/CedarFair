DraggableGallery = require './com/plugins/DraggableGallery.coffee'
FadeGallery = require './com/plugins/FadeGallery.coffee'
ParksList = require './com/plugins/ParksList.coffee'

HeaderAnimation = require './com/plugins/HeaderAnimation.coffee'
AnimationBase = require './com/abstract/AnimationBase.coffee'


$(document).ready ->

    #$("#content").css("height" , $('#content').height())

    legal = new AnimationBase
        el: "body"
