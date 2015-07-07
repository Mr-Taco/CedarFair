AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'

animations = require './animations/jobs.coffee'
globalAnimations = require './animations/global.coffee'
        

class JobsPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        jobTypes = new FadeGallery
            el:"#jobs-select-gallery"


        $('#jobtypes-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')
                jobTypes.goto id

        if !@isPhone

            coaster = new FrameAnimation
                id:"jobs-coaster-1-a"
                el:"#jobs-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"
            coaster.loadFrames()

            howManyJobs = $('#jobs-section2 .swiper-wrapper').data 'length'
            howManyJobs = if (howManyJobs > 3) then 3 else howManyJobs
                
            corporateJobs = new DraggableGallery
                el:"#jobs-gallery"
                across: howManyJobs
                page: 'jobs'

            parksGallery = new FadeGallery
                el: "#our-parks-gallery"

            parks = new ParksList
                el:"#our-parks-logos"
                gallery: parksGallery
                
           
            resizebuttons = new ResizeButtons

        else
            parkJobs = new DraggableGallery
                el:"#jobs-section1 #jobs"
                across: 1

            corporateJobs = new DraggableGallery
                el:"#jobs-section2 #jobs-gallery"
                across: 1

            parksGallery = new FadeGallery
                el: "#our-parks-gallery"
                
            @resetHeight('#jobs-section1 .swiper-container, #jobs-section1 .swiper-wrapper, #jobs-section1 .swiper-slide, #our-parks-gallery', '.section-inner #our-parks-gallery ul li .container')

    resetHeight: (target, els) =>
        h = $(els).eq(0).height()
        $(els).each (i, el) ->
            if h < $(el).height() then h = $(el).height()

        $(target).height(40+h)
        console.log 40+h

    resetTimeline: =>
        super()

        @parallax.push globalAnimations.clouds("#section1", 0 , 1 , if @isTablet then 1 else 5)



        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.parks()
            @triggers.push animations.selectBox()
            @triggers.push animations.s2TopHeadline()
            @triggers.push animations.testimonialCircles() 
        



module.exports = JobsPage


