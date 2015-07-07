AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
InlineVideo = require '../plugins/InlineVideo.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
animations = require './animations/groupsales.coffee'
animations = require './animations/whoweare.coffee'
globalAnimations = require './animations/global.coffee'
        

class WhoWeArePage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        if !@isPhone

            video = new InlineVideo
                el: $('.player')


            coaster = new FrameAnimation
                id:"whoweare-coaster-1"
                el:"#whoweare-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"

            coaster.loadFrames()
                

        whoweare = new FadeGallery
            el: "#who-we-are"

    resetTimeline: =>
        super()

        @parallax.push globalAnimations.clouds("#section1", 0 , 1 , if @isTablet then 1 else 5)

        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.mainVideo()
            @triggers.push animations.bottomHeadline()
        



module.exports = WhoWeArePage


