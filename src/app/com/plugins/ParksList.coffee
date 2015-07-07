
PluginBase = require '../abstract/PluginBase.coffee'
VideoOverlay = require './VideoOverlay.coffee'

class ParksList extends PluginBase

    constructor: (opts) ->
        @$el = $(opts.el)
        super(opts)         
        @gallery = opts.gallery
        if @gallery?
            @gallery.on "itemIndex" , @selectLogo
            
        @page = opts.page

    initialize: ->
        @parkLogos = $(@$el).find "li"
        @currentSelected = @parkLogos.filter(":first-child")
        if @gallery?
            @selectLogo @selectedLogo()
            @gallery.goto @selectedLogo(), true
        super()

    addEvents: ->
        @$el.on 'click', 'li.park', @handleLogoInteraction
        
        @parkLogos.each (i,t) =>
            logoEvents = new Hammer(t)
            logoEvents.on 'tap' , @handleLogoInteraction

    handleLogoInteraction: (e) =>
        if @page == 'accommodation'
            @parkLogos.removeClass 'selected'
            $(e.target).parents('li.park').addClass 'selected'
            whichPark = $(e.target).parents('li.park').attr('id')
            @showNewAccommodations(whichPark)
            return false
        
        $target = $(e.target).closest('li')

        id = $target.data('id')
        
        @displayContent id
        
        
    showNewAccommodations: (park) =>
        $('#accommodations-gallery .swiper-container').removeClass 'active'
        $('#accommodations-gallery .carousel-wrapper').removeClass 'active'
        $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').addClass 'active'
        $('#accommodations-gallery .swiper-container[data-logo="' + park + '"]').parent().addClass 'active'

    displayContent: (id) ->


        @selectLogo(id)

        #Switch Info Boxes
        @gallery.goto(id)


    selectLogo: (id) =>
        logoId = "##{id}-logo"
        @parkLogos.removeClass('selected')
        @parkLogos.filter(logoId).addClass('selected')


    selectedLogo: ->
        return @parkLogos.parent().find('li.selected').data('id');





module.exports = ParksList

