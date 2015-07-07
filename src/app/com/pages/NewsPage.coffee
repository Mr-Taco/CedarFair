AnimationBase = require "../abstract/AnimationBase.coffee"
ParksList = require '../plugins/ParksList.coffee'
DraggableGallery = require '../plugins/DraggableGallery.coffee'
FadeGallery = require '../plugins/FadeGallery.coffee'
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
FrameAnimation = require '../plugins/coasters/FrameAnimation.coffee'
ResizeButtons = require '../plugins/ResizeButtons.coffee'
NewsRoom = require '../plugins/NewsRoom.coffee'
FormHandler = require '../plugins/FormHandler.coffee'

animations = require './animations/news.coffee'
globalAnimations = require './animations/global.coffee'
        

class NewsPage extends AnimationBase


    constructor: (el) ->
        @totalAnimationTime = 25
        super(el)

    initialize: ->
        super()

    initComponents: ->
        super()
        
        newsform = new FormHandler
            el: '#news-form'
        
        newsroom = new NewsRoom
            el: '#select-news',
            isPhone: @isPhone

        if !@isPhone

            coaster = new FrameAnimation
                id:"news-coaster-1"
                el:"#news-section1"
                baseUrl: "#{@cdnRoot}coasters/"
                url: "shot-2/data.json"
            coaster.loadFrames()
        else
            $('#news-select').cfDropdown
                onSelect: (t) ->
                    id = $(t).data('id')
                    newsroom.switchToPage id
                    
        $('.overlay-close-button, #basic-overlay').on 'click', @removeDeepLink
        $('a.news.story').on 'click', () ->
            lastpart = $(@).data 'link'
            history.pushState({id: lastpart}, '', '/news/article/' + lastpart);
        
        @findDeepLink()
        
    removeDeepLink: =>
        history.pushState({id: 'news'}, '', '/news');
        
    findDeepLink: =>

        location = window.location.href
        parts = location.split('/')
        
        if ($.inArray('article', parts) > -1)
            lastpart = parts[parts.length - 1]
            
            $('.post .news.story').each (i, o) ->
                if $(o).data('link') is lastpart
                    $('.news-year-wrapper').removeClass 'visible'
                    $(o).parents('.news-year-wrapper').addClass 'visible'
                    year = $(o).parents('.news-year-wrapper').data('year')
                    
                    $('.select-news-year-wrapper a').removeClass('active').each (i, a)->
                        if parseInt($(a).text()) is year
                            $(a).addClass 'active'
                    
                    $(o).trigger 'click'            
            
    resetTimeline: =>
        super()       

        #@parallax.push globalAnimations.clouds("#section1", 0 , 1, if @isTablet then 1 else 5)

        if !@isPhone
            @triggers.push animations.selectBox()




module.exports = NewsPage


