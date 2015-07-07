AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
animations = require './animations/ourparks.coffee'
globalAnimations = require './animations/global.coffee'
        

class OurParks extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)
        
 
    initialize: ->
        super()

    initComponents: ->
        super()

        if !@isPhone
            resizebuttons = new ResizeButtons

            coaster = new FrameAnimation
                id:"parks-coaster-1"
                el:"#parks-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"

            coaster.loadFrames()

            @parkGallery = new DraggableGallery
                el: "#our-parks-gallery"
                across: 1

            @parksGallery1 = new FadeGallery
                el: "#our-parks-gallery"
                
        else

            @parkGallery = new DraggableGallery
                el: "#our-parks-gallery"
                across: 1


        @parks = new ParksList
            el: "#our-parks-logos"
            gallery: @parkGallery

        @parkGallery.goto @parks.selectedLogo(), true
        @parkGallery.parkList = @parks
        
    resetTimeline: =>
        super()

        @parallax.push globalAnimations.clouds("#section1", 0 , 1 , if @isTablet then 1 else 5)

        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()
            @triggers.push animations.parksCarousel()
    #        @triggers.push animations.parksCarouselArrows()
    

 



module.exports = OurParks


