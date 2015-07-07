AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
TickerList = require '../plugins/TickerList.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
BasicOverlay = require '../plugins/BasicOverlay.coffee'
animations = require './animations/home.coffee'
globalAnimations = require './animations/global.coffee'
async = require('async')

        

class HomePage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)
        
    initCoasters: ->
        cdnRoot = @cdnRoot
        if !@isPhone
            coasterTasks = []
            
            if !@isTablet
                c1 = new FrameAnimation
                    id:"home-coaster-1-a"
                    el:"#home-section1"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-1/data.json"
                    depth:20
                
                c2 = new FrameAnimation
                    id:"home-coaster-1-b"
                    el:"#home-section1"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-5/data.json"
                    depth:20

                c3 = new FrameAnimation
                    id:"home-coaster-3-a"
                    el:"#home-section3"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-3/data.json"

                c4 = new FrameAnimation
                    id:"home-coaster-3-b"
                    el:"#home-section3"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-4/data.json"

                c1.async = ->
                    coasterTasks.push (done) ->
                        c2.async = done
                        c2.loadFrames()
    
                    coasterTasks.push (done) ->
                        c3.async = done
                        c3.loadFrames()

                    coasterTasks.push (done) ->
                        c4.async = done
                        c4.loadFrames()
    
                    async.parallel coasterTasks , ->
                    console.log 'coasters loaded'
    
    
                c1.loadFrames()

            else
                c2 = new FrameAnimation
                    id:"home-coaster-1-b"
                    el:"#home-section1"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-5/data.json"
                    depth:20
                    
                c3 = new FrameAnimation
                    id:"home-coaster-3-a"
                    el:"#home-section3"
                    baseUrl: "#{cdnRoot}coasters/"
                    url: "shot-3/data.json"

                c2.async = ->
                    coasterTasks.push (done) ->
                        c3.async = done
                        c3.loadFrames()

                    async.parallel coasterTasks , ->
                    console.log 'coasters loaded'


                c2.loadFrames()
                 
          
                
        
    initComponents: ->
        super()

        @initCoasters()

        if !@isPhone
            
            seasonalGallery = new FadeGallery
                el: "#seasonal-video-gallery"

    
            groups = new DraggableGallery
                el:"#group-sales #select-testimony"
                across: 1
    
            accommodations = new DraggableGallery
                el: "#accomodations-video-carousel"
                across: 1

            accommodationsGallery = new FadeGallery
                el: "#accommodations-carousel"

            parksGallery = new FadeGallery
                el: "#our-parks-gallery"

            parks = new ParksList
                el:"#our-parks"
                gallery: parksGallery

            parksGallery.goto parks.selectedLogo(), true
            parksGallery.parkList = parks
            parksGallery.$target = $('#our-parks')
            
            resizebuttons = new ResizeButtons
            
        
        else
            
            parks = new DraggableGallery
                el:"#our-parks"
                across: 1


            jobs = new DraggableGallery
                el:"#jobs-section"
                across: 1

            groups = new DraggableGallery
                el:"#group-sales #select-testimony"
                across: 1
    
            accommodations = new DraggableGallery
                el: "#accomodations-video-carousel"
                across: 1

            seasonalGallery = new FadeGallery
                el: "#seasonal-video-gallery"

            accommodationsGallery = new FadeGallery
                el: "#accommodations-carousel"

          
        ticker = new TickerList
                el:"#stock-ticker"



    resetTimeline: =>
        super()
        
        if !@isPhone        
            @triggers.push animations.scrollCircle()
            @triggers.push animations.groups()
            @triggers.push animations.accomodations()
            @triggers.push animations.seasonal()

            if !@isTablet
                ### Removed these animations from ipad since they were choppy ###
                @triggers.push animations.parks()
                @triggers.push animations.jobs()


module.exports = HomePage


