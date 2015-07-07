AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
animations = require './animations/partnerships.coffee'
globalAnimations = require './animations/global.coffee'
FormHandler = require '../plugins/FormHandler.coffee'
        

class PartnershipPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        sponsorshipForm = new FormHandler
            el: '#partnership-contact-form'
            
        if !@isPhone

            coaster = new FrameAnimation
                id:"sponsorship-coaster-1"
                el:"#sponsorship-section1" 
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"

            coaster.loadFrames()

#            sponsorTypes = new DraggableGallery
#                el: "#testimonials"
#                across: 3

            resizebuttons = new ResizeButtons

            numbers = new DraggableGallery
                el:"#select"
                across: 1

        else
            sponsorTypes = new DraggableGallery
                el: "#testimonials"
                across: 1

            numbers = new DraggableGallery
                el:"#select #thrilling-numbers-wrapper"
                across: 1


        window.ddls = []

        window.ddls.push $('#PartnershipTypes1-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')

        window.ddls.push $('#PartnershipTypes2-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')

    
    resetTimeline: =>
        super()

        @parallax.push globalAnimations.clouds("#section1", 0 , 1, if @isTablet then 1 else 5)


        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()
            @triggers.push animations.s2TopHeadline()
            @triggers.push animations.testimonialCircles()
        



module.exports = PartnershipPage


