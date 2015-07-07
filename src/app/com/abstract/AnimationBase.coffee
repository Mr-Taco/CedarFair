
ViewBase = require "./ViewBase.coffee"
ScrollBar = require "../util/ScrollBar.coffee"
HeaderAnimation = require '../plugins/HeaderAnimation.coffee'
clouds = require '../pages/animations/clouds.coffee'

class AnimationBase extends ViewBase


    constructor: (el) ->
        super(el)
        @timeline = null
        @touchY = 0
        @touchYLast = 0
        @globalScrollAmount = if @isTablet then .5 else 1
        @prevScrollTo = 0
        @prevDelta = 0
        @currentProgress = 0
        @totalAnimationTime = 10
        @smoothMultiplier = 5
        @navTimer = null
        @video = null
        @inlineVideo = null
        @isTablet = $('html').hasClass('tablet')

    initialize: ->
        super()

        if !@isPhone  
            @resetTimeline()
            @toggleTouchMove()
            @onResize()
            @updateTimeline()

    initComponents: ->
        @header = new HeaderAnimation 
            el:'header'

    


    toggleTouchMove: () =>
        $(document).off 'scroll' , @onScroll
        
        @scroll =
            position: 0
            scrollTop: 0
        $(document).scroll @onScroll
        @onScroll()


    getScrollableArea: ->
        Math.abs($("#content").outerHeight() - @stageHeight)
    
    getScrollTop: ->
        $(document).scrollTop() / @getScrollableArea()     
    
    
    setScrollTop: (per) ->      
        pos = @getScrollableArea() * per
        window.scrollTo 0 , pos


    setDraggablePosition: (per) ->        
        pos = @getScrollableArea() * per        
        TweenMax.set $("#content") ,
            y: -pos 
            
            
    onScroll: (e) =>
        if $(document).scrollTop() > 30
            $('.circ-btn-wrapper').addClass 'invisible'
            
        @scroll.position = @getScrollTop()
        @scroll.scrollTop = $(document).scrollTop()
        @updateTimeline()        
        

    onDrag: (e) =>
        
        
        @scroll.position = Math.abs @scroll.y /  @getScrollableArea()
        @scroll.scrollTop = -@scroll.y
        
        
        
        @updateTimeline()


    onResize: =>
        super()
        if !@isTablet
            @resetTimeline()
            
        @centerOffset = (@stageHeight * .6667)
        if @scroll?
            pos = @scroll.position            
            @toggleTouchMove()
            if !@isTablet
                @setScrollTop(pos)
            

    resetTimeline: =>
        @timeline = new TimelineMax
        @triggers = []
        @parallax = []

        $('[data-cloud]').each (i,t) =>
            $el = $(t)
            $closestContainer = $el.closest('[data-cloud-container]')
            initPos = $closestContainer.data().cloudContainer.initPos
            
            
            cloudFunction = clouds
                $el:$el

            if initPos 
                cloudFunction(initPos)
                
            @parallax.push cloudFunction

    updateTimeline: =>
        
        @header.animateHeader(@scroll.scrollTop)

        for t in @triggers
            if @scroll.scrollTop > t.offset - @centerOffset
                t.a.play()
            else if @scroll.scrollTop + @stageHeight < t.offset
                t.a.paused(true)
                t.a.seek(0)


        for p in @parallax
            p(@scroll.position)







module.exports = AnimationBase
