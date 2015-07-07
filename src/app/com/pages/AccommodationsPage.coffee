AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'

animations = require './animations/accommodations.coffee'
globalAnimations = require './animations/global.coffee'
        

class AccommodationsPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        if !@isPhone

            
            coaster = new FrameAnimation
                id:"accommodations-coaster-1"
                el:"#accomodations-section1" 
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"
            coaster.loadFrames()
                

            @parks = new ParksList
                el: "#accommodations-select"
                gallery: @accommodations
                page: "accommodation"

            for carousel,i in $('#accommodations-gallery .swiper-container')
                if $(carousel).find('li').length > 1
                    @accommodations = new DraggableGallery
                        el: "#accommodations-gallery .carousel-wrapper." + i
                        across: 1
                        page: 'accommodations'
                else
                    $(carousel).find('li').css('width', '100%')
                    
            @accommodationVideos = new FadeGallery
                el: '#accommodations-gallery'

        else
            
            @parks = new DraggableGallery
                el: "#accommodations-select",
                control: '#accommodations-gallery'

            for carousel,i in $('#accommodations-gallery .swiper-container')
                if $(carousel).find('li').length > 1
                    @accommodations = new DraggableGallery
                        el: "#accommodations-gallery .carousel-wrapper." + i
                        across: 1

            @accommodationVideos = new FadeGallery
                el: '#accommodations-gallery'

    
    resetTimeline: =>
        super()

        #@parallax.push globalAnimations.clouds("#section1", 0 , 1 , if @isTablet then 1 else 5)

        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()
            @triggers.push animations.accommodationsCarousel()


        



module.exports = AccommodationsPage


