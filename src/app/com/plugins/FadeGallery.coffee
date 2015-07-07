
PluginBase = require '../abstract/PluginBase.coffee'
VideoOverlay = require './VideoOverlay.coffee'

class FadeGallery extends PluginBase

    constructor: (opts) ->
        super(opts)


    initialize: (opts) ->
        
        console.log 'initialize: ', opts

        @page = opts.page or null
        target = opts.target or null
        
        if (target?)
            @$target = $(target)
        
        if !(@page == null)
            @infoBoxes = @$el.find "li.video"
        else
            @infoBoxes = @$el.find "li"
            
        @currentSelected = @infoBoxes.filter(":first-child")

        super()
    
    addEvents: ->  

        @infoBoxes.each (i,t) =>
            $btn = $(t).find('.video-button')

            if $btn.length > 0
                videoEvents = new Hammer($btn[0])
                videoEvents.on 'tap' , @handleVideoInteraction




    handleVideoInteraction: (e) =>

        $target = $(e.target).closest(".video-button")
        if ($target.size() is 0) 
            $target = e.target
        
        if $target.data('type') == 'image'
            if ($target.data('full'))
                @imageSrc = $target.data('full')
            else
                @imageSrc = $target.children('img').attr('src')
        data =
            mp4:$target.data('mp4')
            webm:$target.data('webm')
            poster:@imageSrc

        VideoOverlay.initVideoOverlay data


    goto: (id, initVal) ->
        infoId = "##{id}-info"

        if !(@page == null)
            target = @infoBoxes.parents('li.group-info')
        else
            target = @infoBoxes
        

        #Switch Info Boxes
        tl = new TimelineMax
        tl.add TweenMax.to target , .4 ,
            autoAlpha:0
            overwrite:"all"
        tl.add TweenMax.to target.filter(infoId) , .4 ,
            autoAlpha:1


        if (@$target?)
            console.log @$target
            
            top = @$target.offset().top - ($('header').height())
            console.log top
            pos = $('body').scrollTop()
            if (pos < top)
                $('body').animate { scrollTop: top }
  

module.exports = FadeGallery

