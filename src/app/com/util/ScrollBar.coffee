
ViewBase = require "../abstract/ViewBase.coffee"

class ScrollBar extends ViewBase

    scrolling : false
    offsetY : 0
    position : 0
    hideTimeout: 0


    initialize: ->
        @onResize()
        @setEvents()

        if window.isTierTablet
            @$el.hide()



    setEvents: =>
        @delegateEvents
            "mousedown .handle" : "onHandleDown"
            #"mouseenter" : "onHandleUp"
            "click .rail" : "onRailClick"

        $(document).on "mouseup" , @onHandleUp
        $(document).on "mousemove" , @onMouseMove


        
    updateHandle: (pos) =>
        @position = pos
        @$el.find('.handle').css
            top: @position * ($(window).height() - @$el.find(".handle").height())
        @showScrollbar()
        @hideScrollbar()

    onRailClick: (e) =>
        @offsetY = if e.offsetY isnt undefined then e.offsetY else e.originalEvent.layerY
        @position = @offsetY / $(window).height()
        @trigger "customScrollJump" , @position
        


    onHandleDown: (e) =>

        @$el.css
            width:"100%"
        @offsetY = if e.offsetY isnt undefined then e.offsetY else e.originalEvent.layerY
        @scrolling = true

    onHandleUp: (e) =>
        @$el.css
            width:"15px"

        @scrolling = false

    onMouseMove: (e) =>
        if @scrolling

            if e.pageY - @offsetY <= 0
                $(".handle").css
                    top: 1
            else if e.pageY - @offsetY >= $(window).height() - $("#scrollbar .handle").height()
                

                $(".handle").css
                    top:   ($(window).height() - $("#scrollbar .handle").height()) - 1
            else
                $(".handle").css
                    top: e.pageY - @offsetY


            @position = parseInt($("#scrollbar .handle").css("top")) / ($(window).height() - $("#scrollbar .handle").height())

            if @position < parseFloat(.005)
                @position = 0
            else if @position > parseFloat(.995)
                @position = 1


            @trigger "customScroll" , @position
          
   
        if @mouseX isnt e.clientX and @mouseY isnt e.clientY
            @showScrollbar()
            @hideScrollbar()

        @mouseX = e.clientX
        @mouseY = e.clientY

    onResize: (e) =>


        @$el.find('.handle').css
            height: ($(window).height() / $("section").height() ) * $(window).height()

        @updateHandle(@position)


    hideScrollbar: =>
        if @hideTimeout?
            clearTimeout(@hideTimeout)
        

        @hideTimeout = setTimeout (=>
            if @mouseY > 72
                TweenMax.to @$el, .5 ,
                    autoAlpha: 0
            ) , 2000
        

    showScrollbar: =>
        TweenMax.to @$el , .5 ,
            autoAlpha: .5



module.exports = ScrollBar