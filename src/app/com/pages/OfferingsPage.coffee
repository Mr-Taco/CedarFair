AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
BasicOverlay = require '../plugins/BasicOverlay.coffee'
animations = require './animations/offerings.coffee'
globalAnimations = require './animations/global.coffee'
        

class OfferingsPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()



    initComponents: ->
        super()

        if !@isPhone

            coaster = new FrameAnimation
                id:"offerings-coaster-1"
                el:"#offerings-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"

            coaster.loadFrames()




    resetTimeline: =>
        super()

#        @parallax.push globalAnimations.clouds("#section1", 0 , 1 , if @isTablet then 1 else 5)

        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()

        



module.exports = OfferingsPage


