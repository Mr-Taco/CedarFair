AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
FormHandler = require '../plugins/FormHandler.coffee'

animations = require './animations/groupsales.coffee'
globalAnimations = require './animations/global.coffee'
        

class GroupSalesPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        groupTypes = new FadeGallery
            el:".select-gallery"

        window.ddls = []

        @grouptypes = $('#grouptypes-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')
                groupTypes.goto id

        @formtypes = $('#programs-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')

        window.ddls.push @grouptypes
        window.ddls.push @formtypes

        window.ddls.push $('#parks-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')


        groupForm = new FormHandler
            el: '#group-sales-form'
            
           
        
        $('#form-opener').on 'click', =>
            console.log @formtypes.value
            console.log @grouptypes.value
            @formtypes.setToValue(@grouptypes.value);
            
        if !@isPhone
           
            coaster = new FrameAnimation
                id:"groups-coaster-1-a"
                el:"#group-sales-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-6/data.json"
                depth:8
            coaster.loadFrames()

            groups = new DraggableGallery
                el:"#group-sales-section2  #select-testimony"
                across: 1

            resizebuttons = new ResizeButtons

        else
            groups = new DraggableGallery
                el:"#group-sales-section2 #testimonials"
                across: 1

    
    resetTimeline: =>
        super()       

        @parallax.push globalAnimations.clouds("#section1", 0 , 1, if @isTablet then 1 else 5)



        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()
            @triggers.push animations.s2TopHeadline()
            @triggers.push animations.offeringsTestimonials()



module.exports = GroupSalesPage


