AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
animations = require './animations/partnershipdetails.coffee'
globalAnimations = require './animations/global.coffee'
FormHandler = require '../plugins/FormHandler.coffee'
        

class PartnershipDetailPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()

        # @resetHeight('#typeDescriptions', '#typeDescriptions li.group-info')
        
        if !@isPhone

            coaster = new FrameAnimation
                id:"partnership-details-coaster-1"
                el:"#partnership-details-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"

            coaster.loadFrames()

        else
            @resetHeight('#select-media-gallery', '#select-media-gallery li.group-info')
            
            
        sponsorshipTypes = new FadeGallery
            el:"#select-media-gallery"
            page: 'partnership-details'

        sponsorshipForm = new FormHandler
            el: '#partnership-contact-form'
            
        sponsorshipTypeDetails = new FadeGallery
            el:"#typeDescriptions"
            
        window.ddls = []

        window.ddls.push $('#PartnershipTypes-select').cfDropdown
            onSelect: (t) ->
                $('.title-bucket.seven h1').text($(t).text())
                id = $(t).data('id')
                sponsorshipTypes.goto id
                # sponsorshipTypeDetails.goto id

        window.ddls.push $('#PartnershipTypes1-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')

        window.ddls.push $('#PartnershipTypes2-select').cfDropdown
            onSelect: (t) ->
                id = $(t).data('id')
                ###numbers = new DraggableGallery
                    el:"#select"
                    across: 1###
  
        @findDeepLink()
  
    
    
    findDeepLink: =>
        location = window.location.href
        parts = location.split('/')
        lastpart = parts[parts.length - 1]
        
        if (lastpart == 'sponsorship') || (lastpart == 'experiential') || (lastpart == 'in-park-media')
            console.log 'lastpart: ', lastpart
            setTimeout (->
                $('#PartnershipTypes-select ul').trigger('click')
                $('#PartnershipTypes-select li[data-id="' + lastpart + '"]').trigger('click')
                $('#PartnershipTypes-select.drop-container').css('opacity', '1')
                $('#PartnershipTypes-select ul').prepend($('#PartnershipTypes-select li[data-id="' + lastpart + '"]'))
            ), 50

            
    resetHeight: (target, els) =>
        $(els).css('position', 'relative')
        h = $(els).eq(0).height()
        $(els).each (i, el) ->
            if h < $(el).height() then h = $(el).height()

        $(target).height(h)
        $(els).css('position', 'absolute')
        
    resetTimeline: =>
        super()

        @parallax.push globalAnimations.clouds("#section1", 0 , 1, if @isTablet then 1 else 5)


        if !@isPhone
            @triggers.push animations.topHeadline()
            @triggers.push animations.scrollCircle()
            @triggers.push animations.selectBox()


module.exports = PartnershipDetailPage


